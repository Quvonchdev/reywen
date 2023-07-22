const mongoose = require('mongoose');

const LOCAL_URL = 'mongodb://127.0.0.1:27017/Uyer';
const PRODUCTION_URL = process.env.MONGODB_PRODUCTION_URL;

let connectionString = '';

if (process.env.NODE_ENV === 'development') {
	connectionString = LOCAL_URL;
} else if (process.env.NODE_ENV === 'production') {
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
				console.log(`📦 MongoDB Connected: ${process.env.NODE_ENV}`);
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
		console.log('❌ MongoDB Connection Error: ', err.message);
	}
};
