const { User } = require('../models/user-models/user-model');
const ReturnResult = require('../helpers/return-result');
const { VerifyCode } = require('../models/user-models/verify-user-model');
const { UserLog } = require('../models/user-models/user-logs-model');
const { UserRole } = require('../models/user-models/user-role');
const { emailTemplate } = require('../configurations/mail-template');
const { smsTemplate } = require('../configurations/sms-template');
const { sendMail } = require('../utils/mail');
const SmsEskiz = require('../utils/sms');
const envSecretsConfig = require('../configurations/env-secrets-config');
const { UserFavorites } = require('../models/user-models/user-favorites-model');

const bcrypt = require('bcrypt');
const joi = require('joi');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring');
const RedisCache = require('../utils/redis');
const { isValidObjectId } = require('mongoose');

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
	FORBIDDEN: 'Forbidden',
};

class UserController {
	static register = async (req, res) => {
		const { error } = validateRegisterSchema(req.body);

		if (error) {
			return res.status(400).send(ReturnResult.error(error, 'Validation error'));
		}

		const { fullName, email, phoneNumber, password, confirmPassword, shortDescription } = req.body;

		const checkPhoneNumber = await User.findOne({
			phoneNumber,
		});

		if (checkPhoneNumber) {
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
		// await SmsEskiz.sendMessage(smsTemplate(verify_code), phoneNumber, 'Uyer', `${envSecretsConfig.CLIENT_REDIRECT_URL}/verify-account/${user._id}`)

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

	static verifyAccount = async (req, res) => {
		const { error } = validateVerifyAccountSchema(req.body);

		if (error) {
			return res.status(400).send(ReturnResult.returnErrorResult(error, 'Validation error'));
		}

		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const { verifyCode } = req.body;

		const verify_code = await VerifyCode.findOne({
			verifyCode: verifyCode,
			userId: userId,
		});

		if (!verify_code) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.VERIFY_CODE_NOT_FOUND));
		}

		let currentTime = Date.now();

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
			userId: userId,
		});

		return res.status(200).json(ReturnResult.successMessage(SUCCESS_MESSAGES.USER_VERIFIED));
	};

	static resendVerifyCode = async (req, res) => {
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
		return res
			.status(200)
			.json(ReturnResult.successMessage(SUCCESS_MESSAGES.VERIFICATION_CODE_SENT));
	};

	static login = async (req, res) => {
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

	static resetPassword = async (req, res) => {
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

	static changePassword = async (req, res) => {
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

	static getUserLogs = async (req, res) => {
		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}


		const user = await User.findOne({
			_id: userId,
		});

		if (!user) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const logs = await UserLog.find({
			user: user._id,
		});

		return res.status(200).json(ReturnResult.success(logs, 'user logs fetched successfully'));
	};

	static getUserProfile = async (req, res) => {
		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const user = await User.findOne({
			_id: userId,
		}).select('-password -confirmPassword');

		if (!user) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const userFavorites = await UserFavorites.findOne({ userId: userId })
			.select('-_id -userId -__v')
			.populate('categoryFavorites', ['_id', 'name', 'slug', 'coverImage']);

		const result = {
			profile: user,
			userFavorites: null,
		};

		if (userFavorites) {
			result.userFavorites = userFavorites;
		} else {
			const usrFavorite = new UserFavorites({
				userId: user._id,
			});
			await usrFavorite.save();
			result.userFavorites = {
				categoryFavorites: usrFavorite.categoryFavorites,
				postFavorites: usrFavorite.postFavorites,
			};
		}

		return res.status(200).json(ReturnResult.success(result, 'user fetched successfully'));
	};

	static getAllUsers = async (req, res) => {
		const users = await User.find({}).select('-password -confirmPassword');

		return res.status(200).json(ReturnResult.success(users, 'users fetched successfully'));
	};

	static updateUser = async (req, res) => {
		const { error } = validateUpdateUserSchema(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.error(error, 'Validation error'));
		}

		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const { fullName, phoneNumber, shortDescription } = req.body;

		const user = await User.findOne({
			_id: userId,
		});

		if (!user) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		await User.updateOne(
			{
				_id: userId,
			},
			{
				fullName: fullName,
				shortDescription: shortDescription,
				phoneNumber: phoneNumber,
			},
			{
				new: true,
			}
		);

		return res.status(200).json(ReturnResult.success(SUCCESS_MESSAGES.USER_UPDATED));
	};

	static getUserRoles = async (req, res) => {
		const cachedUserRoles = await RedisCache.get('user-roles');

		if (cachedUserRoles) {
			return res
				.status(200)
				.json(
					ReturnResult.success(JSON.parse(cachedUserRoles), 'User Roles fetched successfully', true)
				);
		}

		const userRoles = await UserRole.find({});
		await RedisCache.set('user-roles', JSON.stringify(userRoles));
		return res.status(200).json(ReturnResult.success(userRoles, 'User Roles fetched successfully'));
	};

	static updateUserFavoritesCategory = async (req, res) => {
		const { error } = validateUserFavoritesCategorySchema(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.error(error, 'Validation error'));
		}

		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const { categoryFavorites } = req.body;

		const checkUser = await User.findById(userId);

		if (!checkUser) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const findFavorites = await UserFavorites.findOne({ userId });
		const checkCategoryExist = await UserFavorites.findOne({
			categoryFavorites: { $in: categoryFavorites },
		});

		if (checkCategoryExist) {
			return res
				.status(400)
				.json(ReturnResult.errorMessage('Category already exist in your favorites!'));
		}

		if (!findFavorites) {
			const favorites = new UserFavorites({
				userId,
			});

			await favorites.save();

			const updateUserFavorite = await UserFavorites.findByIdAndUpdate(
				favorites._id,
				{
					$push: { categoryFavorites: categoryFavorites },
				},
				{
					new: true,
				}
			);

			await updateUserFavorite.save();

			return res
				.status(200)
				.json(ReturnResult.successMessage('Category successfully added to your favorites! 🌟'));
		}

		const addCategoryUserFavorites = await UserFavorites.findByIdAndUpdate(
			findFavorites._id,
			{
				$push: { categoryFavorites: categoryFavorites },
			},
			{
				new: true,
			}
		);

		await addCategoryUserFavorites.save();

		return res
			.status(200)
			.json(ReturnResult.successMessage('Category successfully added to your favorites! 🌟'));
	};

	static updateUserFavoritesPost = async (req, res) => {
		const { error } = validateUserFavoritesPostSchema(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.error(error, 'Validation error'));
		}

		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}


		const { favoritePost } = req.body;

		const checkUser = await User.findById(userId);

		if (!checkUser) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const favorites = await UserFavorites.findOne({ userId });
		const checkPostExist = await UserFavorites.findOne({
			postFavorites: { $in: favoritePost },
		});

		if (checkPostExist) {
			return res
				.status(400)
				.json(ReturnResult.errorMessage('Product already exist in your favorites!'));
		}

		if (!favorites) {
			const userFavorites = new UserFavorites({
				userId,
			});

			await userFavorites.save();

			const updateUserFavorites = await UserFavorites.findByIdAndUpdate(
				userFavorites._id,
				{
					$push: { postFavorites: favoritePost },
				},
				{
					new: true,
				}
			);

			await updateUserFavorites.save();

			return res
				.status(200)
				.json(ReturnResult.successMessage('Product successfully added to your favorites! 🌟'));
		}

		const addProductUserFavorites = await UserFavorites.findByIdAndUpdate(
			favorites._id,
			{
				$push: { postFavorites: favoritePost },
			},
			{
				new: true,
			}
		);

		await addProductUserFavorites.save();
		return res
			.status(200)
			.json(ReturnResult.successMessage('Product successfully added to your favorites! 🌟'));
	};

	static getUserFavorites = async (req, res) => {
		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}


		const USER = await User.findById(userId);

		if (!USER) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const favorites = await UserFavorites.findOne({ userId }).populate('categoryFavorites', [
			'_id',
			'name',
			'shortDescription',
			'coverImage',
			'slug',
		]);

		if (!favorites) {
			return res.status(200).json(ReturnResult.success([], "User doesn't have any favorites yet!"));
		}

		return res
			.status(200)
			.json(ReturnResult.success(favorites, 'User favorites fetched successfully'));
	};

	static removeUserFavoritesCategory = async (req, res) => {
		const { error } = validateUserFavoritesCategorySchema(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.error(error, 'Validation error'));
		}

		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const { categoryFavorites } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const favorite = await UserFavorites.findOne({ userId, categoryFavorites });

		if (!favorite) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage('Category not found in your favorites!'));
		}

		const categoryFavorite = await UserFavorites.findByIdAndUpdate(favorite._id, {
			$pull: { categoryFavorites: categoryFavorites },
		});

		await categoryFavorite.save();

		return res
			.status(200)
			.json(ReturnResult.successMessage('Category successfully removed from your favorites!'));
	};

	static removeUserFavoritesPost = async (req, res) => {
		const { error } = validateUserFavoritesPostSchema(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.error(error, 'Validation error'));
		}

		const { userId } = req.params;

		if(isValidObjectId(userId) === false) {
			return res.status(400).send(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const { postFavorites } = req.body;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const favorite = await UserFavorites.findOne({ userId, postFavorites });

		if (!favorite) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage('Product not found in your favorites!'));
		}

		const postFavorite = await UserFavorites.findByIdAndUpdate(favorite._id, {
			$pull: { postFavorites: postFavorites },
		});

		await postFavorite.save();
		return res
			.status(200)
			.json(ReturnResult.successMessage('Product successfully removed from your favorites!'));
	};
}

// VALIDATIONS
function validateRegisterSchema(reqBody) {
	const schema = joi.object({
		fullName: joi.string().min(3).max(30).required(),
		email: joi.string().email().min(3).max(255).optional(),
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

function validateUpdateUserSchema(reqBody) {
	const schema = joi.object({
		userId: joi.string().required(),
		fullName: joi.string().min(3).max(30).required(),
		phoneNumber: joi.string().min(10).max(15).required(),
		shortDescription: joi.string().max(500).optional(),
	});

	return schema.validate(reqBody);
}

function validateUserFavoritesCategorySchema(reqBody) {
	const schema = joi.object({
		categoryFavorites: joi.string().required(),
	});

	return schema.validate(reqBody);
}

function validateUserFavoritesPostSchema(reqBody) {
	const schema = joi.object({
		postFavorites: joi.string().required(),
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

module.exports = UserController;
