require('dotenv').config();
module.exports = {
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,
	MONGODB_PRODUCTION_URL: process.env.MONGODB_PRODUCTION_DEV_URL,
	MONGODB_LOCAL_URL: process.env.MONGODB_LOCAL_URL,
	MONGODB_USER: process.env.MONGODB_USER,
	MONGODB_USER_PASSWORD: process.env.MONGODB_USER_PASSWORD,
	REDIS_URL: process.env.REDIS_URL,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_USERNAME: process.env.REDIS_USERNAME,
	REDIS_FULL_URL: process.env.REDIS_FULL_URL,
	REDIS_LOCAL_HOST: process.env.REDIS_LOCAL_HOST,
	REDIS_LOCAL_PORT: process.env.REDIS_LOCAL_PORT,
	TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
	TELEGRAM_CHANNEL_NAME: process.env.TELEGRAM_CHANNEL_NAME,
	CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
	GMAIL: process.env.GMAIL,
	GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
	CLIENT_URL: process.env.CLIENT_URL,
	ESKIZ_EMAIL: process.env.ESKIZ_EMAIL,
	ESKIZ_PASSWORD: process.env.ESKIZ_PASSWORD,
	CLIENT_REDIRECT_URL: process.env.CLIENT_REDIRECT_URL,
};
