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
const isBlockedUser = require('../middlewares/block-user-middleware');

// authRole, isBlockedUser,rateLimit(25,1)
const middleware = [rateLimit(25, 1)];

router.get('/countries/all', middleware, CountryController.getCountries);
router.get('/regions/all', middleware, RegionController.getRegions);
router.get('/districts/all', middleware, DistrictController.getDistricts);
router.get('/zones/all', middleware, ZoneController.getZones);

router.get('/regions', middleware, RegionController.getRegionsPaginated);
router.get('/districts', middleware, DistrictController.getDistrictsPaginated);
router.get('/zones', middleware, ZoneController.getZonesPaginated);

router.get('/countries/:countryId', middleware, CountryController.getCountry);
router.get('/regions/:regionId', middleware, RegionController.getRegion);
router.get('/:regionId/districts', middleware, DistrictController.getDistrictByRegion);
router.get('/districts/:districtId', middleware, DistrictController.getDistrict);
router.get('/zones/:zoneId', middleware, ZoneController.getZone);
router.get('/:districtId/zones', middleware, ZoneController.getZonesByDistrict);

router.post('/countries', middleware, CountryController.createCountry);
router.post('/regions', middleware, RegionController.createRegion);
router.post('/districts', middleware, DistrictController.createDistrict);
router.post('/zones', middleware, ZoneController.createZone);

router.put('/countries/:countryId', middleware, CountryController.updateCountry);
router.put('/regions/:regionId', middleware, RegionController.updateRegion);
router.put('/districts/:districtId', middleware, DistrictController.updateDistrict);
router.put('/zones/:zoneId', middleware, ZoneController.updateZone);

router.delete('/countries/:countryId', middleware, CountryController.deleteCountry);
router.delete('/regions/:regionId', middleware, RegionController.deleteRegion);
router.delete('/districts/:districtId', middleware, DistrictController.deleteDistrict);
router.delete('/zones/:zoneId', middleware, ZoneController.deleteZone);

router.post('regions/batch-delete', middleware, RegionController.batchDeleteRegions);
router.post('districts/batch-delete', middleware, DistrictController.batchDeleteDistricts);
router.post('zones/batch-delete', middleware, ZoneController.batchDeleteZones);

module.exports = router;
