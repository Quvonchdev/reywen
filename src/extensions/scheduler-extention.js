const cron = require('node-cron');
const { scheduleInactiveAuctions } = require('../utils/auction-status');

const scheduleAuctionStatus = () => {
	// Run every 1 minute
	cron.schedule('*/1 * * * *', async () => {
		await scheduleInactiveAuctions();
	});
};

module.exports = scheduleAuctionStatus;
