const mongoose = require('mongoose');
const envSecretsConfig = require('../configurations/env-secrets-config');

const LOCAL_URL = envSecretsConfig.MONGODB_LOCAL_URL;
const PRODUCTION_URL = envSecretsConfig.MONGODB_PRODUCTION_URL;
const NODE_ENV = envSecretsConfig.NODE_ENV;

let connectionString = '';

if (NODE_ENV === 'development') {
	connectionString = LOCAL_URL;
} else if (NODE_ENV === 'production') {
	connectionString = PRODUCTION_URL;
} else {
	connectionString = LOCAL_URL;
}

module.exports = async function mongodbConnection() {
	try {
		mongoose.set('strictQuery', false);

		await mongoose
			.connect(`${connectionString}`, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				serverSelectionTimeoutMS: 10000,
			})
			.then(() => {
				console.log(`📦 MongoDB Connected: ${NODE_ENV}`);
			})
			.catch((err) => {
				console.log('❌ MongoDB Connection Error: ', err.message);
			});

		mongoose.connection.on('error', (err) => {
			console.log('❌ MongoDB Connection Error: ', err.message);
		});

		mongoose.connection.on('disconnected', () => {
			console.log('❌ MongoDB Disconnected');
		});

		process.on('SIGINT', async () => {
			await mongoose.connection.close();
			process.exit(0);
		});
	} catch (err) {
		console.log('❌ MongoDB Connection Error: ', err);
	}
};
