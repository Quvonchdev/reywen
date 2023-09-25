require('../connections/database-connections/primary-db-connection');

// models [src/models]
const { Country } = require('../models/address-models/country-model');
const { Region } = require('../models/address-models/regions-model');
const { District } = require('../models/address-models/district-model');
const { Zone } = require('../models/address-models/zone-model');


// data [src/seedData/data]
const countries = require('./data/countries.json');
const regions = require('./data/regions.json');
const districts = require('./data/districts.json');
const zones = require('./data/zones.json');

// connect to database-connections [src/connections/database-connections-connection.js]

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

// seed data do it one by one. I don't recommend to you run all at once.
// also it doesn't recommend to do it. After seeding data, don't do it again.
// because it will delete all data and insert again!
// to run: npm run seed-data
// before run: uncomment the function you want to run

// seedCountries();
// seedRegions();
// seedDistricts();
// seedZones();

