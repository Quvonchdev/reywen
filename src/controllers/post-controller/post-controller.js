const { Post } = require('../../models/post-models/post-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const { UserMessage } = require('../../models/chat-models/user-message-model');
const ReturnResult = require('../../helpers/return-result');
const removeUploadedFile = require('../../helpers/remove-uploaded-file');
const Telegram = require('../../utils/telegram');
const path = require('path');
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
			limit: parseInt(limit, 10) || 10,
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
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const createdBy = req.body.createdBy;

		const user = await User.findById(createdBy);

		if (!user) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		// if title string or object I dont know check this
		const title = req.body.title;

		if (typeof title === 'string') {
			const checkTitle = await Post.findOne({ title });

			if (checkTitle) {
				if (req.files) {
					for (const file of req.files) {
						removeUploadedFile(file.path);
					}
				}
				return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.POST_TITLE_EXISTED));
			}
		} else if (typeof title === 'object') {
			const keys = Object.keys(title);
			if (keys) {
				for (const key of keys) {
					const checkTitle = await Post.findOne({ title: title[key] });

					if (checkTitle) {
						if (req.files) {
							for (const file of req.files) {
								removeUploadedFile(file.path);
							}
						}
						return res
							.status(400)
							.json(ReturnResult.errorMessage(ERROR_MESSAGES.POST_TITLE_EXISTED));
					}
				}
			}
		}

		const postImages = [];

		if (req.files) {
			for (const file of req.files) {
				postImages.push(path.basename(file.path));
			}
		}

		let coverImage = null;
		if (postImages.length > 0) {
			coverImage = postImages[0];
		}

		let location = null;
		if (req.body.longitude && req.body.latitude) {
			location = {
				type: 'Point',
				coordinates: [req.body.longitude, req.body.latitude],
			};
		}

		const post = new Post({
			...req.body,
			coverImage,
			postImages,
			location,
		});

		await post.save();
		return res.status(201).json(ReturnResult.success(post, SUCCESS_MESSAGES.CREATE_POST_SUCCESS));
	};

	static updatePostByUser = async (req, res) => {
		const { postId, userId } = req.params;

		const { error } = Validation.updatePostByUser(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const findPost = await Post.findById(postId);

		if (!findPost) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (findPost.createdBy !== userId) {
			return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.FORBIDDEN));
		}

		const title = req.body?.title;

		if (
			title !== findPost.title &&
			title !== undefined &&
			title !== null &&
			title !== '' &&
			title !== ' ' &&
			!title
		) {
			if (typeof title === 'string') {
				const checkTitle = await Post.findOne({ title });

				if (checkTitle) {
					return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.POST_TITLE_EXISTED));
				}
			} else if (typeof title === 'object') {
				const keys = Object.keys(title);
				if (keys) {
					for (const key of keys) {
						const checkTitle = await Post.findOne({ title: title[key] });

						if (checkTitle) {
							return res
								.status(400)
								.json(ReturnResult.errorMessage(ERROR_MESSAGES.POST_TITLE_EXISTED));
						}
					}
				}
			}
		}

		let location = null;
		if (req.body.longitude && req.body.latitude) {
			location = {
				type: 'Point',
				coordinates: [post.longitude, post.latitude],
			};
		}

		const post = await Post.findByIdAndUpdate(
			postId,
			{
				...req.body,
				location,
			},
			{ new: true }
		);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		return res.status(200).json(ReturnResult.success(post, SUCCESS_MESSAGES.UPDATE_POST_SUCCESS));
	};

	static updatePostCoverImage = async (req, res) => {
		const { postId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			if (req.file) {
				removeUploadedFile(req.file.path);
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}
		const post = await Post.findById(postId);

		if (!post) {
			if (req.file) {
				removeUploadedFile(req.file.path);
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (post.createdBy != userId) {
			if (req.file) {
				removeUploadedFile(req.file.path);
			}
			return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.FORBIDDEN));
		}

		let coverImage = null;

		if (req.file) {
			coverImage = path.basename(req.file.path);
		} else {
			return res.status(400).json(ReturnResult.errorMessage('Please upload a file'));
		}

		post.coverImage = coverImage;

		await post.save();

		return res
			.status(200)
			.json(ReturnResult.success(post, 'Post cover image updated successfully'));
	};

	static uploadMorePostImages = async (req, res) => {
		const { postId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}
		const post = await Post.findById(postId);

		if (!post) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (post.createdBy != userId) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.FORBIDDEN));
		}

		const postImages = [];

		if (req.files) {
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

		const { error } = Validation.modifyPostByAdmin(req.body);

		const { message} = req.body;

		if (error) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const user = await User.findById(req.body.modernizationBy);

		if (!user || user.userRoles.includes('Admin') == false) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const post = await Post.findById(postId);

		if (!post) {
			if (req.files) {
				for (const file of req.files) {
					removeUploadedFile(file.path);
				}
			}
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		const postImages = [];

		if (post.postImages) {
			for (const image of post.postImages) {
				postImages.push(`${envSecretsConfig.BASE_URL}/public/images/${image}`);
			}
		}

		let isSendedTelegram = false;
		if (post.isSendedTelegram == false) {
			if (post) {
				const telegramMessageResult = await Telegram.sendPictures(
					postImages,
					post,
					'https://google.com'
				);
				if (telegramMessageResult.error == false) {
					isSendedTelegram = true;
				}
			}
		}

		if (message) {
			const sendMessage = await UserMessage({
				message: message,
				sender: req.body.modernizationBy,
				receiver: post.createdBy,
			})

			await sendMessage.save();
		}

		const modernizationPost = await Post.findByIdAndUpdate(
			postId,
			{
				...req.body,
				isSendedTelegram,
			},
			{ new: true }
		);

		return res
			.status(200)
			.json(ReturnResult.success(modernizationPost, SUCCESS_MESSAGES.MODIFY_POST_SUCCESS));
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

		if (!user || user.userRoles.includes('Admin') == false) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		if (post.modernizationBy == userId) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_PERMISSION));
		}

		const userMessage = req.body.message;

		if (userMessage) {
			const sendMessage = await UserMessage.create({
				message: userMessage,
				sender: req.body.modernizationBy,
				receiver: post.createdBy,
			});

			await sendMessage.save();
		}

		const deletePost = await Post.findByIdAndDelete(postId);

		if (!deletePost) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_POST));
		}
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
			operationType: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			currencyType: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			priceType: Joi.array().items(Joi.string()).required(),
			price: Joi.number().required(),
			paymentTypes: Joi.array().items(Joi.string()).required(),
			facilities: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			fullInfo: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			country: Joi.string().required(),
			district: Joi.string().required(),
			region: Joi.string().required(),
			zone: Joi.string().required(),
			street: Joi.string().required().min(3).max(255),
			latitude: Joi.number().required(),
			longitude: Joi.number().required(),
			isAddressVisible: Joi.boolean().optional(),

			contactPhone: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			contactEmail: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			contactName: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			contactAddress: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			socialContacts: Joi.alternatives(Joi.string(),Joi.array(), Joi.object()).allow(null).optional(),
			isContactVisible: Joi.boolean().optional(),
		});

		return schema.validate(reqBody);
	}

	static updatePostByUser(reqBody) {
		const schema = Joi.object({
			title: Joi.alternatives(Joi.string(), Joi.object()).optional(),
			shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
			createdBy: Joi.string().required(),
			category: Joi.string().optional(),
			operationType: Joi.array().items(Joi.string()).optional(),
			currencyType: Joi.string().optional(),
			priceType: Joi.array().items(Joi.string()).optional(),
			price: Joi.number().optional(),
			paymentTypes: Joi.array().items(Joi.string()).optional(),
			facilities: Joi.alternatives(
				Joi.string(),
				Joi.object(),
				Joi.array().items(Joi.string())
			).optional(),
			fullInfo: Joi.alternatives(
				Joi.string(),
				Joi.object(),
				Joi.array().items(Joi.string())
			).optional(),

			country: Joi.string().optional(),
			district: Joi.string().optional(),
			region: Joi.string().optional(),
			zone: Joi.string().optional(),
			street: Joi.string().optional().min(3).max(255),

			latitude: Joi.number().optional(),
			longitude: Joi.number().optional(),
			isAddressVisible: Joi.boolean().optional(),

			contactPhone: Joi.string().optional(),
			contactEmail: Joi.string().email().optional(),
			contactName: Joi.string().optional(),
			contactAddress: Joi.string().optional(),
			socialContacts: Joi.alternatives(
				Joi.string(),
				Joi.object(),
				Joi.array().items(Joi.string())
			).optional(),
			isContactVisible: Joi.boolean().optional(),
		});

		return schema.validate(reqBody);
	}

	static modifyPostByAdmin(reqBody) {
		const schema = Joi.object({
			modernizationStatus: Joi.string().required().allow('pending', 'approved', 'rejected'),
			modernizationComment: Joi.string().optional(),
			modernizationBy: Joi.string().required(),
			isUrgently: Joi.boolean().optional(),
			expiredUrgentlyAt: Joi.date().optional(),
			isPremium: Joi.boolean().optional(),
			expiredPremiumAt: Joi.date().optional(),
			isVip: Joi.boolean().optional(),
			expiredVipAt: Joi.date().optional(),
			isTop: Joi.boolean().optional(),
			expiredTopAt: Joi.date().optional(),
			telegramMessage: Joi.alternatives(
				Joi.string(),
				Joi.object(),
				Joi.array().items(Joi.string())
			).optional(),
			status: Joi.boolean().optional(),
			isPopular: Joi.boolean().optional(),
			isAddressVisible: Joi.boolean().optional(),
			isContactVisible: Joi.boolean().optional(),
		});

		return schema.validate(reqBody);
	}
}

module.exports = PostController;
