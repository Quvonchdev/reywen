const express = require('express');
const router = express.Router();
const error = require('../controllers/error-controller');
const upload = require('../utils/multer');

router.get('/404', error.notFoundRoute);
router.post('/multer', upload.single('file'), error.multerError);
router.get('/timeout', error.timeoutError);
router.get('/error', error.error);

module.exports = router;
