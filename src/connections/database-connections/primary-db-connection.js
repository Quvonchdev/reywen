const mongoose = require('mongoose');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_PRIMARY_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_PRIMARY_PRODUCTION_URL;
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
const primaryDatabase = mongoose.createConnection(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoCreate: true,
});

// listen for connection events
primaryDatabase.on('connected', () => {
	console.log(`📦 Primary mongodb connected: ${NODE_ENV}`);
});

primaryDatabase.on('error', (err) => {
	console.log('❌ Primary mongodb connection error: ', err.message);
});

primaryDatabase.on('disconnected', () => {
	console.log('❌ Primary mongodb disconnected');
});

process.on('SIGINT', async () => {
	await primaryDatabase.close();
	process.exit(0);
});

// export the connection
module.exports = primaryDatabase;
