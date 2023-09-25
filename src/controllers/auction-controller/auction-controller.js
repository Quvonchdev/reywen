const { Auction } = require('../../models/auction-models/auction-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const ReturnResult = require('../../helpers/return-result');
const SmsEskiz = require('../../utils/sms');
const { smsTemplate } = require('../../configurations/sms-template');
const envSecretsConfig = require('../../configurations/env-secrets-config');
const { VerifyAuction } = require('../../models/auction-models/verify-auction-model');
const { Post } = require('../../models/post-models/post-model');
const randomstring = require('randomstring');
const { Participant } = require('../../models/auction-models/participants-model');
const { UserAuctionMessage } = require('../../models/user-models/user-auction-message-model');

const MESSAGES = {
	getAuctions: (name) => `${name} get successfully`,
	notFound: (name) => `${name} not found! Please check your ${name} id`,
	getAuction: (name) => `${name} get successfully`,
	createAuction: (name) => `${name} created successfully!`,
	update: (name) => `${name} updated successfully`,
};

let io;

class AuctionController {
	static setSocket(socket) {
		io = socket.getIO();
	}

	static getAuctions = async (req, res) => {
		const auctions = await Auction.find().populate(
			'createdBy',
			'fullName _id phoneNumber coverImage'
		);
		return res.status(200).json(ReturnResult.success(auctions, MESSAGES.getAuctions('Auctions')));
	};

	static getAuction = async (req, res) => {
		const { auctionId } = req.params;

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.getAuction('Auction')));
	};

	static getAuctionsByPagination = async (req, res) => {
		const { page, limit, filter, sort } = req.query;

		const PAGE = parseInt(page, 10) || 1;
		const LIMIT = parseInt(limit, 10) || 10;

		let query = {};
		let sortOptions = {};

		if (filter) {
			const filterParams = JSON.parse(filter);
			query = buildAuctionQuery(filterParams);
		}

		if (sort) {
			sortOptions = buildSortOptions(sort);
		}

		const auctions = await Auction.find(query)
			.sort(sortOptions)
			.limit(LIMIT)
			.skip((PAGE - 1) * LIMIT)
			.populate('createdBy', 'fullName _id phoneNumber coverImage');

		const totalItems = auctions.length;

		return res
			.status(200)
			.json(
				ReturnResult.success(
					ReturnResult.paginate(auctions, totalItems, PAGE, LIMIT),
					MESSAGES.getAuctions('Auctions')
				)
			);
	};

	static createAuction = async (req, res) => {
		const { error } = Validation.create(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const {
			title,
			description,
			post,
			startPrice,
			bidIncrement,
			bidIncrementType,
			startDate,
			endDate,
			createdBy,
		} = req.body;

		// check if user exists
		const user = await findUserById(createdBy);
		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		// check if post exists
		const POST = await findPostById(post);
		if (!POST) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Post')));
		}

		// validate auction data
		const validationDateError = validateAuctionData(startDate, endDate);
		if (validationDateError) {
			return res.status(400).json(ReturnResult.errorMessage(validationDateError));
		}

		// validate bid increment
		const validationErrorBit = validateAuctionBit(bidIncrement, bidIncrementType, startPrice);
		if (validationErrorBit) {
			return res.status(400).json(ReturnResult.errorMessage(validationErrorBit));
		}

		const auction = new Auction({
			title,
			description,
			post,
			startPrice,
			bidIncrement,
			bidIncrementType,
			startDate,
			endDate,
			createdBy,
		});

		// before sending sms, save auction to database
		await auction.save();

		// send sms to user to verify auction
		const verifyCode = createVerifyCode();
		await createAndSaveRandomVerifyAuction(createdBy, auction._id, verifyCode);
		const smsResult = await sendSms(verifyCode, user);

		const resultMessage = {
			data: MESSAGES.createAuction('Auction'),
			smsResult: smsResult.data.message,
		};

		return res.status(200).json(ReturnResult.success(auction, resultMessage));
	};

	static VerifyAuction = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { verifyCode } = req.body;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound));
		}

		const verifyAuction = await VerifyAuction.findOne({
			auction: auctionId,
			user: userId,
			verifyCode: verifyCode,
		});

		if (!verifyAuction) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage("Verification code isn't valid. Please try again!"));
		}

		auction.isVerified = true;
		await auction.save();
		await VerifyAuction.deleteMany({ auction: auctionId, user: userId });

		return res.status(200).json(ReturnResult.success(auction, 'Auction verified successfully'));
	};

	static resendVerifyCode = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound));
		}

		// delete all verify codes
		await VerifyAuction.deleteMany({ auction: auctionId, user: userId });

		const verifyCode = createVerifyCode();
		await createAndSaveRandomVerifyAuction(userId, auctionId, verifyCode);
		const smsResult = await sendSms(verifyCode, user);

		return res.status(200).json(ReturnResult.success(auction, smsResult.data.message));
	};

	static updateAuction = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { error } = Validation.update(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const user = await findUserById(userId);
		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound));
		}

		const auction = await findAuctionById(auctionId);
		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound));
		}

		if (auction.bidingUsers.length > 0) {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage(
						'Auction already played! You can not change date. Please create new auction'
					)
				);
		}

		if (auction.status === 'active' || auction.status === 'completed') {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage('You can not update auction because it is active or completed')
				);
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		const validationStartDateError = isAuctionStarted(auction.startDate);
		if (validationStartDateError) {
			return res.status(400).json(ReturnResult.errorMessage(validationStartDateError));
		}

		const { title, description, startPrice } = req.body;

		const checkTitle = await Auction.findOne({ title: title });

		if (checkTitle) {
			return res.status(400).json(ReturnResult.errorMessage('Title already exists'));
		}

		if (auction.status === 'active' || auction.status === 'completed') {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage('You can not update auction because it is active or completed')
				);
		}

		auction.title = title;
		auction.description = description;
		auction.startPrice = startPrice;

		await auction.save();

		// send message to participants
		await sendMessageToParticipants(auctionId, 'Auction has been updated');

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.update('Auction')));
	};

	static updateStartingDateAndEndDate = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { startDate, endDate } = req.body;

		const user = await findUserById(userId);
		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);
		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		// if(auction.bidingUsers.length > 0) {
		// 	return res.status(400).json(ReturnResult.errorMessage('Auction already played! You can not change date. Please create new auction'));
		// }

		// if(auction.status === 'active' || auction.status === 'completed') {
		// 	return res.status(400).json(ReturnResult.errorMessage('You can not update auction because it is active or completed'));
		// }

		// const validationStartDateError = isAuctionStarted(auction.startDate);
		// if (validationStartDateError) {
		// 	return res.status(400).json(ReturnResult.errorMessage(validationStartDateError));
		// }

		const startingDate = new Date(startDate);
		const endingDate = new Date(endDate);

		const validationDateError = validateAuctionData(startingDate, endingDate);
		if (validationDateError) {
			return res.status(400).json(ReturnResult.errorMessage(validationDateError));
		}

		auction.startDate = startingDate;
		auction.endDate = endingDate;
		auction.status = 'inactive';

		await auction.save();

		// send message to participants
		await sendMessageToParticipants(auctionId, 'Auction date has been changed');

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.update('Auction')));
	};

	static updateStartingDateAndEndDateNoParticipation = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { startDate, endDate } = req.body;

		const user = await findUserById(userId);
		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const participants = await Participant.find({ auction: auctionId, isVerified: true });
		if (participants.length > 0) {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage(
						'You can not change date because participants are already in this auction'
					)
				);
		}

		const auction = await findAuctionById(auctionId);
		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		if (auction.bidingUsers.length > 0) {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage(
						'Auction already played! You can not change date. Please create new auction'
					)
				);
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		if (auction.status === 'active' || auction.status === 'completed') {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage('You can not update auction because it is active or completed')
				);
		}

		const startingDate = new Date(startDate);
		const endingDate = new Date(endDate);

		const validationDateError = validateAuctionData(startingDate, endingDate);
		if (validationDateError) {
			return res.status(400).json(ReturnResult.errorMessage(validationDateError));
		}

		auction.startDate = startingDate;
		auction.endDate = endingDate;
		auction.status = 'inactive';

		await auction.save();

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.update('Auction')));
	};

	static updateBidIncrement = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { bidIncrement, bidIncrementType } = req.body;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		if (auction.bidingUsers.length > 0) {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage(
						'Auction already played! You can not change date. Please create new auction'
					)
				);
		}

		const validationError = validateAuctionBit(bidIncrement, bidIncrementType, auction.startPrice);
		if (validationError) {
			return res.status(400).json(ReturnResult.errorMessage(validationError));
		}

		if (auction.status === 'active' || auction.status === 'completed') {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage('You can not update auction because it is active or completed')
				);
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		auction.bidIncrement = bidIncrement;
		auction.bidIncrementType = bidIncrementType;

		await auction.save();

		// send message to participants
		await sendMessageToParticipants(auctionId, 'Auction bid increment has been changed');

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.update('Auction')));
	};

	// play auction
	static playAuction = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { bid } = req.body;

		const user = await Participant.findOne({
			auction: auctionId,
			user: userId,
			isParticipating: true,
			isVerified: true,
		});

		if (!user) {
			return res
				.status(404)
				.json(
					ReturnResult.errorMessage(
						"You can't participate in this auction! Please verify auction first!"
					)
				);
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		if (auction.status === 'inactive' || auction.status === 'completed') {
			return res.status(400).json(ReturnResult.errorMessage('Auction is not active!'));
		}

		if (auction.isVerified == false) {
			return res
				.status(400)
				.json(
					ReturnResult.errorMessage('Auction is not verified! Please tell admin to verify auction')
				);
		}

		const bidIncrement = auction.bidIncrement;
		const bidIncrementType = auction.bidIncrementType;
		const startPrice = auction.startPrice;

		if (bid < startPrice) {
			return res
				.status(400)
				.json(ReturnResult.errorMessage('Bid must be greater than start price'));
		}

		if (auction.currentPrice) {
			if (bid <= auction.currentPrice) {
				return res
					.status(400)
					.json(ReturnResult.errorMessage('Bid must be greater than current price'));
			}
		}
		let userIncrement = 0;

		if (bidIncrementType === 'fixed') {
			let total = 0;

			if (!auction.currentPrice) {
				total = startPrice + bidIncrement;
			} else {
				total = auction.currentPrice + bidIncrement;
			}

			if (bid < total) {
				return res
					.status(400)
					.json(
						ReturnResult.errorMessage(
							`Bid must be greater than start price and ${bidIncrement} of start price`
						)
					);
			}
		} else if (bidIncrementType === 'percentage') {
			const percentage = (bidIncrement / 100) * startPrice;
			let total = 0;
			if (!auction.currentPrice) {
				total = startPrice + percentage;
			} else {
				total = auction.currentPrice + percentage;
			}

			if (bid < total) {
				return res
					.status(400)
					.json(
						ReturnResult.errorMessage(
							`Bid must be greater than start price and ${bidIncrement}% of start price. Minimum bid is ${total}`
						)
					);
			}
		}

		if (auction.currentPrice) {
			userIncrement = bid - auction.currentPrice;
		} else {
			userIncrement = bid - auction.startPrice;
		}
		auction.currentPrice = bid;

		auction.bidingUsers.push({ user: userId, price: bid, increment: userIncrement });

		let isEndDateUpdated = false;

		if (isEndDateUpdated == false) {
			const endDate = new Date(auction.endDate);
			const bidDate = new Date(auction.bidingUsers[auction.bidingUsers.length - 1].bitDate);
			const difference = (endDate - bidDate) / 1000 / 60;
			if (difference < 5) {
				const newEndDate = new Date(endDate.getTime() + 15 * 60000);
				auction.endDate = newEndDate;
			}
			isEndDateUpdated = true;
		}

		await auction.save();

		if (io) {
			io.emit('auction', {
				currentPrice: auction.currentPrice,
				bidingUsers: auction.bidingUsers,
				endDate: auction.endDate,
				_id: auction._id,
				startPrice: auction.startPrice,
			});
		}

		return res.status(200).json(ReturnResult.success(auction, 'Successfully bided'));
	};

	static participateInAuction = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		// const isAuctionStart = isAuctionStarted(auction.startDate);

		// if (!isAuctionStart) {
		// 	return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		// }

		const verify = auction.isVerified;
		const isVerified = checkIfAuctionIsVerified(verify);
		if (!isVerified) {
			return res.status(400).json(ReturnResult.errorMessage('Hello'));
		}

		const isParticipating = await Participant.findOne({
			auction: auctionId,
			user: userId,
			isParticipating: true,
		});

		if (isParticipating) {
			return res
				.status(400)
				.json(ReturnResult.errorMessage('You are already participating in this auction'));
		}

		const participant = new Participant({
			auction: auctionId,
			user: userId,
			isParticipating: true,
		});

		await participant.save();

		return res.status(200).json(ReturnResult.success(auction, 'Successfully participated'));
	};

	static verifyParticipation = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		if (auction.status === 'active' || auction.status === 'completed') {
			return res.status(400).json(ReturnResult.errorMessage('Please wait for next auction'));
		}

		// const isAuctionStart = isAuctionStarted(auction.startDate);

		// if (isAuctionStart) {
		// 	return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		// }

		// const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		// if (isVerified) {
		// 	return res.status(400).json(ReturnResult.errorMessage(isVerified));
		// }

		const participant = await Participant.findOne({
			auction: auctionId,
			user: userId,
			isParticipating: true,
		});

		if (!participant) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage('You are not participating in this auction'));
		}

		participant.isVerified = true;
		await participant.save();

		return res.status(200).json(ReturnResult.success(auction, 'Successfully verified'));
	};

	static getParticipants = async (req, res) => {
		const { auctionId } = req.params;

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const participants = await Participant.find({ auction: auctionId }).populate(
			'user',
			'fullName _id phoneNumber coverImage'
		);

		return res.status(200).json(ReturnResult.success(participants, 'Successfully verified'));
	};

	static getParticipantsByPagination = async (req, res) => {
		const { auctionId, page, limit } = req.params;

		const PAGE = parseInt(page, 10) || 1;
		const LIMIT = parseInt(limit, 10) || 10;

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const participants = await Participant.find({ auction: auctionId })
			.limit(LIMIT)
			.skip((PAGE - 1) * LIMIT)
			.populate('user', 'fullName _id phoneNumber coverImage');

		const totalItems = await Participant.countDocuments({ auction: auctionId });

		return res
			.status(200)
			.json(
				ReturnResult.success(
					ReturnResult.paginate(participants, totalItems, PAGE, LIMIT),
					'Successfully verified'
				)
			);
	};

	static getParticipantsByUserId = async (req, res) => {
		const { auctionId, userId } = req.params;

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const participants = await Participant.find({ auction: auctionId, user: userId }).populate(
			'user',
			'fullName _id phoneNumber coverImage'
		);

		return res.status(200).json(ReturnResult.success(participants, 'Successfully verified'));
	};

	static removeParticipantByAdmin = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const participant = await Participant.findOne({
			auction: auctionId,
			user: userId,
			isParticipating: true,
		});

		if (!participant) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage('User is not participating in this auction'));
		}

		participant.isParticipating = false;
		await participant.save();

		return res.status(200).json(ReturnResult.success(auction, 'Successfully removed'));
	};

	static leaveAuction = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart) {
			return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		}

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		const participant = await Participant.findOne({
			auction: auctionId,
			user: userId,
			isParticipating: true,
		});

		if (!participant) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage('You are not participating in this auction'));
		}

		participant.isParticipating = false;
		await participant.save();

		return res.status(200).json(ReturnResult.success(auction, 'Successfully removed'));
	};

	static participantsCount = async (req, res) => {
		const { auctionId } = req.params;

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const participants = await Participant.countDocuments({ auction: auctionId });

		return res.status(200).json(ReturnResult.success(participants, 'Successfully verified'));
	};

	static participateInAuctionAgain = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart) {
			return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		}

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		const isParticipating = await Participant.findOne({
			auction: auctionId,
			user: userId,
		});

		if (isParticipating.isParticipating === true) {
			return res
				.status(400)
				.json(ReturnResult.errorMessage('You are already participating in this auction'));
		}

		isParticipating.isParticipating = true;

		await isParticipating.save();

		return res.status(200).json(ReturnResult.success(auction, 'Successfully participated'));
	};

	static deleteAuction = async (req, res) => {
		const { auctionId, userId } = req.params;

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart) {
			return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		}

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (!isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		await Auction.findByIdAndDelete(auctionId);

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.delete('Auction')));
	};

	static deleteAuctionByAdmin = async (req, res) => {
		const { auctionId } = req.params;

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart) {
			return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		}

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (!isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		await Auction.findByIdAndDelete(auctionId);

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.delete('Auction')));
	};
}

class Validation {
	static create(reqBody) {
		const schema = Joi.object({
			title: Joi.alternatives(Joi.string(), Joi.object()).required(),
			description: Joi.alternatives(Joi.string(), Joi.object()).optional(),
			post: Joi.string().required(),
			startPrice: Joi.number().required(),
			bidIncrement: Joi.number().required(),
			bidIncrementType: Joi.string().required().valid('fixed', 'percentage'),
			startDate: Joi.date().required(),
			endDate: Joi.date().required(),
			createdBy: Joi.string().required(),
		});

		return schema.validate(reqBody);
	}

	static update(reqBody) {
		const schema = Joi.object({
			title: Joi.alternatives(Joi.string(), Joi.object()).optional(),
			description: Joi.alternatives(Joi.string(), Joi.object()).optional(),
			startPrice: Joi.number().optional(),
		});

		return schema.validate(reqBody);
	}
}

function validateAuctionData(startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const now = new Date();

	if (start > end) {
		return 'End date must be greater than start date';
	}

	if (start < now) {
		return 'Start date must be greater than current date';
	}

	// const hoursDifferenceStart = Math.floor((start - now) / (1000 * 60 * 60));
	// if (hoursDifferenceStart < 6) {
	// 	return 'Start date must be at least 6 hours greater than the current date';
	// }

	// const hoursDifferenceEnd = Math.floor((end - start) / (1000 * 60 * 60));
	// if (hoursDifferenceEnd < 6) {
	// 	return 'End date must be at least 6 hours greater than the start date';
	// }

	return null;
}

function validateAuctionBit(bidIncrement, bidIncrementType, startPrice) {
	if (bidIncrement < 1) {
		return 'Bid increment must be greater than 1';
	}

	if (bidIncrement > startPrice) {
		return 'Bid increment must be less than start price';
	}

	if (bidIncrementType === 'percentage' && bidIncrement > 100) {
		return 'Bid increment must be less than 100';
	}

	return null;
}

function checkIfAuctionIsVerified(isVerified) {
	if (isVerified === false) {
		return 'Auction is not verified. Please verify auction first!';
	}

	return null;
}

function isAuctionStarted(startDate) {
	const start = new Date(startDate);
	const now = new Date();

	if (start < now) {
		return 'Auction is already started';
	}

	return null;
}

function buildAuctionQuery(filterParams) {
	const query = {};

	if (filterParams.startDate) {
		query.startDate = { $gte: new Date(filterParams.startDate) };
	}

	if (filterParams.endDate) {
		if (query.startDate) {
			query.startDate.$lte = new Date(filterParams.endDate);
		} else {
			query.startDate = { $lte: new Date(filterParams.endDate) };
		}
	}

	if (filterParams.startPrice) {
		query.startPrice = {};

		if (filterParams.startPrice.min) {
			query.startPrice.$gte = filterParams.startPrice.min;
		}

		if (filterParams.startPrice.max) {
			query.startPrice.$lte = filterParams.startPrice.max;
		}
	}

	if (filterParams.status) {
		query.status = filterParams.status;

		if (filterParams.status === 'active') {
			query.endDate = { $gte: new Date() };
		}

		if (filterParams.status === 'completed') {
			query.endDate = { $lte: new Date() };
		}

		if (filterParams.status === 'inactive') {
			query.endDate = { $gte: new Date() };
		}
	}

	if (filterParams.createdBy) {
		query.createdBy = filterParams.createdBy;
	}

	if (filterParams.isVerified) {
		query.isVerified = filterParams.isVerified;
	}

	if (filterParams.isPayed) {
		query.isPayed = filterParams.isPayed;
	}

	return query;
}

function buildSortOptions(sortParam) {
	const sortOptions = {};

	if (sortParam) {
		const fields = sortParam.split(',');

		fields.forEach((field) => {
			const sortOrder = field.startsWith('-') ? -1 : 1;
			const fieldName = field.replace(/^-/, '');

			sortOptions[fieldName] = sortOrder;
		});
	}

	return sortOptions;
}

// CREATE VERIFY CODE AND SAVE TO DATABASE
async function createAndSaveRandomVerifyAuction(userId, auctionId, verifyCode) {
	return await new VerifyAuction({
		verifyCode: verifyCode,
		user: userId,
		auction: auctionId,
	}).save();
}

// CREATE RANDOM VERIFY CODE FOR ACCOUNT VERIFICATION
function createVerifyCode() {
	return randomstring.generate({
		length: 4,
		charset: 'numeric',
	});
}

// FIND BY ID
async function findAuctionById(auctionId) {
	return await Auction.findById(auctionId);
}

async function findPostById(postId) {
	return await Post.findById(postId);
}

async function findUserById(userId) {
	return await User.findById(userId);
}

async function sendMessageToParticipants(auctionId, message) {
	const participants = await Participant.find({ auction: auctionId, isVerified: true });

	if (participants.length > 0) {
		participants.forEach(async (participant) => {
			const user = await findUserById(participant.user);

			if (!user) {
				return;
			}

			const MESSAGE = new UserAuctionMessage({
				user: participant.user,
				auction: auctionId,
				message: message,
			});
			await MESSAGE.save();
		});
	}
}

async function sendSms(verifyCode, user) {
	return await SmsEskiz.sendMessage(
		smsTemplate(verifyCode),
		user.phoneNumber,
		envSecretsConfig.ESKIZ_SMS_NICK,
		`${envSecretsConfig.CLIENT_REDIRECT_URL}/verify-account/${user._id}`
	).then((result) => {
		return result;
	});
}

module.exports = AuctionController;
