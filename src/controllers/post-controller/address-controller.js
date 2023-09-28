const { Country } = require('../../models/address-models/country-model');
const { Region } = require('../../models/address-models/regions-model');
const { District } = require('../../models/address-models/district-model');
const { Zone } = require('../../models/address-models/zone-model');
const ReturnResult = require('../../helpers/return-result');
const Joi = require('joi');

const MESSAGES = {
	COUNTRY_CREATED: 'Country created successfully',
	COUNTRY_UPDATED: 'Country updated successfully',
	COUNTRY_DELETED: 'Country deleted successfully',
	COUNTRY_FETCHED: 'Country fetched successfully',
	COUNTRIES_FETCHED: 'Countries fetched successfully',
	COUNTRY_NAME_EXISTS: 'Country name already exists',
	COUNTRY_NOT_FOUND: 'Country not found',

	REGION_CREATED: 'Region created successfully',
	REGION_UPDATED: 'Region updated successfully',
	REGION_DELETED: 'Region deleted successfully',
	REGION_FETCHED: 'Region fetched successfully',
	REGIONS_FETCHED: 'Regions fetched successfully',
	REGION_NAME_EXISTS: 'Region name already exists',
	REGION_NOT_FOUND: 'Region not found',

	DISTRICT_CREATED: 'District created successfully',
	DISTRICT_UPDATED: 'District updated successfully',
	DISTRICT_DELETED: 'District deleted successfully',
	DISTRICT_FETCHED: 'District fetched successfully',
	DISTRICTS_FETCHED: 'Districts fetched successfully',
	DISTRICT_NAME_EXISTS: 'District name already exists',
	DISTRICT_NOT_FOUND: 'District not found',

	ZONE_CREATED: 'Zone created successfully',
	ZONE_UPDATED: 'Zone updated successfully',
	ZONE_DELETED: 'Zone deleted successfully',
	ZONE_FETCHED: 'Zone fetched successfully',
	ZONES_FETCHED: 'Zones fetched successfully',
	ZONE_NAME_EXISTS: 'Zone name already exists',
	ZONE_NOT_FOUND: 'Zone not found',
};

class CountryController {
	static getCountries = async (req, res) => {
		const countries = await Country.find();
		return res.status(200).json(ReturnResult.success(countries, MESSAGES.COUNTRIES_FETCHED));
	};

	static getCountry = async (req, res) => {
		const { countryId } = req.params;
		const country = await Country.findById(countryId);
		if (!country) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.COUNTRY_NOT_FOUND));
		}

		return res.status(200).json(ReturnResult.success(country, MESSAGES.COUNTRY_FETCHED));
	};

	static createCountry = async (req, res) => {
		const { error } = validateCountry(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { name, Code, phoneCode, currencyCode, currencyName, status, shortDescription } =
			req.body;

		const checkCountryName = await Country.findOne({ name });

		if (checkCountryName) {
			return res.status(400).json(ReturnResult.errorMessage(MESSAGES.COUNTRY_NAME_EXISTS));
		}

		const country = new Country({
			name,
			Code,
			phoneCode,
			currencyCode,
			currencyName,
			status,
			shortDescription,
		});

		const savedCountry = await country.save();
		return res.status(201).json(ReturnResult.success(savedCountry, MESSAGES.COUNTRY_CREATED));
	};

	static updateCountry = async (req, res) => {
		const { countryId } = req.params;

		const { error } = validateCountry(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const country = await Country.findById(countryId);
		if (!country) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.COUNTRY_NOT_FOUND));
		}

		const { name, Code, phoneCode, currencyCode, currencyName, status, shortDescription } =
			req.body;

		country.name = name;
		country.Code = Code;
		country.phoneCode = phoneCode;
		country.currencyCode = currencyCode;
		country.currencyName = currencyName;
		country.status = status;
		country.shortDescription = shortDescription;

		const updatedCountry = await country.save();
		return res.status(200).json(ReturnResult.success(updatedCountry, MESSAGES.COUNTRY_UPDATED));
	};

	static deleteCountry = async (req, res) => {
		const { countryId } = req.params;

		const country = await Country.findById(countryId);
		if (!country) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.COUNTRY_NOT_FOUND));
		}

		const deletedCountry = await Country.findByIdAndDelete(countryId);
		return res.status(200).json(ReturnResult.success(deletedCountry, MESSAGES.COUNTRY_DELETED));
	};
}

class RegionController {
	static getRegions = async (req, res) => {
		const regions = await Region.find();
		return res.status(200).json(ReturnResult.success(regions, MESSAGES.REGIONS_FETCHED));
	};

	static getRegionsPaginated = async (req, res) => {
		const { page, limit } = req.query;
		const options = {
			page: parseInt(page, 10),
			limit: parseInt(limit, 10),
		};
		const regions = await Region.find()
			.limit(options.limit * 1)
			.skip((options.page - 1) * options.limit)
			.exec();
		return res.status(200).json(ReturnResult.success(regions, MESSAGES.REGIONS_FETCHED));
	};

	static getRegion = async (req, res) => {
		const { regionId } = req.params;
		const region = await Region.findById(regionId)
		if (!region) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.REGION_NOT_FOUND));
		}

		return res.status(200).json(ReturnResult.success(region, MESSAGES.REGION_FETCHED));
	};

	static createRegion = async (req, res) => {
		const { error } = validateRegion(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { name, countryObjId, status, shortDescription } = req.body;

		const checkRegionName = await Region.findOne({ name });

		if (checkRegionName) {
			return res.status(400).json(ReturnResult.errorMessage(MESSAGES.REGION_NAME_EXISTS));
		}

		const region = new Region({
			name,
			countryObjId,
			status,
			shortDescription,
		});

		const savedRegion = await region.save();
		return res.status(201).json(ReturnResult.success(savedRegion, MESSAGES.REGION_CREATED));
	};

	static updateRegion = async (req, res) => {
		const { regionId } = req.params;

		const { error } = validateRegion(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const region = await Region.findById(regionId);
		if (!region) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.REGION_NOT_FOUND));
		}

		const { name, countryObjId, status, shortDescription } = req.body;

		region.name = name;
		region.countryObjId = countryObjId;
		region.status = status;
		region.shortDescription = shortDescription;

		const updatedRegion = await region.save();
		return res.status(200).json(ReturnResult.success(updatedRegion, MESSAGES.REGION_UPDATED));
	};

	static deleteRegion = async (req, res) => {
		const { regionId } = req.params;

		const region = await Region.findById(regionId);
		if (!region) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.REGION_NOT_FOUND));
		}

		const deletedRegion = await Region.findByIdAndDelete(regionId);
		return res.status(200).json(ReturnResult.success(deletedRegion, MESSAGES.REGION_DELETED));
	};

	static batchDeleteRegions = async (req, res) => {
		const { regionIds } = req.body;

		if (regionIds.length === 0) {
			return res.status(404).json(ReturnResult.errorMessage('Ids not found'));
		}

		const regions = await Region.find({ _id: { $in: regionIds } });

		if (!regions) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.REGION_NOT_FOUND));
		}

		const deletedRegions = await Region.deleteMany({ _id: { $in: regionIds } });
		return res.status(200).json(ReturnResult.success(deletedRegions, MESSAGES.REGION_DELETED));
	};
}

class DistrictController {
	static getDistricts = async (req, res) => {
		const districts = await District.find()
		return res.status(200).json(ReturnResult.success(districts, MESSAGES.DISTRICTS_FETCHED));
	};

	static getDistrictsPaginated = async (req, res) => {
		const { page, limit } = req.query;
		const options = {
			page: parseInt(page, 10),
			limit: parseInt(limit, 10),
		};
		const districts = await District.find()
			.limit(options.limit * 1)
			.skip((options.page - 1) * options.limit)
			.exec();

		return res.status(200).json(ReturnResult.success(districts, MESSAGES.DISTRICTS_FETCHED));
	};

	static getDistrict = async (req, res) => {
		const { districtId } = req.params;
		const district = await District.findById(districtId)
		if (!district) {
			return ReturnResult.errorMessage(MESSAGES.DISTRICT_NOT_FOUND);
		}

		return res.status(200).json(ReturnResult.success(district, MESSAGES.DISTRICT_FETCHED));
	};

	static getDistrictByRegion = async (req, res) => {
		const { regionId } = req.params;
		const districts = await District.find({ regionObjId: regionId })
		return res.status(200).json(ReturnResult.success(districts, MESSAGES.DISTRICTS_FETCHED));
	};

	static createDistrict = async (req, res) => {
		const { error } = validateDistrict(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { name, regionObjId, status, shortDescription } = req.body;

		const checkName = await District.findOne({ name });

		if (checkName) {
			return res.status(400).json(ReturnResult.errorMessage(MESSAGES.DISTRICT_NAME_EXISTS));
		}

		const district = new District({
			name,
			regionObjId,
			status,
			shortDescription,
		});

		const savedDistrict = await district.save();
		return res.status(201).json(ReturnResult.success(savedDistrict, MESSAGES.DISTRICT_CREATED));
	};

	static updateDistrict = async (req, res) => {
		const { districtId } = req.params;

		const { error } = validateDistrict(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const district = await District.findById(districtId);
		if (!district) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.DISTRICT_NOT_FOUND));
		}

		const { name, regionObjId, status, shortDescription } = req.body;

		district.name = name;
		district.regionObjId = regionObjId;
		district.status = status;
		district.shortDescription = shortDescription;

		const updatedDistrict = await district.save();
		return res.status(200).json(ReturnResult.success(updatedDistrict, MESSAGES.DISTRICT_UPDATED));
	};

	static deleteDistrict = async (req, res) => {
		const { districtId } = req.params;

		const district = await District.findById(districtId);
		if (!district) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.DISTRICT_NOT_FOUND));
		}

		const deletedDistrict = await District.findByIdAndDelete(districtId);
		return res.status(200).json(ReturnResult.success(deletedDistrict, MESSAGES.DISTRICT_DELETED));
	};

	static batchDeleteDistricts = async (req, res) => {
		const { districtIds } = req.body;

		if (!districtIds || districtIds.length === 0) {
			return res.status(400).json(ReturnResult.errorMessage("District's id is required"));
		}

		const districts = await District.find({ _id: { $in: districtIds } });

		if (!districts) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.DISTRICT_NOT_FOUND));
		}

		const deletedDistricts = await District.deleteMany({ _id: { $in: districtIds } });
		return res.status(200).json(ReturnResult.success(deletedDistricts, MESSAGES.DISTRICT_DELETED));
	};
}

class ZoneController {
	static getZones = async (req, res) => {
		const zones = await Zone.find()
		return res.status(200).json(ReturnResult.success(zones, MESSAGES.ZONES_FETCHED));
	};

	static getZonesPaginated = async (req, res) => {
		const { page, limit } = req.query;
		const options = {
			page: parseInt(page, 10),
			limit: parseInt(limit, 10),
		};

		const zones = await Zone.find()
			.limit(options.limit * 1)
			.skip((options.page - 1) * options.limit)
			.exec();

		return res.status(200).json(ReturnResult.success(zones, MESSAGES.ZONES_FETCHED));
	};

	static getZone = async (req, res) => {
		const { zoneId } = req.params;
		const zone = await Zone.findById(zoneId)
		if (!zone) {
			return ReturnResult.errorMessage(MESSAGES.ZONE_NOT_FOUND);
		}

		return res.status(200).json(ReturnResult.success(zone, MESSAGES.ZONE_FETCHED));
	};

	static getZonesByDistrict = async (req, res) => {
		const { districtId } = req.params;
		const zones = await Zone.find({ districtObjId: districtId })
		return res.status(200).json(ReturnResult.success(zones, MESSAGES.ZONES_FETCHED));
	};

	static createZone = async (req, res) => {
		const { error } = validateZone(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { name, districtObjId, status, shortDescription } = req.body;

		const checkName = await Zone.findOne({ name });

		if (checkName) {
			return res.status(400).json(ReturnResult.errorMessage(MESSAGES.ZONE_NAME_EXISTS));
		}

		const zone = new Zone({
			name,
			districtObjId,
			status,
			shortDescription,
		});

		const savedZone = await zone.save();
		return res.status(201).json(ReturnResult.success(savedZone, MESSAGES.ZONE_CREATED));
	};

	static updateZone = async (req, res) => {
		const { zoneId } = req.params;

		const { error } = validateZone(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const zone = await Zone.findById(zoneId);
		if (!zone) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.ZONE_NOT_FOUND));
		}

		const { name, districtObjId, status, shortDescription } = req.body;

		zone.name = name;
		zone.districtObjId = districtObjId;
		zone.status = status;
		zone.shortDescription = shortDescription;

		const updatedZone = await zone.save();
		return res.status(200).json(ReturnResult.success(updatedZone, MESSAGES.ZONE_UPDATED));
	};

	static deleteZone = async (req, res) => {
		const { zoneId } = req.params;

		const zone = await Zone.findById(zoneId);
		if (!zone) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.ZONE_NOT_FOUND));
		}

		const deletedZone = await Zone.findByIdAndDelete(zoneId);
		return res.status(200).json(ReturnResult.success(deletedZone, MESSAGES.ZONE_DELETED));
	};

	static batchDeleteZones = async (req, res) => {
		const { zoneIds } = req.body;

		if (!zoneIds || zoneIds.length === 0) {
			return res.status(400).json(ReturnResult.errorMessage("Zone id's are required"));
		}

		const zones = await Zone.find({ _id: { $in: zoneIds } });

		if (!zones) {
			return res.status(404).json(ReturnResult.errorMessage(MESSAGES.ZONE_NOT_FOUND));
		}

		const deletedZones = await Zone.deleteMany({ _id: { $in: zoneIds } });
		return res.status(200).json(ReturnResult.success(deletedZones, MESSAGES.ZONE_DELETED));
	};
}

function validateCountry(country) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		Code: Joi.string().optional(),
		phoneCode: Joi.string().optional(),
		currencyCode: Joi.string().optional(),
		currencyName: Joi.string().optional(),
		status: Joi.boolean().optional(),
		shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
	});

	return schema.validate(country);
}

function validateRegion(region) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		countryObjId: Joi.string().required(),
		status: Joi.boolean().optional(),
		shortDescription: Joi.string().optional(),
	});

	return schema.validate(region);
}

function validateDistrict(district) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		regionObjId: Joi.string().required(),
		status: Joi.boolean().optional(),
		shortDescription: Joi.string().optional(),
	});

	return schema.validate(district);
}

function validateZone(zone) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		districtObjId: Joi.string().required(),
		status: Joi.boolean().optional(),
		shortDescription: Joi.string().optional(),
	});

	return schema.validate(zone);
}

module.exports = {
	CountryController,
	RegionController,
	DistrictController,
	ZoneController,
};
