const { Auction } = require('../models/auction-models/auction-model');
const { WinnerAuction } = require('../models/auction-models/winner-model');
const { Participant } = require('../models/auction-models/participants-model');
const { UserAuctionMessage } = require('../models/user-models/user-auction-message-model');

const auctionStatus = {
	inactive: 'inactive',
	active: 'active',
	completed: 'completed',
};

const LIMIT = 15;

const scheduleInactiveAuctions = async () => {
	const totalPages = await calculateTotalPagesOfInactiveAuctions(LIMIT);

	if (totalPages === 0) {
		return;
	}

	for (let page = 1; page <= totalPages; page++) {
		const auctions = await getAllAuctionsStatusInactivePage(page);

		auctions.forEach(async (auction) => {
			const auctionStartDate = new Date(auction.startDate);
			const auctionEndDate = new Date(auction.endDate);
			const currentDate = new Date();
			const participants = await Participant.find({
				auction: auction._id,
				isParticipating: true,
				isVerified: true,
			});

			if (currentDate > auctionEndDate) {
				await updateAuctionStatus(auction._id, auctionStatus.completed);
				if (participants.length > 0) {
					await findAuctionWinner(auction);
				} else {
					await sendUserAuctionMessage(auction);
				}
			} else if (currentDate > auctionStartDate) {
				if (participants.length > 0) {
					await updateAuctionStatus(auction._id, auctionStatus.active);
				} else {
					await sendUserAuctionMessage(auction);
					await updateAuctionStatus(auction._id, auctionStatus.completed);
				}
			}
		});
	}
};

const findAuction = async (auctionId) => {
	const auction = await Auction.findById(auctionId);
	if (!auction) {
		return;
	}
	return auction;
};

const getAllAuctionsStatusInactivePage = async (page = 1, limit = LIMIT) => {
	return await Auction.find({
		$and: [
			{ $or: [{ status: auctionStatus.active }, { status: auctionStatus.inactive }] },
			{ status: { $ne: auctionStatus.completed } },
		],
		isVerified: true,
	})
		.limit(limit)
		.skip((page - 1) * limit);
};

const calculateTotalPagesOfInactiveAuctions = async (limit) => {
	const auctions = await Auction.find({
		$and: [
			{ $or: [{ status: auctionStatus.active }, { status: auctionStatus.inactive }] },
			{ status: { $ne: auctionStatus.completed } },
		],
		isVerified: true,
	});
	const totalPages = Math.ceil(auctions.length / limit);
	return totalPages;
};

const updateAuctionStatus = async (auctionId, status) => {
	const auction = await findAuction(auctionId);
	if (!auction) {
		return;
	}
	auction.status = status;
	await auction.save();
};

const findAuctionWinner = async (auction) => {
	const bidingUsers = auction.bidingUsers;

	if (bidingUsers.length === 0) {
		return;
	}

	bidingUsers.sort((a, b) => {
		return b.price - a.price;
	});

	const winner = bidingUsers[0];
	const secondHighestBid = bidingUsers[1];

	const findWinners = await WinnerAuction.findOne({ auction: auction._id });

	if (findWinners) {
		return;
	}

	await sendMessageToWinner(auction, winner);
	const winnerAuction = new WinnerAuction({
		auction: auction._id,
		winners: [
			{
				user: winner.user,
				price: winner.price,
			},
			{
				user: secondHighestBid.user,
				price: secondHighestBid.price,
			},
		],
	});

	await winnerAuction.save();
};

async function sendMessageToWinner(auction, winner) {
	const checkMessage = await UserAuctionMessage.findOne({
		receiver: winner.user,
		auction: auction._id,
	});

	if (!checkMessage) {
		const Message = await UserAuctionMessage({
			message: `Congratulations you have won the auction ${auction.title}. Please verify auction! Thank you`,
			receiver: winner.user,
			auction: auction._id,
		});

		await Message.save();
	}
}

async function sendUserAuctionMessage(auction) {
	const Message = await UserAuctionMessage.findOne({
		receiver: auction.createdBy,
		auction: auction._id,
	});

	if (!Message) {
		const userAuctionMessage = new UserAuctionMessage({
			message: `Your auction ${auction.title} has been completed without any participants. Please check your auction. Update your auction start date and end date also status. Thank you`,
			receiver: auction.createdBy,
			auction: auction._id,
		});
		await userAuctionMessage.save();
	}
}

module.exports = {
	scheduleInactiveAuctions,
};
