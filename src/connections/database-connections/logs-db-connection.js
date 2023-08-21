const mongoose = require('mongoose');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_LOGS_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_LOGS_PRODUCTION_URL;
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
const logsDatabase = mongoose.createConnection(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoCreate: true,
});

// listen for connection events
logsDatabase.on('connected', () => {
	console.log(`📦 log mongodb connected: ${NODE_ENV}`);
});

logsDatabase.on('error', (err) => {
	console.log('❌ log mongodb connection error: ', err.message);
});

logsDatabase.on('disconnected', () => {
	console.log('❌ log mongodb disconnected');
});

process.on('SIGINT', async () => {
	await logsDatabase.close();
	process.exit(0);
});

// export the connection
module.exports = logsDatabase;
