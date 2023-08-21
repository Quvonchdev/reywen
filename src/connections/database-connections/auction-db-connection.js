const mongoose = require('mongoose');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_AUCTION_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_AUCTION_PRODUCTION_URL;
const NODE_ENV = envSecretsConfig.NODE_ENV;

let connectionString = '';

if (NODE_ENV === 'development') {
	connectionString = LOCAL_URL;
} else if (NODE_ENV === 'production') {
	connectionString = PRODUCTION_URL;
} else {
	connectionString = LOCAL_URL;
}

// create a connection to the database
const auctionDatabase = mongoose.createConnection(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoCreate: true,
});

// listen for connection events
auctionDatabase.on('connected', () => {
	console.log(`📦 auction mongodb connected: ${NODE_ENV}`);
});

auctionDatabase.on('error', (err) => {
	console.log('❌ auction mongodb connection error: ', err.message);
});

auctionDatabase.on('disconnected', () => {
	console.log('❌ auction mongodb disconnected');
});

process.on('SIGINT', async () => {
	await auctionDatabase.close();
	process.exit(0);
});

// export the connection
module.exports = auctionDatabase;
