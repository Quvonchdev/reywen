const express = require('express');
const router = express.Router();
const {
	CountryController,
	RegionController,
	DistrictController,
	ZoneController,
} = require('../controllers/post-controller/address-controller');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const middleware = [rateLimit(50, 2)];
const authMiddleware = [authRole, checkRoles(['Admin', 'SuperAdmin'])];

router.get('/countries/all', [...middleware], CountryController.getCountries);
router.get('/regions/all', [...middleware], RegionController.getRegions);
router.get('/districts/all', [...middleware], DistrictController.getDistricts);
router.get('/zones/all', [...middleware], ZoneController.getZones);

// Pagination
router.get('/regions', [...middleware], RegionController.getRegionsPaginated);
router.get('/districts', [...middleware], DistrictController.getDistrictsPaginated);
router.get('/zones', [...middleware], ZoneController.getZonesPaginated);

router.get('/countries/:countryId', [...middleware], CountryController.getCountry);
router.get('/regions/:regionId', [...middleware], RegionController.getRegion);
router.get('/:regionId/districts', [...middleware], DistrictController.getDistrictByRegion);
router.get('/districts/:districtId', [...middleware], DistrictController.getDistrict);
router.get('/zones/:zoneId', [...middleware], ZoneController.getZone);
router.get('/:districtId/zones', [...middleware], ZoneController.getZonesByDistrict);

router.post('/countries', [...middleware, ...authMiddleware], CountryController.createCountry);
router.post('/regions', [...middleware, ...authMiddleware], RegionController.createRegion);
router.post('/districts', [...middleware, ...authMiddleware], DistrictController.createDistrict);
router.post('/zones', [...middleware, ...authMiddleware], ZoneController.createZone);

router.put(
	'/countries/:countryId',
	[...middleware, ...authMiddleware],
	CountryController.updateCountry
);
router.put('/regions/:regionId', [...middleware, ...authMiddleware], RegionController.updateRegion);
router.put(
	'/districts/:districtId',
	[...middleware, ...authMiddleware],
	DistrictController.updateDistrict
);
router.put('/zones/:zoneId', [...middleware, ...authMiddleware], ZoneController.updateZone);

router.delete(
	'/countries/:countryId',
	[...middleware, ...authMiddleware],
	CountryController.deleteCountry
);
router.delete(
	'/regions/:regionId',
	[...middleware, ...authMiddleware],
	RegionController.deleteRegion
);
router.delete(
	'/districts/:districtId',
	[...middleware, ...authMiddleware],
	DistrictController.deleteDistrict
);
router.delete('/zones/:zoneId', [...middleware, ...authMiddleware], ZoneController.deleteZone);

router.post(
	'regions/batch-delete',
	[...middleware, ...authMiddleware],
	RegionController.batchDeleteRegions
);
router.post(
	'districts/batch-delete',
	[...middleware, ...authMiddleware],
	DistrictController.batchDeleteDistricts
);
router.post(
	'zones/batch-delete',
	[...middleware, ...authMiddleware],
	ZoneController.batchDeleteZones
);

module.exports = router;
