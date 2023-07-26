const { User } = require('../models/user-models/user-model');
const ReturnResult = require('../helpers/return-result');
const { VerifyCode } = require('../models/user-models/verify-user-model');
const { UserLog } = require('../models/user-models/user-logs-model');
const { emailTemplate } = require('../configurations/mail-template');
const { sendMail } = require('../utils/mail');
const envSecretsConfig = require('../configurations/env-secrets-config');
const { UserFavorites } = require('../models/user-models/user-favorites-model');

const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');

const SUCCESS_MESSAGES = {
	USER_REGISTERED: 'User registered successfully. Please verify your account!',
	USER_LOGGED_IN: 'User logged in successfully',
	USER_LOGGED_OUT: 'User logged out successfully',
	USER_VERIFIED: 'User verified successfully',
	USER_PASSWORD_CHANGED: 'User password changed successfully',
	USER_PASSWORD_RESET: 'User password reset successfully',
	USER_DELETED: 'User deleted successfully',
	USER_UPDATED: 'User updated successfully',
	USER_LOGS_FETCHED: 'User logs fetched successfully',
	USER_ALREADY_VERIFIED: 'User already verified',
	RESEND_VERIFICATION_CODE: 'Verification code sent successfully',
	VERIFICATION_CODE_SENT: 'Verification code sent successfully',
};

const ERROR_MESSAGES = {
	USER_REGISTERED: 'User registration failed',
	USER_LOGGED_IN: 'User login failed',
	USER_LOGGED_OUT: 'User logout failed',
	USER_VERIFIED: 'User verification failed',
	USER_PASSWORD_CHANGED: 'User password change failed',
	USER_PASSWORD_RESET: 'User password reset failed',
	USER_DELETED: 'User deletion failed',
	USER_UPDATED: 'User update failed',
	USER_LOGS_FETCHED: 'User logs fetch failed',
	VERIFICATION_CODE_EXPIRED: 'Verification code expired',
	USER_NOT_FOUND: 'User not found',
	VERIFICATION_CODE_NOT_FOUND: 'Verification code not found',
	VERIFICATION_CODE_INVALID: 'Verification code invalid',
	USER_NOT_VERIFIED: 'User not verified',
	USER_ALREADY_EXISTS: 'User already exists',
	VERIFY_CODE_EXPIRED: 'Verify code expired',
	VERIFY_CODE_NOT_FOUND: 'Verify code not found',
	USER_ALREADY_VERIFIED: 'User already verified',
	LOGIN_OR_PASSWORD_INCORRECT: 'Login or password incorrect',
	PASSWORD_SAME: 'New password must be different from old password',
};

// we don't need try catch because we are using express-async-errors
// !-- REGISTER USER --
exports.register = async (req, res) => {
	const { error } = validateRegisterSchema(req.body);

	if (error) {
		return res.status(400).send(ReturnResult.error(error, 'Validation error'));
	}

	const { fullName, email, phoneNumber, password, confirmPassword, shortDescription } = req.body;

	const checkEmail = await User.findOne({
		email,
	});

	const checkPhoneNumber = await User.findOne({
		phoneNumber,
	});

	if (checkEmail || checkPhoneNumber) {
		return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_ALREADY_EXISTS));
	}

	if (password !== confirmPassword) {
		return res
			.status(400)
			.json(ReturnResult.errorMessage('Password and Confirm Password must be the same'));
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await hashPassword(password, salt);
	const hashedConfirmPassword = await hashPassword(confirmPassword, salt);

	const avatar = createAvatar(fullName);

	const user = new User({
		fullName: fullName,
		email: email,
		password: hashedPassword,
		confirmPassword: hashedConfirmPassword,
		phoneNumber: phoneNumber,
		coverImage: avatar,
		shortDescription: shortDescription,
	});

	const userFavorites = await UserFavorites.findOne({
		userId: user._id,
	});

	if (!userFavorites) {
		await new UserFavorites({
			userId: user._id,
		}).save();
	}

	// save user to database
	await user.save();
	// create access code for email verification
	const verify_code = createVerifyCode();
	if (verify_code) {
		// save access code to database
		await createAndSaveRandomVerifyCode(user._id, verify_code);
	}
	// send email verification
	await sendMail(mailOptions(user, verify_code));

	const returnData = {
		_id: user._id,
		fullName: user.fullName,
		email: user.email,
		phoneNumber: user.phoneNumber,
		coverImage: user.coverImage,
		isVerified: user.isVerified,
		shortDescription: user.shortDescription,
		userRoles: user.userRoles,
	};
	return res.status(200).json(ReturnResult.success(returnData, SUCCESS_MESSAGES.USER_REGISTERED));
};

// !-- VERIFY ACCOUNT --
exports.verifyAccount = async (req, res) => {
	const { error } = validateVerifyAccountSchema(req.body);

	if (error) {
		return res.status(400).send(ReturnResult.returnErrorResult(error, 'Validation error'));
	}

	const { verifyCode, userId } = req.body;

	const verify_code = await VerifyCode.findOne({
		verifyCode: verifyCode,
		userId: userId,
	});

	if (!verify_code) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.VERIFY_CODE_NOT_FOUND));
	}

	let currentTime = new Date();

	if (currentTime >= verify_code.expiredAt) {
		await VerifyCode.deleteMany({
			userId: userId,
		});
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.VERIFY_CODE_EXPIRED));
	}

	const user = await User.findOne({
		_id: userId,
	});

	if (!user) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	user.isVerified = true;
	await user.save();
	await VerifyCode.deleteMany({
		userId: user._id,
	});

	return res.status(200).json(ReturnResult.successMessage(SUCCESS_MESSAGES.USER_VERIFIED));
};

// !-- LOGIN USER --
exports.login = async (req, res) => {
	const { error } = validateLoginSchema(req.body);

	if (error) {
		return res.status(400).send(ReturnResult.error(error, 'Validation error'));
	}

	const { email, password } = req.body;

	const user = await User.findOne({
		email,
	});

	if (!user) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	if (!user.isVerified) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_VERIFIED));
	}

	const isMatch = await bcrypt.compare(password, user.password);

	if (!isMatch) {
		return res
			.status(400)
			.send(ReturnResult.errorMessage(ERROR_MESSAGES.LOGIN_OR_PASSWORD_INCORRECT));
	}

	const ua = req.useragent;

	const userAgents = {
		user: user._id,
		ip: req?.ip || null,
		device: ua?.device || null,
		os: ua?.os || null,
		browser: ua?.browser || null,
	};

	// save last login time
	await new UserLog(userAgents).save();

	const HOUR = 6; // hours
	const expiredAt = Date.now() + HOUR * 60 * 60 * 1000; // hours in milliseconds

	console.log(user);
	const token = generateJwtToken(user);

	return res.status(200).json(
		ReturnResult.success(
			{
				token: {
					accessToken: token,
					token_type: 'Bearer',
					expires_in: HOUR * 60 * 60,
					expires_in_type: 'seconds',
					expired_at: expiredAt,
					expired_at_type: 'milliseconds',
				},
				user: {
					_id: user._id,
					fullName: user.fullName,
					email: user.email,
					phoneNumber: user.phoneNumber,
					coverImage: user.coverImage,
					isVerified: user.isVerified,
					shortDescription: user.shortDescription,
				},
			},
			SUCCESS_MESSAGES.USER_LOGGED_IN
		)
	);
};

// !-- RESEND VERIFICATION CODE --
exports.resendVerifyCode = async (req, res) => {
	const { error } = resendVerifyCodeSchema(req.body);

	if (error) {
		return res.status(400).send(ReturnResult.error(error, 'Validation error'));
	}

	const { email } = req.body;

	const user = await User.findOne({
		email: email,
	});

	if (!user) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	// delete all verify code of user; because we send new verify code
	await VerifyCode.deleteMany({
		userId: user._id,
	});

	if (user.isVerified) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_ALREADY_VERIFIED));
	}

	// create access code for email verification
	const verify_code = createVerifyCode();

	if (verify_code) {
		// save access code to database
		await createAndSaveRandomVerifyCode(user._id, verify_code);
	}
	// send email verification code
	await sendMail(mailOptions(user, verify_code));
	// return success message
	return res.status(200).json(ReturnResult.successMessage(SUCCESS_MESSAGES.VERIFICATION_CODE_SENT));
};

// !-- RESET PASSWORD --
exports.resetPassword = async (req, res) => {
	const { error } = validateResetPasswordSchema(req.body);

	if (error) {
		return res.status(400).send(ReturnResult.error(error, 'Validation error'));
	}

	const { email, password, confirmPassword, verifyCode } = req.body;

	const user = await User.findOne({
		email: email,
	});

	if (!user) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	const matchPassword = await bcrypt.compare(password, user.password);
	const matchConfirmPassword = await bcrypt.compare(confirmPassword, user.password);

	if (matchPassword || matchConfirmPassword) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.PASSWORD_SAME));
	}

	const verify_code = await VerifyCode.findOne({
		verifyCode: verifyCode,
		userId: user._id,
	});

	if (!verify_code) {
		return res.status(400).send(ReturnResult.error(ERROR_MESSAGES.VERIFY_CODE_NOT_FOUND));
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await hashPassword(password, salt);
	const hashedConfirmPassword = await hashPassword(confirmPassword, salt);

	await User.updateOne(
		{
			_id: user._id,
		},
		{
			password: hashedPassword,
			confirmPassword: hashedConfirmPassword,
		}
	);

	await VerifyCode.deleteMany({
		userId: user._id,
	});

	return res.status(200).json(ReturnResult.success(SUCCESS_MESSAGES.USER_PASSWORD_RESET));
};

// !-- CHANGE PASSWORD --
exports.changePassword = async (req, res) => {
	const { error } = validateChangePasswordSchema(req.body);

	if (error) {
		return res.status(400).send(ReturnResult.error(error, 'Validation error'));
	}

	const { userId, oldPassword, newPassword, confirmNewPassword } = req.body;

	const user = await User.findOne({
		_id: userId,
	});

	if (!user) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	const matchOldPassword = await bcrypt.compare(oldPassword, user.password);

	if (!matchOldPassword) {
		return res
			.status(400)
			.send(ReturnResult.errorMessage(ERROR_MESSAGES.LOGIN_OR_PASSWORD_INCORRECT));
	}

	const matchNewPassword = await bcrypt.compare(newPassword, user.password);

	if (matchNewPassword) {
		return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.PASSWORD_SAME));
	}

	if (newPassword !== confirmNewPassword) {
		return res
			.status(400)
			.send(ReturnResult.errorMessage('New password and Confirm new password must be the same'));
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await hashPassword(newPassword, salt);
	const hashedConfirmPassword = await hashPassword(confirmNewPassword, salt);

	await User.updateOne(
		{
			_id: user._id,
		},
		{
			password: hashedPassword,
			confirmPassword: hashedConfirmPassword,
		},
		{
			new: true,
		}
	);

	return res.status(200).json(ReturnResult.success(SUCCESS_MESSAGES.USER_PASSWORD_CHANGED));
};

// VALIDATIONS
function validateRegisterSchema(reqBody) {
	const schema = joi.object({
		fullName: joi.string().min(3).max(30).required(),
		email: joi.string().email().min(3).max(255).required(),
		phoneNumber: joi.string().min(10).max(15).required(),
		password: joi.string().min(6).max(1024).required(),
		confirmPassword: joi.string().min(6).max(255).required(),
		shortDescription: joi.string().max(500).optional(),
	});

	return schema.validate(reqBody);
}

function validateVerifyAccountSchema(reqBody) {
	const schema = joi.object({
		verifyCode: joi.number().required(),
		userId: joi.string().required(),
	});

	return schema.validate(reqBody);
}

function resendVerifyCodeSchema(reqBody) {
	const schema = joi.object({
		email: joi.string().email().required(),
	});

	return schema.validate(reqBody);
}

function validateLoginSchema(reqBody) {
	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).max(30).required(),
	});

	return schema.validate(reqBody);
}

function validateResetPasswordSchema(reqBody) {
	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).max(30).required(),
		confirmPassword: joi.string().min(6).max(30).required(),
		verifyCode: joi.number().required(),
	});

	return schema.validate(reqBody);
}

function validateChangePasswordSchema(reqBody) {
	const schema = joi.object({
		userId: joi.string().required(),
		oldPassword: joi.string().min(6).max(30).required(),
		newPassword: joi.string().min(6).max(30).required(),
		confirmNewPassword: joi.string().min(6).max(30).required(),
	});

	return schema.validate(reqBody);
}

// EMAIL DATA
function mailOptions(user, verificationCode) {
	return {
		from: envSecretsConfig.GMAIL,
		to: user.email,
		subject: 'Email Verification',
		html: emailTemplate(user.fullName, verificationCode, 15),
	};
}

// CREATE VERIFY CODE AND SAVE TO DATABASE
async function createAndSaveRandomVerifyCode(userId, verifyCode) {
	return await new VerifyCode({
		verifyCode: verifyCode,
		userId: userId,
	}).save();
}

// CREATE RANDOM VERIFY CODE FOR ACCOUNT VERIFICATION
function createVerifyCode() {
	return randomstring.generate({
		length: 4,
		charset: 'numeric',
	});
}

// CREATE AVATAR FOR USER
function createAvatar(fullName) {
	const encodedText = encodeURIComponent(fullName);
	return `https://avatars.dicebear.com/api/initials/${encodedText}.svg`;
}

// HASH PASSWORD FOR USER
function hashPassword(password, salt) {
	return bcrypt.hash(password, salt);
}

// GENERATE TOKEN FOR USER
function generateJwtToken(user) {
	return jwt.sign(
		{
			_id: user._id,
			fullName: user.fullName,
			email: user.email,
			phoneNumber: user.phoneNumber,
			coverImage: user.coverImage,
			isVerified: user.isVerified,
			userRoles: user.userRoles || [],
			shortDescription: user.shortDescription,
			isBlockedUser: user.isBlockedUser,
		},
		envSecretsConfig.JWT_SECRET_KEY,
		{
			expiresIn: '6h',
		}
	);
}
