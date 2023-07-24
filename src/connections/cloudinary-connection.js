const cloudinary = require('cloudinary');
const envSecretsConfig = require('../configurations/env-secrets-config');

const CLOUDINARY_NAME = envSecretsConfig.CLOUDINARY_NAME;
const CLOUDINARY_API_KEY = envSecretsConfig.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = envSecretsConfig.CLOUDINARY_API_SECRET;

cloudinary.config({
	cloud_name: CLOUDINARY_NAME,
	api_key: CLOUDINARY_API_KEY,
	api_secret: CLOUDINARY_API_SECRET,
	secure: true,
});

module.exports = cloudinary;
