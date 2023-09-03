const mongoose = require('mongoose');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_TRANSACTION_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_TRANSACTION_PRODUCTION_URL;
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
const transactionDatabase = mongoose.createConnection(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoCreate: true,
});

// listen for connection events
transactionDatabase.on('connected', () => {
	console.log(`📦 transaction mongodb connected: ${NODE_ENV}`);
});

transactionDatabase.on('error', (err) => {
	console.log('❌ transaction mongodb connection error: ', err.message);
});

transactionDatabase.on('disconnected', () => {
	console.log('❌ transaction mongodb disconnected');
});

process.on('SIGINT', async () => {
	await transactionDatabase.close();
	process.exit(0);
});

// export the connection
module.exports = transactionDatabase;
