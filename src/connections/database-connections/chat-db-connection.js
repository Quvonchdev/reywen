const mongoose = require('mongoose');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_CHAT_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_CHAT_PRODUCTION_URL;
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
const chatDatabase = mongoose.createConnection(connectionString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoCreate: true,
});

// listen for connection events
chatDatabase.on('connected', () => {
	console.log(`📦 chat mongodb connected: ${NODE_ENV}`);
});

chatDatabase.on('error', (err) => {
	console.log('❌ chat mongodb connection error: ', err.message);
});

chatDatabase.on('disconnected', () => {
	console.log('❌ chat mongodb disconnected');
});

process.on('SIGINT', async () => {
	await chatDatabase.close();
	process.exit(0);
});

// export the connection
module.exports = chatDatabase;
