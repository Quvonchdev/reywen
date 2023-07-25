const { Category } = require('../models/product-models/category-model');
const Joi = require('joi');
const { User } = require('../models/user-models/user-model');
const Cloudinary = require('../utils/cloudinary');
const ReturnResult = require('../helpers/return-result');
const RedisCache = require('../utils/redis');

const SUCCESS_MESSAGES = {
	CATEGORY_CREATED: 'Category created successfully',
	CATEGORY_UPDATED: 'Category updated successfully',
	CATEGORY_DELETED: 'Category deleted successfully',
	CATEGORIES_RETRIEVED: 'Categories retrieved successfully',
	CATEGORY_RETRIEVED: 'Category retrieved successfully',
	CATEGORY_BATCH_DELETED: 'Categories deleted successfully',
	CATEGORY_FETCHED_ALL: 'Categories fetched successfully',
	CATEGORY_FETCHED: 'Category fetched successfully',
};

const ERROR_MESSAGES = {
	CATEGORY_NOT_FOUND: 'Category not found. Please check your category id',
	CATEGORY_NOT_CREATED: 'Category not created. Please try again',
	CATEGORY_NOT_UPDATED: 'Category not updated. Please try again',
	CATEGORY_NOT_DELETED: 'Category not deleted. Please try again',
	CATEGORIES_NOT_RETRIEVED: 'Categories not retrieved. Please try again',
	CATEGORY_NOT_RETRIEVED: 'Category not retrieved. Please check your category id',
	CATEGORY_NAME_EXISTS: 'Category name already exists. Please try another name',
	USER_NOT_FOUND: 'User not found. Please check your user id',
	CATEGORY_IMG_NOT_DELETED: 'Category image not deleted. Please try again',
	FILE_NOT_UPLOADED: 'File not uploaded. Please try again',
	CATEGORY_UPDATION_FAILED: 'Category updation failed. Please try again',
	CATEGORIES_NOT_FOUND: 'Categories not found. Please check your category ids',
};

// ! -- Create Category -- ! //
const createCategory = async (req, res) => {
	const { error } = validateCreateCategory(req.body);

	if (error) {
		return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
	}

	const { name, shortDescription, createdBy } = req.body;

	const user = await User.findById(createdBy);

	if (!user) {
		return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	const category = await Category.findOne({ name: name });

	if (category) {
		return res.status(400).json(ReturnResult.error(ERROR_MESSAGES.CATEGORY_NAME_EXISTS));
	}

	let coverImage = null;

	if (req.file) {
		const resultUploadedImage = await Cloudinary.uploadFile(req.file).then((result) => {
			return result;
		});

		if (resultUploadedImage.error) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_CREATED));
		}

		coverImage = resultUploadedImage.data;
	}

	const newCategory = new Category({
		name: name,
		shortDescription: shortDescription,
		coverImage: coverImage,
		createdBy: createdBy,
	});

	const result = await newCategory.save();

	await RedisCache.del('categories');

	return res.status(201).json(ReturnResult.success(result, SUCCESS_MESSAGES.CATEGORY_CREATED));
};

const updateCategory = async (req, res) => {
	const { error } = validateUpdateCategory(req.body);

	if (error) {
		return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
	}

	const { name, shortDescription, updatedBy, isPopular, status } = req.body;
	const { categoryId } = req.params;

	const user = await User.findById(updatedBy);

	if (!user) {
		return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	const category = await Category.findById(categoryId);

	const categoryName = await Category.findOne({ name: name });

	if (!category) {
		return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
	}

	if (categoryName) {
		return res.status(400).json(ReturnResult.error(ERROR_MESSAGES.CATEGORY_NAME_EXISTS));
	}

	let coverImage = category.coverImage;

	if (req.file) {
		if (category.coverImage.public_id) {
			await Cloudinary.deleteFile(category.coverImage.public_id)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					return res
						.status(500)
						.json(ReturnResult.error(err, ERROR_MESSAGES.CATEGORY_UPDATION_FAILED));
				});
		}

		const resultUploadedImage = await Cloudinary.uploadFile(req.file)
			.then((result) => {
				return result;
			})
			.catch((err) => {
				return res
					.status(500)
					.json(ReturnResult.error(err, ERROR_MESSAGES.CATEGORY_UPDATION_FAILED));
			});

		if (resultUploadedImage.error) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.FILE_NOT_UPLOADED));
		}

		coverImage = resultUploadedImage.data;
	}

	category.name = name;
	category.shortDescription = shortDescription;
	category.coverImage = coverImage;
	category.isPopular = isPopular;
	category.status = status;
	category.updatedBy = updatedBy;
	category.updatedAt = Date.now();

	await category.save();

	await RedisCache.del('categories');
	await RedisCache.del(`category:${categoryId}`);

	return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_UPDATED));
};

const deleteCategory = async (req, res) => {
	const { categoryId } = req.params;

	const category = await Category.findByIdAndDelete(categoryId);

	if (!category) {
		return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
	}

	if (category.coverImage) {
		if (category.coverImage.public_id) {
			await Cloudinary.deleteFile(category.coverImage.public_id)
				.then((result) => {
					return result;
				})
				.catch((err) => {
					return res
						.status(500)
						.json(ReturnResult.error(err, ERROR_MESSAGES.CATEGORY_IMG_NOT_DELETED));
				});
		}
	}

	await RedisCache.del('categories');
	await RedisCache.del(`category:${categoryId}`);

	return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_DELETED));
};

const batchDeleteCategories = async (req, res) => {
	const { error } = validateBatchDeleteCategories(req.body);

	if (error) {
		return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
	}

	const { ids, userId } = req.body;

	const user = await User.findById(userId);

	if (!user) {
		return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
	}

	const categories = await Category.find({
		_id: {
			$in: ids,
		},
	})

	if (categories.length === 0) {
		return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORIES_NOT_FOUND));
	}

	const coverImagesPublicIds = categories.filter((category) => category.coverImage !== null)
		.filter((category) => typeof category.coverImage !== 'string')
		.map((category) => {
			if(category.coverImage.hasOwnProperty('public_id')) {
				return category.coverImage.public_id;
			}
		});

	if (coverImagesPublicIds.length > 0) {
		const result = await Cloudinary.batchDeleteFiles(coverImagesPublicIds)
			.then((result) => {
				return result;
			})
			.catch((err) => {
				return res
					.status(500)
					.json(ReturnResult.error(err, ERROR_MESSAGES.CATEGORY_IMG_NOT_DELETED));
			});

		if(result.error) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_DELETED));
		}
	}

	await Category.deleteMany({
		_id: {
			$in: ids
		},
	});
	
	await RedisCache.del('categories');
	await ids.forEach(async (id) => {
		await RedisCache.del(`category:${id}`);
	});

	return res.status(200).json(ReturnResult.successMessage(SUCCESS_MESSAGES.CATEGORY_BATCH_DELETED));
};

const getCategories = async (req, res) => {

	const cachedCategories = await RedisCache.get('categories');

	if(cachedCategories) {
		return res.status(200).json(ReturnResult.success(JSON.parse(cachedCategories), SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL, true));
	}

	const categories = await Category.find();

	await RedisCache.set('categories', JSON.stringify(categories));

	return res
		.status(200)
		.json(ReturnResult.success(categories, SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL));
};

const getCategory = async (req, res) => {
	const { categoryId } = req.params;

	const cashedCategory = await RedisCache.get(`category:${categoryId}`);

	if(cashedCategory) {
		return res.status(200).json(ReturnResult.success(JSON.parse(cashedCategory), SUCCESS_MESSAGES.CATEGORY_FETCHED, true));
	}

	const category = await Category.findById(categoryId);

	if (!category) {
		return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
	}

	await RedisCache.set(`category:${categoryId}`, JSON.stringify(category));

	return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_FETCHED));
};

const getCategoriesByPagination = async (req, res) => {
	const { error } = validateCategoryParams(req.query);

	if (error) {
		return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
	}

	const { page, limit } = req.query;

	const PAGE = parseInt(page);
	const LIMIT = parseInt(limit);

	const categories = await Category.find()
		.limit(LIMIT * 1)
		.skip((PAGE - 1) * LIMIT)
		.exec();

	const count = await Category.countDocuments();

	let returnData = {
		totalPages: Math.ceil(Number(count / limit)),
		totalItems: count,
		currentPage: page,
		currentItem: categories.length,
		data: categories,
	}

	return res.status(200).json(
		ReturnResult.success(
			returnData,
			SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL
		)
	);
};

// VALIDATIONS
function validateCreateCategory(category) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		createdBy: Joi.string().required(),
		shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
	});

	return schema.validate(category);
}

function validateUpdateCategory(category) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		updatedBy: Joi.string().required(),
		isPopular: Joi.boolean().optional(),
		status: Joi.boolean().optional(),
	});

	return schema.validate(category);
}

function validateBatchDeleteCategories(categories) {
	const schema = Joi.object({
		ids: Joi.array().items(Joi.string()).required(),
		userId: Joi.string().required()
	});

	return schema.validate(categories);
}

function validateCategoryParams(categoryQueryParams) {
	const schema = Joi.object({
		page: Joi.required(),
		limit: Joi.required(),
	});

	return schema.validate(categoryQueryParams);
}

module.exports = {
	createCategory,
	updateCategory,
	deleteCategory,
	batchDeleteCategories,
	getCategories,
	getCategoriesByPagination,
	getCategory,
};
