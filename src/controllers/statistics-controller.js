const primaryDatabase = require('../connections/database-connections/primary-db-connection');
const chatDatabase = require('../connections/database-connections/chat-db-connection');
const userDatabase = require('../connections/database-connections/user-db-connection');
const auctionDatabase = require('../connections/database-connections/auction-db-connection');
const transactionDatabase = require('../connections/database-connections/transaction-db-connection');
const smsEskiz = require('../utils/sms');
const ReturnResult = require('../helpers/return-result');

class StatisticsController {
	static all = async (req, res) => {
		const primaryStats = await primaryDatabase.db.stats();
		const chatStats = await chatDatabase.db.stats();
		const userStats = await userDatabase.db.stats();
		const auctionStats = await auctionDatabase.db.stats();
		const transactionStats = await transactionDatabase.db.stats();

		const smsNickName = await smsEskiz.getNickname();
		const smsUserInfo = await smsEskiz.getUserInfo();
		const eskizBalance = await smsEskiz.getBalance();

		return res.status(200).json(
			ReturnResult.success(
				{
					primaryStats,
					chatStats,
					userStats,
					auctionStats,
					transactionStats,
					eskiz: {
						smsNickName: smsNickName.data,
						smsUserInfo: smsUserInfo.data,
						eskizBalance: eskizBalance.data,
					}

				},
				'All statistics'
			)
		);
	};
}

module.exports = StatisticsController;
