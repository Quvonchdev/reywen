const { Post } = require('../../models/post-models/post-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const { UserMessage } = require('../../models/chat-models/user-message-model');
const ReturnResult = require('../../helpers/return-result');
const removeUploadedFile = require('../../helpers/remove-uploaded-file');
const Telegram = require('../../utils/telegram');
const path = require('path');
const TransactionPost = require('../../models/transaction-models/post-transaction-model');
const envSecretsConfig = require('../../configurations/env-secrets-config');

const SUCCESS_MESSAGES = {
	CREATE_POST_SUCCESS: 'Post created successfully',
	UPDATE_POST_SUCCESS: 'Post updated successfully',
	DELETE_POST_SUCCESS: 'Post deleted successfully',
	GET_POST_SUCCESS: 'Post get successfully',
	GET_ALL_POST_SUCCESS: 'Posts retrieved successfully',
	LIKE_POST_SUCCESS: 'Like post successfully',
	UNLIKE_POST_SUCCESS: 'Unlike post successfully',
	COMMENT_POST_SUCCESS: 'Comment post successfully',
	DELETE_COMMENT_POST_SUCCESS: 'Delete comment post successfully',
	MODIFY_POST_SUCCESS: 'Modify post successfully',
	GET_MESSAGE_SUCCESS: 'Get message successfully',
	READ_MESSAGE_SUCCESS: 'Read message successfully',
	DELETE_MESSAGE_SUCCESS: 'Delete message successfully',
};

const ERROR_MESSAGES = {
	CREATE_POST_FAIL: 'Create post failed',
	UPDATE_POST_FAIL: 'Update post failed',
	DELETE_POST_FAIL: 'Delete post failed',
	GET_POST_FAIL: 'Get post failed',
	GET_ALL_POST_FAIL: 'Get all posts failed',
	LIKE_POST_FAIL: 'Like post failed',
	UNLIKE_POST_FAIL: 'Unlike post failed',
	COMMENT_POST_FAIL: 'Comment post failed',
	DELETE_COMMENT_POST_FAIL: 'Delete comment post failed',
	NOT_FOUND_POST: 'Post not found',
	NOT_FOUND_USER: 'User not found',
	INVALID_POST_ID: 'Invalid post id',
	POST_TITLE_EXISTED: 'Post title existed. Please choose another title',
	NOT_PERMISSION: 'You do not have permission to do this. Please contact admin',
	FORBIDDEN: 'You do not have permission to do this. Please contact admin',
	NOT_FOUND_MESSAGE: 'Message not found',
	POST_TITLE_EXISTED: 'Post title existed. Please choose another title',
};

const UPLOADED_IMAGE_PATH = '../../../public/images';

class PostController {
	static getAllPosts = async (req, res) => {
		const posts = await Post.find();
		return res.status(200).json(ReturnResult.success(posts, SUCCESS_MESSAGES.GET_ALL_POST_SUCCESS));
	};

	static getPostsByPagination = async (req, res) => {
		const { page, limit, filter, sort } = req.query;

		const options = {
			page: parseInt(page, 10) || 1,
			limit: parseInt(limit, 10) || 15,
		};

		let query = {};
		let sortOptions = {};

		if (filter) {
			const filterParams = JSON.parse(filter);
			query = buildPostsFilterQuery(filterParams);
		}

		if (sort) {
			sortOptions = buildSortOptions(sort);
		}

		const posts = await Post.find(query)
			.sort(sortOptions)
			.limit(options.limit)
			.skip(options.limit * (options.page - 1))
			.exec();

		const totalItems = posts.length;

		return res
			.status(200)
			.json(
				ReturnResult.paginate(
					posts,
					totalItems,
					options.page,
					options.limit,
				)
			);
	};

	static getPost = async (req, res) => {
		const { postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		post.views += 1;
		await post.save();

		return res.status(200).json(ReturnResult.success(post, SUCCESS_MESSAGES.GET_POST_SUCCESS));
	};

	static createPostByUser = async (req, res) => {
		const { error } = Validation.createPostByUser(req.body);

		if (error) {
			removeImages(req);
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const createdBy = req.body.createdBy;

		const user = await User.findById(createdBy);

		if (!user) {
			removeImages(req);
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const title = req.body.title;

		const post_title = await Post.findOne({ title });

		if (post_title) {
			removeImages(req);
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.POST_TITLE_EXISTED));
		}

		const postImages = [];

		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				postImages.push(path.basename(file.path));
			}
		}

		let coverImage = null;
		if (postImages.length > 0) {
			coverImage = postImages[0];
		}

		// create post;
		const address = {
			country: req.body.country,
			region: req.body.region,
			district: req.body.district,
			zone: req.body.zone,
			street: req.body.street,
			location: req.body.location
		}

		const contact = {
			contactPhones: req.body.contactPhones,
			contactEmails: req.body.contactEmails,
			contactAddress: req.body.contactAddress,
			socialContacts: req.body.socialContacts
		}

		const post = new Post({
			title: req.body.title,
			shortDescription: req.body.shortDescription,
			createdBy: req.body.createdBy,
			category: req.body.category,
			tags: req.body.tags,
			price: req.body.price,
			facilities: req.body.facilities,
			fullInfo: req.body.fullInfo,
			address: address,
			contact: contact,
			coverImage: coverImage,
			postImages: postImages,
		})

		await post.save();
		return res.status(201).json(ReturnResult.success(post, SUCCESS_MESSAGES.CREATE_POST_SUCCESS));
	};

	static updatePostByUser = async (req, res) => {
		const { postId, userId } = req.params;

		const { error } = Validation.createPostByUser(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (post.createdBy !== userId) {
			return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.FORBIDDEN));
		}

		if(req.body.title == post.title) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.POST_TITLE_EXISTED));
		}

		const address = {
			country: req.body.country,
			region: req.body.region,
			district: req.body.district,
			zone: req.body.zone,
			street: req.body.street,
			location: req.body.location
		}

		const contact = {
			contactPhones: req.body.contactPhones,
			contactEmails: req.body.contactEmails,
			contactAddress: req.body.contactAddress,
			socialContacts: req.body.socialContacts
		}

		const request = {
			title: req.body.title,
			shortDescription: req.body.shortDescription,
			createdBy: req.body.createdBy,
			category: req.body.category,
			tags: req.body.tags,
			price: req.body.price,
			facilities: req.body.facilities,
			fullInfo: req.body.fullInfo,
			address: address,
			contact: contact,
			coverImage: coverImage,
			postImages: postImages,
		}

		post.title = request.title;
		post.shortDescription = request.shortDescription;
		post.createdBy = request.createdBy;
		post.category = request.category;
		post.tags = request.tags;
		post.price = request.price;
		post.facilities = request.facilities;
		post.fullInfo = request.fullInfo;
		post.address = request.address;
		post.contact = request.contact;
		post.coverImage = request.coverImage;
		post.postImages = request.postImages;
		post.address = request.address;
		post.contact = request.contact;

		await post.save();

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		return res.status(200).json(ReturnResult.success(post, SUCCESS_MESSAGES.UPDATE_POST_SUCCESS));
	};

	static uploadMorePostImages = async (req, res) => {
		const { postId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			removeImages(req);
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}
		const post = await Post.findById(postId);

		if (!post) {
			removeImages(req);
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (post.createdBy != userId) {
			removeImages(req);
			return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.FORBIDDEN));
		}

		const postImages = [];

		if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				postImages.push(path.basename(file.path));
			}
		} else {
			return res.status(400).json(ReturnResult.errorMessage('Please upload a file'));
		}

		// push also post.postImages
		post.postImages.push(...postImages);

		await post.save();
		return res.status(200).json(ReturnResult.success(post, 'Post images updated successfully'));
	};

	static modifyPostByAdmin = async (req, res) => {
		const { postId } = req.params;

		const { message, modernizationBy, status, isSendTelegram} = req.body;

		const schema = Joi.object({
			message: Joi.string().allow(null).required(),
			modernizationBy: Joi.string().required(),
			status: Joi.string().required(),
			isSendTelegram: Joi.boolean().required(),
		})

		const { error } = schema.validate(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const user = await User.findById(modernizationBy);

		if (!user || user.userRoles.includes('Admin') == false || user.userRoles.includes('SuperAdmin') == false) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if(status == 'rejected') {
			post.status = status;
			post.modernization = {
				isSendedTelegram: false,
				modernizationComment: message,
				modernizationBy: modernizationBy,
			}

			await post.save();

			return res.status(200).json(ReturnResult.success(post, "Post rejected successfully"));
		}

		post.status = status;
		post.modernization = {
			isSendedTelegram: isSendTelegram,
			modernizationComment: message,
			modernizationBy: modernizationBy,
		}

		await post.save();

		const postImages = [];

		if (post.postImages) {
			for (const image of post.postImages) {
				postImages.push(`${envSecretsConfig.BASE_URL}/public/images/${image}`);
			}
		}

		if (isSendTelegram == true) {
			if (post && postImages && postImages.length > 0) {
				 await Telegram.sendPictures(
					postImages,
					post,
					'https://google.com'
				);
			}
		}
	
		const sendMessage = await UserMessage({
			message: message,
			sender: req.body.modernizationBy,
			receiver: post.createdBy,
		})

		await sendMessage.save();

		return res
			.status(200)
			.json(ReturnResult.success(modernizationPost, SUCCESS_MESSAGES.MODIFY_POST_SUCCESS));
	};

	static premiumPost = async (req, res) => {
		const { postId, userId } = req.params;

		const post = await Post.findOne({ _id: postId, createdBy: userId });
		const user = await User.findById(userId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const { price } = req.body;
		
		if(price > user.balance) {
			return res.status(400).json(ReturnResult.errorMessage("Your balance is not enough to pay. Please recharge your balance"));
		}

		user.balance = user.balance - price;
		await user.save();

		post.premium = {
			isPremium: true,
			premiumStartedAt: Date.now(),
			premiumExpiredAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days
		}

		const transaction = new TransactionPost({
			user: userId,
			amount: price,
			postId: postId,
		})

		await transaction.save();

		await post.save();
		return res.status(200).json(ReturnResult.success(post, "Premium post successfully"));
	};

	static deletePostByUser = async (req, res) => {
		const { postId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (post.createdBy != userId) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_PERMISSION));
		}

		const deletePost = await Post.findByIdAndDelete(postId);

		if (!deletePost) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		return res.status(200).json(ReturnResult.success({}, SUCCESS_MESSAGES.DELETE_POST_SUCCESS));
	};

	static deletePostByAdmin = async (req, res) => {
		const { postId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user || user.userRoles.includes('Admin') == false || user.userRoles.includes('SuperAdmin') == false) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (!post.modernization && post.modernization.modernizationBy !== userId) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_PERMISSION));
		}

		const userMessage = req.body.message;

		if (userMessage) {
			const sendMessage = await UserMessage.create({
				message: userMessage,
				sender: userId,
				receiver: post.createdBy,
			});

			await sendMessage.save();
		}

		const deletePost = await Post.findByIdAndDelete(postId);

		if (!deletePost) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		return res.status(200).json(ReturnResult.success({}, SUCCESS_MESSAGES.DELETE_POST_SUCCESS));
	};
}

function buildPostsFilterQuery(filterParams) {
	const query = {};

	if (filterParams.createdBy) {
		query.createdBy = filterParams.createdBy;
	}

	if (filterParams.category) {
		query.category = filterParams.category;
	}

	if (filterParams.operationType) {
		let operationType = filterParams.operationType.split(',');
		query.operationType = { $in: operationType };
	}

	if (filterParams.currencyType) {
		query.currencyType = filterParams.currencyType;
	}

	if (filterParams.priceType) {
		let priceType = filterParams.priceType.split(',');
		query.priceType = { $in: priceType };
	}

	if (filterParams.paymentTypes) {
		let paymentTypes = filterParams.paymentTypes.split(',');
		query.paymentTypes = { $in: paymentTypes };
	}

	if (filterParams.price) {
		query.price = {};

		if (filterParams.price.min) {
			query.price.$gte = filterParams.price.min;
		}

		if (filterParams.price.max) {
			query.price.$lte = filterParams.price.max;
		}
	}

	if(filterParams.status) {
		query.status = filterParams.status;
	}

	if (filterParams.facilities) {
		let facilities = filterParams.facilities.split(',');
		query.facilities = { $in: facilities };
	}

	if (filterParams.country) {
		query.country = filterParams.country;
	}

	if (filterParams.district) {
		query.district = filterParams.district;
	}

	if (filterParams.region) {
		query.region = filterParams.region;
	}

	if (filterParams.zone) {
		query.zone = filterParams.zone;
	}

	if (filterParams.lat && filterParams.long) {
		query.location = {
			$near: {
				$geometry: {
					type: 'Point',
					coordinates: [filterParams.latitude, filterParams.longitude],
				},
				$maxDistance: 10000,
			},
		};
	}

	if (filterParams.isPopular) {
		query.isPopular = filterParams.isPopular;
	}

	if (filterParams.title) {
		query.title = { $regex: new RegExp(filterParams.title, 'gi') };
	}

	return query;
}

function buildSortOptions(sortParam) {
	const sortOptions = {};

	if (sortParam) {
		const fields = sortParam.split(',');

		fields.forEach((field) => {
			const sortOrder = field.startsWith('-') ? -1 : 1;
			const fieldName = field.replace(/^-/, '');

			sortOptions[fieldName] = sortOrder;
		});
	}

	return sortOptions;
}

class Validation {
	static createPostByUser(reqBody) {
		const schema = Joi.object({
			title: Joi.alternatives(Joi.string(), Joi.object()).required(),
			shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
			createdBy: Joi.string().required(),
			category: Joi.string().required(),
			tags: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).optional(),
			price: Joi.number().required(),
			facilities: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			fullInfo: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			country: Joi.string().required(),
			district: Joi.string().required(),
			region: Joi.string().required(),
			zone: Joi.string().required(),
			street: Joi.string().required().min(3).max(255),
			location: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).required(),

			contactPhones: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			contactEmails: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			contactAddress: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			socialContacts: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
		});

		return schema.validate(reqBody);
	}
}

function removeImages(req) {
	if (req.files && req.files.length > 0) {
		for (const file of req.files) {
			removeUploadedFile(file.path);
		}
	}
}

module.exports = PostController;
