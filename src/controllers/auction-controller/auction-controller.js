const { Auction } = require('../../models/auction-models/auction-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const { UserMessage } = require('../../models/user-models/user-message-model');
const ReturnResult = require('../../helpers/return-result');
const SmsEskiz = require('../../utils/sms');
const { smsTemplate } = require('../../configurations/sms-template');
const envSecretsConfig = require('../../configurations/env-secrets-config');
const { VerifyAuction } = require('../../models/auction-models/verify-auction-model');
const { Post } = require('../../models/post-models/post-model');
const randomstring = require('randomstring');
const { Participant } = require('../../models/auction-models/participants-model');

const MESSAGES = {
	getAuctions: (name) => `${name} get successfully`,
	notFound: (name) => `${name} not found! Please check your ${name} id`,
	getAuction: (name) => `${name} get successfully`,
	createAuction: (name) => `${name} created successfully!`,
	update: (name) => `${name} updated successfully`,
};

class AuctionController {
	static getAuctions = async (req, res) => {
		const auctions = await Auction.find();
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
			.skip((PAGE - 1) * LIMIT);

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

	static getAuctionsByUserId = async (req, res) => {
		const { userId, page, limit } = req.params;

		const PAGE = parseInt(page, 10) || 1;
		const LIMIT = parseInt(limit, 10) || 10;

		const auctions = await Auction.find({ createdBy: userId })
			.limit(LIMIT)
			.skip((PAGE - 1) * LIMIT);

		const totalItems = await Auction.countDocuments({ createdBy: userId });

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

		const user = await findUserById(createdBy);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const POST = await findPostById(post);

		if (!POST) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Post')));
		}

		// const validationError = validateAuctionData(startDate, endDate);
		// if (validationError) {
		//     return res.status(400).json(ReturnResult.errorMessage(validationError));
		// }

		const validationErrorBit = validateAuctionBit(bidIncrement, bidIncrementType);

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

		await auction.save();

		const verifyCode = createVerifyCode();
		await createAndSaveRandomVerifyAuction(createdBy, auction._id, verifyCode);

		const smsResult = await SmsEskiz.sendMessage(
			smsTemplate(verifyCode),
			user.phoneNumber,
			envSecretsConfig.ESKIZ_SMS_NICK,
			`${envSecretsConfig.CLIENT_REDIRECT_URL}/verify-account/${user._id}`
		).then((result) => {
			return result;
		});

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

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart) {
			return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		const { title, description } = req.body;

		auction.title = title;
		auction.description = description;

		await auction.save();

		return res.status(200).json(ReturnResult.success(auction, MESSAGES.update('Auction')));
	};

	static updateStartingDateAndEndDate = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { startDate, endDate } = req.body;

		const validationError = validateAuctionData(startDate, endDate);

		if (validationError) {
			return res.status(400).json(ReturnResult.errorMessage(validationError));
		}

		const user = await findUserById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('User')));
		}

		const auction = await findAuctionById(auctionId);

		if (!auction) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound('Auction')));
		}

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart) {
			return res.status(400).json(ReturnResult.errorMessage(isAuctionStart));
		}

		const startingDate = new Date(startDate);
		const endingDate = new Date(endDate);

		// delete auction from rabbitmq

		auction.startDate = startingDate;
		auction.endDate = endingDate;

		await auction.save();
		return res.status(200).json(ReturnResult.success(auction, MESSAGES.update('Auction')));
	};

	static updateBidIncrement = async (req, res) => {
		const { auctionId, userId } = req.params;
		const { bidIncrement, bidIncrementType } = req.body;

		const validationError = validateAuctionBit(bidIncrement, bidIncrementType);
		if (validationError) {
			return res.status(400).json(ReturnResult.errorMessage(validationError));
		}

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

		if (auction.createdBy != userId) {
			return res.status(401).json(ReturnResult.errorMessage('Unauthorized'));
		}

		auction.bidIncrement = bidIncrement;
		auction.bidIncrementType = bidIncrementType;

		await auction.save();

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

		const isAuctionStart = isAuctionStarted(auction.startDate);

		if (isAuctionStart == false) {
			return res.status(400).json(ReturnResult.errorMessage('Auction is not started yet!'));
		}

		const isVerified = checkIfAuctionIsVerified(auction.isVerified);

		if (isVerified) {
			return res.status(400).json(ReturnResult.errorMessage(isVerified));
		}

		auction.bidingUsers.push({ user: userId, price: bid });

		let currentPrice = auction.currentPrice;

		if (currentPrice == null) {
			auction.currentPrice = bid;
		} else {
			if (auction.bidIncrementType === 'fixed') {
				if (bid > currentPrice) {
					auction.currentPrice = bid;
				}
			}

			if (auction.bidIncrementType === 'percentage') {
				const percentage = (auction.bidIncrement / 100) * currentPrice;
				const total = currentPrice + percentage;

				if (bid > total) {
					auction.currentPrice = bid;
				}
			}
		}

		await auction.save();

		return res.status(200).json(ReturnResult.success(auction, 'Successfully bided'));
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
		});

		return schema.validate(reqBody);
	}
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

function validateAuctionData(startDate, endDate) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const now = new Date();

	if (start > end) {
		return 'End date must be greater than start date';
	}

	const hoursDifferenceStart = Math.floor((start - now) / (1000 * 60 * 60));
	if (hoursDifferenceStart < 6) {
		return 'Start date must be at least 6 hours greater than the current date';
	}

	const hoursDifferenceEnd = Math.floor((end - start) / (1000 * 60 * 60));
	if (hoursDifferenceEnd < 6) {
		return 'End date must be at least 6 hours greater than the start date';
	}

	return null;
}

function validateAuctionBit(bidIncrement, bidIncrementType) {
	if (bidIncrement < 1) {
		return 'Bid increment must be greater than 1';
	}

	if (bidIncrementType === 'percentage' && bidIncrement > 100) {
		return 'Bid increment must be less than 100';
	}

	return null;
}

function checkIfAuctionIsVerified(isVerified) {
	if (isVerified == false) {
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

async function isAuctionStarted(startDate) {
	const start = new Date(startDate);
	const now = new Date();

	if (start < now) {
		return true;
	}

	return false;
}

async function checkIfAuctionIsVerified(isVerified) {
	if (isVerified == false) {
		return 'Auction is not verified. Please verify auction first!';
	}

	return null;
}

module.exports = AuctionController;
