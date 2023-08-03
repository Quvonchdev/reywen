const mongoose = require('mongoose');
const mongodbConnection = require('../connections/mongodb-connection');

// commands to drop collections
// npm start drop-db or npm start drop-db:prod

(async () => {
	await mongodbConnection();
	// it is very dangerous to drop all collections
	// await dropAllCollections();

	// await  dropRegionsCollection();
	// await  dropDistrictsCollection();
	// await  dropZonesCollection();
	// await  dropUsersCollection();
	// await  dropVerifyCodesCollection();

	process.exit(0);
})();

async function dropRegionsCollection() {
	try {
		(async () => {
			await mongoose.connection.db.dropCollection('regions');
			console.log('🌱 Drop data successfully: Regions');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function dropDistrictsCollection() {
	try {
		(async () => {
			await mongoose.connection.db.dropCollection('districts');
			console.log('🌱 Drop data successfully: Districts');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function dropZonesCollection() {
	try {
		(async () => {
			await mongoose.connection.db.dropCollection('zones');
			console.log('🌱 Drop data successfully: Zones');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function dropUsersCollection() {
	try {
		(async () => {
			await mongoose.connection.db.dropCollection('users');
			console.log('🌱 Drop data successfully: Users');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function dropVerifyCodesCollection() {
	try {
		(async () => {
			await mongoose.connection.db.dropCollection('verifycodes');
			console.log('🌱 Drop data successfully: VerifyCodes');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function dropAllCollections() {
	try {
		(async () => {
			await mongoose.connection.db.dropDatabase();
			console.log('🌱 Drop data successfully: All collections');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}
