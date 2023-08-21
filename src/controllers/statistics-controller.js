const primaryDatabase = require('../connections/database-connections/primary-db-connection');
const chatDatabase = require('../connections/database-connections/chat-db-connection');
const userDatabase = require('../connections/database-connections/user-db-connection');
const logsDatabase = require('../connections/database-connections/logs-db-connection');
const auctionDatabase = require('../connections/database-connections/auction-db-connection');
const ReturnResult = require('../helpers/return-result');

class StatisticsController {
	static primary = async (req, res) => {
		const stats = await primaryDatabase.db.stats();

		res.status(200).json(ReturnResult.success(stats, 'Primary database statistics'));
	};

	static chat = async (req, res) => {
		const stats = await chatDatabase.db.stats();
		res.status(200).json(ReturnResult.success(stats, 'Chat database statistics'));
	};

	static user = async (req, res) => {
		const stats = await userDatabase.db.stats();
		res.status(200).json(ReturnResult.success(stats, 'User database statistics'));
	};

	static logs = async (req, res) => {
		const stats = await logsDatabase.db.stats();
		res.status(200).json(ReturnResult.success(stats, 'Logs database statistics'));
	};

	static auction = async (req, res) => {
		const stats = await auctionDatabase.db.stats();
		res.status(200).json(ReturnResult.success(stats, 'Auction database statistics'));
	};

	static all = async (req, res) => {
		const primaryStats = await primaryDatabase.db.stats();
		const chatStats = await chatDatabase.db.stats();
		const userStats = await userDatabase.db.stats();
		const logsStats = await logsDatabase.db.stats();
		const auctionStats = await auctionDatabase.db.stats();

		res.status(200).json(
			ReturnResult.success(
				{
					primaryStats,
					chatStats,
					userStats,
					logsStats,
					auctionStats,
				},
				'All database statistics'
			)
		);
	};
}

module.exports = StatisticsController;
