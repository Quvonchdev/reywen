const { CurrencyType } = require('../models/post-models/currency-type-model');
const { OperationType } = require('../models/post-models/operation-type-model');
const { PriceType } = require('../models/post-models/price-type-model');
const { PaymentType } = require('../models/post-models/payment-type-model');
const Joi = require('joi');
const ReturnResult = require('../helpers/return-result');
const RedisCache = require('../utils/redis');

class CurrencyTypes {
	static async createCurrencyType(req, res) {
		const { error } = validationCurrencyType(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const { name, shortDescription, symbol, status } = req.body;

		const checkName = await CurrencyType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Currency Type already exists'));

		let currencyType = new CurrencyType({
			name,
			shortDescription,
			symbol,
			status,
		});

		await currencyType.save();

		await RedisCache.del('currencyType');

		res.status(201).json(ReturnResult.success(currencyType, 'Currency Type created successfully'));
	}

	static async updateCurrencyType(req, res) {
		const { error } = validationCurrencyType(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		const { name, shortDescription, symbol, status } = req.body;

		const checkName = await CurrencyType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Currency Type already exists'));

		const currencyType = await CurrencyType.findOneAndUpdate(
			{ _id: req.params.id },
			{
				name,
				shortDescription,
				symbol,
				status,
			},
			{ new: true }
		);

		if (!currencyType)
			return res.status(404).json(ReturnResult.errorMessage('Currency Type not found'));

		await RedisCache.del('currencyType');
		return res
			.status(200)
			.json(ReturnResult.success(currencyType, 'Currency Type updated successfully'));
	}

	static async deleteCurrencyType(req, res) {
		const currencyType = await CurrencyType.findOneAndDelete({ _id: req.params.id });

		if (!currencyType)
			return res.status(404).json(ReturnResult.errorMessage('Currency Type not found'));

		await RedisCache.del('currencyType');

		return res
			.status(200)
			.json(ReturnResult.success(currencyType, 'Currency Type deleted successfully'));
	}

	static async batchDeleteCurrencyType(req, res) {
		const currencyType = await CurrencyType.deleteMany({
			_id: {
				$in: req.body.ids,
			},
		});

		if (!currencyType)
			return res.status(404).json(ReturnResult.errorMessage('Currency Type not found'));

		await RedisCache.del('currencyType');

		return res
			.status(200)
			.json(ReturnResult.success(currencyType, 'Currency Type deleted successfully'));
	}

	static async getCurrencyType(req, res) {
		const currencyType = await CurrencyType.findOne({ _id: req.params.id });

		if (!currencyType)
			return res.status(404).json(ReturnResult.errorMessage('Currency Type not found'));

		return res
			.status(200)
			.json(ReturnResult.success(currencyType, 'Currency Type found successfully'));
	}

	static async getAllCurrencyType(req, res) {
		const cachedCurrencyType = await RedisCache.get('currencyType');

		if (cachedCurrencyType) {
			return res
				.status(200)
				.json(
					ReturnResult.success(
						JSON.parse(cachedCurrencyType),
						'Currency Type found successfully',
						true
					)
				);
		}

		const currencyType = await CurrencyType.find();

		if (!currencyType)
			return res.status(404).json(ReturnResult.errorMessage('Currency Type not found'));

		await RedisCache.set('currencyType', JSON.stringify(currencyType));

		return res
			.status(200)
			.json(ReturnResult.success(currencyType, 'Currency Type found successfully'));
	}
}

class OperationTypes {
	static async createOperationType(req, res) {
		const { error } = validationTypes(req.body);

		if (error) return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));

		const { name, shortDescription, status } = req.body;

		const checkName = await OperationType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Operation Type already exists'));

		let operationType = new OperationType({
			name,
			shortDescription,
			status,
		});

		await operationType.save();

		await RedisCache.del('operationType');

		return res
			.status(201)
			.json(ReturnResult.success(operationType, 'Operation Type created successfully'));
	}

	static async updateOperationType(req, res) {
		const { error } = validationTypes(req.body);

		if (error) return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));

		const { name, shortDescription, status } = req.body;

		const checkName = await OperationType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Operation Type already exists'));

		const operationType = await OperationType.findOneAndUpdate(
			{ _id: req.params.id },
			{
				name,
				shortDescription,
				status,
			},
			{ new: true }
		);

		if (!operationType)
			return res.status(404).json(ReturnResult.errorMessage('Operation Type not found'));

		await RedisCache.del('operationType');

		return res
			.status(200)
			.json(ReturnResult.success(operationType, 'Operation Type updated successfully'));
	}

	static async deleteOperationType(req, res) {
		const operationType = await OperationType.findOneAndDelete({ _id: req.params.id });

		if (!operationType)
			return res.status(404).json(ReturnResult.errorMessage('Operation Type not found'));

		await RedisCache.del('operationType');

		return res
			.status(200)
			.json(ReturnResult.success(operationType, 'Operation Type deleted successfully'));
	}

	static async batchDeleteOperationType(req, res) {
		const operationType = await OperationType.deleteMany({
			_id: {
				$in: req.body.ids,
			},
		});

		if (!operationType)
			return res.status(404).json(ReturnResult.errorMessage('Operation Type not found'));

		await RedisCache.del('operationType');

		return res
			.status(200)
			.json(ReturnResult.success(operationType, 'Operation Type deleted successfully'));
	}

	static async getOperationType(req, res) {
		const operationType = await OperationType.findOne({ _id: req.params.id });

		if (!operationType)
			return res.status(404).json(ReturnResult.errorMessage('Operation Type not found'));

		return res
			.status(200)
			.json(ReturnResult.success(operationType, 'Operation Type found successfully'));
	}

	static async getAllOperationType(req, res) {
		const cachedOperationType = await RedisCache.get('operationType');

		if (cachedOperationType) {
			return res
				.status(200)
				.json(
					ReturnResult.success(
						JSON.parse(cachedOperationType),
						'Operation Type found successfully',
						true
					)
				);
		}

		const operationType = await OperationType.find();

		if (!operationType)
			return res.status(404).json(ReturnResult.errorMessage('Operation Type not found'));

		await RedisCache.set('operationType', JSON.stringify(operationType));

		return res
			.status(200)
			.json(ReturnResult.success(operationType, 'Operation Type found successfully'));
	}
}

class PriceTypes {
	static async createPriceType(req, res) {
		const { error } = validationTypes(req.body);

		if (error) return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));

		const { name, shortDescription, status } = req.body;

		const checkName = await PriceType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Price Type already exists'));

		let priceType = new PriceType({
			name,
			shortDescription,
			status,
		});

		await priceType.save();

		await RedisCache.del('priceType');

		return res.status(201).json(ReturnResult.success(priceType, 'Price Type created successfully'));
	}

	static async updatePriceType(req, res) {
		const { error } = validationTypes(req.body);

		if (error) return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));

		const { name, shortDescription, status } = req.body;

		const checkName = await PriceType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Price Type already exists'));

		const priceType = await PriceType.findOneAndUpdate(
			{ _id: req.params.id },
			{
				name,
				shortDescription,
				status,
			},
			{ new: true }
		);

		if (!priceType) return res.status(404).json(ReturnResult.errorMessage('Price Type not found'));

		await RedisCache.del('priceType');

		return res.status(200).json(ReturnResult.success(priceType, 'Price Type updated successfully'));
	}

	static async deletePriceType(req, res) {
		const priceType = await PriceType.findOneAndDelete({ _id: req.params.id });

		if (!priceType) return res.status(404).json(ReturnResult.errorMessage('Price Type not found'));

		await RedisCache.del('priceType');

		return res
			.status(200)
			.json(ReturnResult.success(priceType, 'PriceType Type deleted successfully'));
	}

	static async batchDeletePriceType(req, res) {
		const priceType = await PriceType.deleteMany({
			_id: {
				$in: req.body.ids,
			},
		});

		if (!priceType) return res.status(404).json(ReturnResult.errorMessage('Price Type not found'));

		await RedisCache.del('priceType');

		return res.status(200).json(ReturnResult.success(priceType, 'Price Type deleted successfully'));
	}

	static async getPriceType(req, res) {
		const priceType = await PriceType.findOne({ _id: req.params.id });

		if (!priceType) return res.status(404).json(ReturnResult.errorMessage('Price Type not found'));

		return res.status(200).json(ReturnResult.success(priceType, 'Price Type found successfully'));
	}

	static async getAllPriceType(req, res) {
		const cachedPriceType = await RedisCache.get('priceType');

		if (cachedPriceType) {
			return res
				.status(200)
				.json(
					ReturnResult.success(JSON.parse(cachedPriceType), 'Price Type found successfully', true)
				);
		}

		const priceType = await PriceType.find();

		if (!priceType) return res.status(404).json(ReturnResult.errorMessage('Price Type not found'));

		await RedisCache.set('priceType', JSON.stringify(priceType));

		return res.status(200).json(ReturnResult.success(priceType, 'Price Type found successfully'));
	}
}

class PaymentTypes {
	static async createPaymentType(req, res) {
		const { error } = validationTypes(req.body);

		if (error) return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));

		const { name, shortDescription, status } = req.body;

		const checkName = await PaymentType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Payment Type already exists'));

		let paymentType = new PaymentType({
			name,
			shortDescription,
			status,
		});

		await paymentType.save();

		await RedisCache.del('paymentType');

		return res
			.status(201)
			.json(ReturnResult.success(paymentType, 'Payment Type created successfully'));
	}

	static async updatePaymentType(req, res) {
		const { error } = validationTypes(req.body);

		if (error) return res.status(400).json(ReturnResult.errorMessage(error.details[0].message));

		const { name, shortDescription, status } = req.body;

		const checkName = await PaymentType.findOne({ name });

		if (checkName)
			return res.status(400).json(ReturnResult.errorMessage('Payment Type already exists'));

		const paymentType = await PaymentType.findOneAndUpdate(
			{ _id: req.params.id },
			{
				name,
				shortDescription,
				status,
			},
			{ new: true }
		);

		if (!paymentType)
			return res.status(404).json(ReturnResult.errorMessage('Payment Type not found'));

		await RedisCache.del('paymentType');

		return res
			.status(200)
			.json(ReturnResult.success(paymentType, 'Payment Type updated successfully'));
	}

	static async deletePaymentType(req, res) {
		const paymentType = await PaymentType.findOneAndDelete({ _id: req.params.id });

		if (!paymentType)
			return res.status(404).json(ReturnResult.errorMessage('Payment Type not found'));

		await RedisCache.del('paymentType');

		return res
			.status(200)
			.json(ReturnResult.success(paymentType, 'Payment Type deleted successfully'));
	}

	static async batchDeletePaymentType(req, res) {
		const paymentType = await PaymentType.deleteMany({
			_id: {
				$in: req.body.ids,
			},
		});

		if (!paymentType)
			return res.status(404).json(ReturnResult.errorMessage('Payment Type not found'));

		await RedisCache.del('paymentType');

		return res
			.status(200)
			.json(ReturnResult.success(paymentType, 'Payment Type deleted successfully'));
	}

	static async getPaymentType(req, res) {
		const paymentType = await PaymentType.findOne({ _id: req.params.id });

		if (!paymentType)
			return res.status(404).json(ReturnResult.errorMessage('Payment Type not found'));

		return res
			.status(200)
			.json(ReturnResult.success(paymentType, 'Payment Type found successfully'));
	}

	static async getAllPaymentType(req, res) {
		const cachedPaymentType = await RedisCache.get('paymentType');

		if (cachedPaymentType) {
			return res
				.status(200)
				.json(
					ReturnResult.success(
						JSON.parse(cachedPaymentType),
						'Payment Type found successfully',
						true
					)
				);
		}

		const paymentType = await PaymentType.find();

		if (!paymentType)
			return res.status(404).json(ReturnResult.errorMessage('Payment Type not found'));

		await RedisCache.set('paymentType', JSON.stringify(paymentType));

		return res
			.status(200)
			.json(ReturnResult.success(paymentType, 'Payment Type found successfully'));
	}
}

// validate the request body for the currency type
function validationCurrencyType(reqBody) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		symbol: Joi.string().allow(null).optional(),
		status: Joi.boolean().optional(),
	});
	return schema.validate(reqBody);
}

// Validate Common Types
function validationTypes(reqBody) {
	const schema = Joi.object({
		name: Joi.alternatives(Joi.string(), Joi.object()).required(),
		shortDescription: Joi.alternatives(Joi.string(), Joi.object()).optional(),
		status: Joi.boolean().optional(),
	});
	return schema.validate(reqBody);
}

module.exports = {
	CurrencyTypes,
	PriceTypes,
	PaymentTypes,
	OperationTypes,
};
