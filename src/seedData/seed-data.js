const mongodbConnection = require('../connections/mongodb-connection');

// models [src/models]
const { Country } = require('../models/address-models/country-model');
const { Region } = require('../models/address-models/regions-model');
const { District } = require('../models/address-models/district-model');
const { Zone } = require('../models/address-models/zone-model');
const { UserRole } = require('../models/user-models/user-role');
const { OperationType } = require('../models/post-models/operation-type-model');
const { CurrencyType } = require('../models/post-models/currency-type-model');
const { PriceType } = require('../models/post-models/price-type-model');
const { PaymentType } = require('../models/post-models/payment-type-model');

// data [src/seedData/data]
const countries = require('./data/countries.json');
const regions = require('./data/regions.json');
const districts = require('./data/districts.json');
const zones = require('./data/zones.json');
const userRoles = require('./data/user-roles.json');
const operationTypes = require('./data/operation-types.json');
const currencyTypes = require('./data/currency-types.json');
const priceTypes = require('./data/price-types.json');
const paymentTypes = require('./data/payment-types.json');

// connect to mongodb [src/connections/mongodb-connection.js]
(async () => await mongodbConnection())();

// seed data

async function seedCountries() {
	try {
		(async () => {
			if ((await Country.countDocuments()) > 0) {
				await Country.deleteMany({});
			}

			await Country.insertMany(countries);
			console.log('🌱 Seed data successfully: Countries');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedRegions() {
	try {
		(async () => {
			if ((await Region.countDocuments()) > 0) {
				await Region.deleteMany({});
			}

			// add countryId to regions number = 1
			let Countries = await Country.find({});
			regions.forEach((region) => {
				// add countryObjId to regions
				region.countryObjId = Countries[0]._id;
			});

			await Region.insertMany(regions);
			console.log('🌱 Seed data successfully: Regions');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedDistricts() {
	try {
		(async () => {
			if ((await District.countDocuments()) > 0) {
				await District.deleteMany({});
			}

			let Regions = await Region.find({});
			districts.forEach((district) => {
				Regions.forEach((region) => {
					if (region.id === district.region_id) {
						district.regionObjId = region._id;
					}
				});
			});

			await District.insertMany(districts);
			console.log('🌱 Seed data successfully: District');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedZones() {
	try {
		(async () => {
			if ((await Zone.countDocuments()) > 0) {
				await Zone.deleteMany({});
			}

			let districts = await District.find({});
			zones.forEach((zone) => {
				districts.forEach((district) => {
					if (district.id === zone.district_id) {
						zone.districtObjId = district._id;
					}
				});
			});

			await Zone.insertMany(zones);
			console.log('🌱 Seed data successfully: MFY');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedUserRoles() {
	try {
		(async () => {
			if ((await UserRole.countDocuments()) > 0) {
				await UserRole.deleteMany({});
			}

			await UserRole.insertMany(userRoles);
			console.log('🌱 Seed data successfully: User Roles');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedOperationTypes() {
	try {
		(async () => {
			if ((await OperationType.countDocuments()) > 0) {
				await OperationType.deleteMany({});
			}

			await OperationType.insertMany(operationTypes);
			console.log('🌱 Seed data successfully: Operation Types');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedCurrencyTypes() {
	try {
		(async () => {
			if ((await CurrencyType.countDocuments()) > 0) {
				await CurrencyType.deleteMany({});
			}

			await CurrencyType.insertMany(currencyTypes);
			console.log('🌱 Seed data successfully: CurrencyType Types');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedPriceTypes() {
	try {
		(async () => {
			if ((await PriceType.countDocuments()) > 0) {
				await PriceType.deleteMany({});
			}

			await PriceType.insertMany(priceTypes);
			console.log('🌱 Seed data successfully: PriceTypes');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

async function seedPaymentTypes() {
	try {
		(async () => {
			if ((await PaymentType.countDocuments()) > 0) {
				await PaymentType.deleteMany({});
			}

			await PaymentType.insertMany(paymentTypes);
			console.log('🌱 Seed data successfully: PriceTypes');
			process.exit(0);
		})();
	} catch (err) {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	}
}

// seed data do it one by one. I don't recommend to you run all at once.
// also it doesn't recommend to do it. After seeding data, don't do it again.
// because it will delete all data and insert again!
// to run: npm run seed-data

// seedCountries();
// seedRegions();
// seedDistricts();
// seedZones();
// seedUserRoles();
// seedOperationTypes();
// seedCurrencyTypes();
// seedPriceTypes();
// seedPaymentTypes();
