const { Prices } = require('../../models/post-models/prices-model');
const RedisCache = require('../../utils/redis');
const ReturnResult = require('../../helpers/return-result');
const Joi = require('joi');

const MESSAGES = {
	GET_ALL_PRICES: 'Prices retrieved successfully',
	GET_PRICE_BY_ID: 'Price retrieved successfully',
	GET_PRICE_BY_NAME: 'Price retrieved successfully',
	CREATE_PRICE: 'Price created successfully',
	UPDATE_PRICE: 'Price updated successfully',
	DELETE_PRICE: 'Price deleted successfully',
};

class PricesController {
	static getAllPrices = async (req, res) => {
		const cachedPrices = await RedisCache.get('prices');

		if (cachedPrices) {
			return res
				.status(200)
				.json(ReturnResult.success(JSON.parse(cachedPrices), MESSAGES.GET_ALL_PRICES, true));
		}

		const prices = await Prices.find({});

		if (prices.length > 0) {
			await RedisCache.set('prices', JSON.stringify(prices));
		}

		return res.status(200).json(ReturnResult.success(prices, MESSAGES.GET_ALL_PRICES));
	};

	static getPriceById = async (req, res) => {
		const { priceId } = req.params;

		const cachedPrice = await RedisCache.get(`price-${priceId}`);
		if (cachedPrice) {
			return res
				.status(200)
				.json(ReturnResult.success(JSON.parse(cachedPrice), MESSAGES.GET_PRICE_BY_ID, true));
		}

		const price = await Prices.findById(priceId);

		if (!price) {
			return res.status(404).json(ReturnResult.errorMessage('Price not found'));
		}

		if (price) {
			await RedisCache.set(`price-${priceId}`, JSON.stringify(price));
		}

		return res.status(200).json(ReturnResult.success(price, MESSAGES.GET_PRICE_BY_ID));
	};

	static getPricesByPagination = async (req, res) => {
		const { page, limit } = req.params;

		const PAGE = parseInt(page, 10) || 1;
		const LIMIT = parseInt(limit, 10) || 10;

		const cachedPrices = await RedisCache.get(`prices-${PAGE}-${LIMIT}`);
		if (cachedPrices) {
			return res
				.status(200)
				.json(ReturnResult.success(JSON.parse(cachedPrices), MESSAGES.GET_ALL_PRICES, true));
		}

		const prices = await Prices.find({})
			.limit(LIMIT * 1)
			.skip((PAGE - 1) * LIMIT)
			.exec();

		if (prices.length > 0) {
			await RedisCache.set(`prices-${PAGE}-${LIMIT}`, JSON.stringify(prices));
		}

		const totalItems = await Prices.countDocuments();

		return res
			.status(200)
			.json(
				ReturnResult.success(
					ReturnResult.paginate(prices, totalItems, PAGE, LIMIT),
					MESSAGES.GET_ALL_PRICES
				)
			);
	};

	static createPrice = async (req, res) => {
		const { error } = createValidation(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const price = new Prices(req.body);

		const savedPrice = await price.save();

		if (savedPrice) {
			await RedisCache.flush();
		}

		return res.status(200).json(ReturnResult.success(savedPrice, MESSAGES.CREATE_PRICE));
	};

	static updatePrice = async (req, res) => {
		const { error } = createValidation(req.body);

		if (error) {
			return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));
		}

		const { priceId } = req.params;

		const price = await Prices.findById(priceId);

		if (!price) {
			return res.status(400).json(ReturnResult.errorMessage('Price not found'));
		}

		const updatedPrice = await Prices.findByIdAndUpdate(
			priceId,
			{
				$set: req.body,
			},
			{ new: true }
		);

		if (updatedPrice) {
			await RedisCache.flush();
		}

		return res.status(200).json(ReturnResult.success(updatedPrice, MESSAGES.UPDATE_PRICE));
	};

	static updatePriceStatus = async (req, res) => {
		const { priceId } = req.params;

		const price = await Prices.findById(priceId);

		if (!price) {
			return res.status(400).json(ReturnResult.errorMessage('Price not found'));
		}

		await Prices.updateMany({ _id: { $ne: priceId } }, { $set: { status: false } });

		const updatedPrice = await Prices.findByIdAndUpdate(
			priceId,
			{
				$set: { status: true },
			},
			{ new: true }
		);

		if (updatedPrice) {
			await RedisCache.flush();
		}

		return res.status(200).json(ReturnResult.success(updatedPrice, MESSAGES.UPDATE_PRICE));
	};

	static deletePrice = async (req, res) => {
		const { priceId } = req.params;

		const price = await Prices.findById(priceId);

		if (!price) {
			return res.status(400).json(ReturnResult.errorMessage('Price not found'));
		}

		const deletedPrice = await Prices.findByIdAndDelete(priceId);

		if (deletedPrice) {
			await RedisCache.flush();
		}

		return res.status(200).json(ReturnResult.success(deletedPrice, MESSAGES.DELETE_PRICE));
	};

	static batchDeletePrices = async (req, res) => {
		const { priceIds } = req.body;

		if (!priceIds || priceIds.length <= 0) {
			return res.status(400).json(ReturnResult.errorMessage('Price ids not found'));
		}

		const prices = await Prices.find({ _id: { $in: priceIds } });

		if (prices.length <= 0) {
			return res.status(400).json(ReturnResult.errorMessage('Prices not found'));
		}

		const deletedPrices = await Prices.deleteMany({ _id: { $in: priceIds } });

		if (deletedPrices) {
			await RedisCache.flush();
		}

		return res.status(200).json(ReturnResult.success(deletedPrices, MESSAGES.DELETE_PRICE));
	};
}

function createValidation(reqBody) {
	const schema = Joi.object({
		vip: Joi.alternatives(Joi.string(), Joi.object()).required(),
		top: Joi.alternatives(Joi.string(), Joi.object()).required(),
		urgently: Joi.alternatives(Joi.string(), Joi.object()).required(),
		premium: Joi.alternatives(Joi.string(), Joi.object()).required(),
		auksion: Joi.alternatives(Joi.string(), Joi.object()).required(),
		custom: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		status: Joi.boolean().optional(),
		vipDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		topDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		urgentlyDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		premiumDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		auksionDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		customDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
	});

	return schema.validate(reqBody);
}

module.exports = PricesController;
