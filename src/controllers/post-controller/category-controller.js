const { Category } = require('../../models/post-models/category-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const ReturnResult = require('../../helpers/return-result');
const RedisCache = require('../../utils/redis');
const path = require('path');
const fs = require('fs');
const removeUploadedFile = require('../../helpers/remove-uploaded-file');

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
	CATEGORY_COVER_IMAGE_NOT_FOUND: 'Category cover image not found. Please try again',
};

const UPLOADED_IMAGE_PATH = '../../../public/images';

class CategoryController {
	static createCategory = async (req, res) => {
		const { error } = validateCreateCategory(req.body);

		if (error) {
			removeFile(req);
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { name, shortDescription, createdBy } = req.body;

		const user = await User.findById(createdBy);

		if (!user) {
			removeFile(req);
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const category = await Category.findOne({ name: name });

		if (category) {
			removeFile(req);
			return res.status(400).json(ReturnResult.error(ERROR_MESSAGES.CATEGORY_NAME_EXISTS));
		}

		let coverImage = req.file ? path.basename(req.file.path) : null;

		const newCategory = new Category({
			name: name,
			shortDescription: shortDescription,
			coverImage: coverImage,
			createdBy: createdBy,
		});

		const result = await newCategory.save();

		await RedisCache.flush();

		return res.status(201).json(ReturnResult.success(result, SUCCESS_MESSAGES.CATEGORY_CREATED));
	};

	static updateCategory = async (req, res) => {
		const { error } = validateUpdateCategory(req.body);

		if (error) {
			removeFile(req);
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { name, shortDescription, updatedBy, isPopular, status } = req.body;
		const { categoryId } = req.params;

		const user = await User.findById(updatedBy);

		if (!user) {
			removeFile(req);
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const category = await Category.findById(categoryId);

		const categoryName = await Category.findOne({ name: name });

		if (!category) {
			removeFile(req);
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
		}

		if (categoryName) {
			removeFile(req);
			return res.status(400).json(ReturnResult.error(ERROR_MESSAGES.CATEGORY_NAME_EXISTS));
		}

		let coverImage = category.coverImage;

		if (req.file) {
			coverImage = path.basename(req.file.path);
		}

		category.name = name;
		category.shortDescription = shortDescription;
		category.coverImage = coverImage;
		category.isPopular = isPopular;
		category.status = status;
		category.updatedBy = updatedBy;
		category.updatedAt = Date.now();

		await category.save();

		await RedisCache.flush();

		return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_UPDATED));
	};

	static deleteCategory = async (req, res) => {
		const { categoryId } = req.params;

		const category = await Category.findByIdAndDelete(categoryId);

		if (!category) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
		}

		if (category.coverImage) {
			removeUploadedFile(path.join(__dirname, `${UPLOADED_IMAGE_PATH}/${category.coverImage}`));
		}

		await RedisCache.flush();

		return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_DELETED));
	};

	static batchDeleteCategories = async (req, res) => {
		const { error } = validateBatchDeleteCategories(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { ids, userId } = req.body;

		if (ids.length === 0) {
			return res.status(400).json(ReturnResult.errorMessage('Ids are required'));
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.USER_NOT_FOUND));
		}

		const categories = await Category.find({
			_id: {
				$in: ids,
			},
		});

		if (categories.length === 0) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORIES_NOT_FOUND));
		}

		categories.forEach((element) => {
			if (element.coverImage) {
				removeUploadedFile(path.join(__dirname, `${UPLOADED_IMAGE_PATH}/${category.coverImage}`));
			}
		});

		await Category.deleteMany({
			_id: {
				$in: ids,
			},
		});

		await RedisCache.flush();

		return res
			.status(200)
			.json(ReturnResult.successMessage(SUCCESS_MESSAGES.CATEGORY_BATCH_DELETED));
	};

	static getCategories = async (req, res) => {
		const cachedCategories = await RedisCache.get('categoriesAdmin');

		if (cachedCategories) {
			return res
				.status(200)
				.json(
					ReturnResult.success(
						JSON.parse(cachedCategories),
						SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL,
						true
					)
				);
		}

		const categories = await Category.find();

		if (categories.length > 0) {
			await RedisCache.set('categoriesAdmin', JSON.stringify(categories));
		}

		return res
			.status(200)
			.json(ReturnResult.success(categories, SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL));
	};

	static getCategory = async (req, res) => {
		const { categoryId } = req.params;

		const cashedCategory = await RedisCache.get(`categoryAdmin:${categoryId}`);

		if (cashedCategory) {
			return res
				.status(200)
				.json(
					ReturnResult.success(JSON.parse(cashedCategory), SUCCESS_MESSAGES.CATEGORY_FETCHED, true)
				);
		}

		const category = await Category.findById(categoryId);

		if (!category) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
		}

		await RedisCache.set(`categoryAdmin:${categoryId}`, JSON.stringify(category));

		return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_FETCHED));
	};

	static getCategoriesByPagination = async (req, res) => {
		const { error } = validateCategoryParams(req.query);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { page, limit } = req.query;

		const PAGE = parseInt(page, 10);
		const LIMIT = parseInt(limit, 10);

		const cacheCategories = await RedisCache.get(`categoriesPgAdmin:${page}:${limit}`);

		if (cacheCategories) {
			return res
				.status(200)
				.json(
					ReturnResult.success(
						JSON.parse(cacheCategories),
						SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL,
						true
					)
				);
		}

		const categories = await Category.find({})
			.limit(LIMIT * 1)
			.skip((PAGE - 1) * LIMIT)
			.exec();

		const totalItems = await Category.countDocuments();

		if (categories.length > 0) {
			await RedisCache.set(
				`categoriesPgAdmin:${page}:${limit}`,
				JSON.stringify(
					ReturnResult.paginate(
						categories,
						totalItems,
						PAGE,
						LIMIT,
						SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL,
						true
					)
				)
			);
		}

		return res
			.status(200)
			.json(
				ReturnResult.success(
					ReturnResult.paginate(categories, totalItems, PAGE, LIMIT),
					SUCCESS_MESSAGES.CATEGORY_FETCHED_ALL
				)
			);
	};

	static deleteCategoryCoverImage = async (req, res) => {
		const { categoryId } = req.params;

		const category = await Category.findById(categoryId);

		if (!category) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_NOT_FOUND));
		}

		if (!category.coverImage) {
			return res
				.status(404)
				.json(ReturnResult.errorMessage(ERROR_MESSAGES.CATEGORY_COVER_IMAGE_NOT_FOUND));
		}

		removeUploadedFile(path.join(__dirname, `${UPLOADED_IMAGE_PATH}/${category.coverImage}`));

		category.coverImage = null;

		await category.save();

		await RedisCache.flush();

		return res.status(200).json(ReturnResult.success(category, SUCCESS_MESSAGES.CATEGORY_UPDATED));
	};
}

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
		userId: Joi.string().required(),
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

function removeFile(req) {
	if (req.file) {
		removeUploadedFile(req.file.path);
	}
}

module.exports = CategoryController;
