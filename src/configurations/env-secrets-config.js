require('dotenv').config();
module.exports = {
	NODE_ENV: process.env.NODE_ENV,
	PORT: process.env.PORT,

	// Local URLs
	MONGODB_PRIMARY_LOCAL_URL: process.env.MONGODB_PRIMARY_LOCAL_URL,
	MONGODB_CHAT_LOCAL_URL: process.env.MONGODB_CHAT_LOCAL_URL,
	MONGODB_USER_LOCAL_URL: process.env.MONGODB_USER_LOCAL_URL,
	MONGODB_LOGS_LOCAL_URL: process.env.MONGODB_LOGS_LOCAL_URL,
	MONGODB_AUCTION_LOCAL_URL: process.env.MONGODB_AUCTION_LOCAL_URL,

	// Production URLs
	MONGODB_PRIMARY_PRODUCTION_URL: process.env.MONGODB_PRIMARY_PRODUCTION_URL,
	PRIMARY_MONGODB_USER_PASSWORD: process.env.PRIMARY_MONGODB_USER_PASSWORD,
	PRIMARY_MONGODB_USER: process.env.PRIMARY_MONGODB_USER,
	MONGODB_CHAT_PRODUCTION_URL: process.env.MONGODB_CHAT_PRODUCTION_URL,
	MONGODB_USER_PRODUCTION_URL: process.env.MONGODB_USER_PRODUCTION_URL,
	MONGODB_LOGS_PRODUCTION_URL: process.env.MONGODB_LOGS_PRODUCTION_URL,
	MONGODB_AUCTION_PRODUCTION_URL: process.env.MONGODB_AUCTION_PRODUCTION_URL,

	// Redis
	REDIS_URL: process.env.REDIS_URL,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_USERNAME: process.env.REDIS_USERNAME,
	REDIS_FULL_URL: process.env.REDIS_FULL_URL,
	REDIS_LOCAL_HOST: process.env.REDIS_LOCAL_HOST,
	REDIS_LOCAL_PORT: process.env.REDIS_LOCAL_PORT,

	// Telegram
	TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
	TELEGRAM_CHANNEL_NAME: process.env.TELEGRAM_CHANNEL_NAME,

	// Cloudinary
	CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

	JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,

	GMAIL: process.env.GMAIL,
	GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,

	CLIENT_URL: process.env.CLIENT_URL,

	ESKIZ_SMS_EMAIL: process.env.ESKIZ_SMS_EMAIL,
	ESKIZ_SMS_PASSWORD: process.env.ESKIZ_SMS_PASSWORD,
	ESKIZ_SMS_NICK: process.env.ESKIZ_SMS_NICK,

	CLIENT_REDIRECT_URL: process.env.CLIENT_REDIRECT_URL,
	BASE_URL: process.env.BASE_URL,
};
