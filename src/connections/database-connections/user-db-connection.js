const mongoose = require('mongoose');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_USER_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_USER_PRODUCTION_URL;
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
const userDatabase = mongoose.createConnection(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoCreate: true,
});

// listen for connection events
userDatabase.on('connected', () => {
	console.log(`📦 user mongodb connected: ${NODE_ENV}`);
});

userDatabase.on('error', (err) => {
	console.log('❌ user mongodb connection error: ', err.message);
});

userDatabase.on('disconnected', () => {
	console.log('❌ user mongodb disconnected');
});

process.on('SIGINT', async () => {
	await userDatabase.close();
	process.exit(0);
});

// export the connection
module.exports = userDatabase;
