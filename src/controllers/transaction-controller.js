const { User } = require('../models/user-models/user-model');
const { transactionModel } = require('../models/transaction-models/transaction-model');
const { userTransactionModel } = require('../models/transaction-models/user-transaction-model');
const { authorization } = require('../helpers/check-signature');
const envSecrets = require('../configurations/env-secrets-config');
const ReturnResult = require('../helpers/return-result');

const { TRANSACTION_CONSTANTS, TRANSACTION_ENUMS } = require('../enums/transaction-enum');
const { isValidObjectId } = require('mongoose');

class TransactionController {
	static generateUrl = async (req, res) => {
		const { amount, user_id } = req.body;

		const orderTransaction = new userTransactionModel({
			amount,
			user_id: user_id,
		});

		await orderTransaction.save();

		const returnUrl = envSecrets.CLIENT_REDIRECT_URL + orderTransaction._id;
		const url = generate_url(orderTransaction._id, amount, returnUrl);
		return res.status(200).json(ReturnResult.success(url, 'Click URL generated successfully'));
	};

	static prepare = async (req, res) => {
		console.log(req.body, "prepare body")
		console.log(req, "prepare body")
		const data = {
			click_trans_id: req.body?.click_trans_id,
			service_id: req.body?.service_id,
			amount: req.body?.amount,
			action: req.body?.action,
			sign_time: req.body?.sign_time,
			sign_string: req.body?.sign_string,
			merchant_trans_id: req.body?.merchant_trans_id,
			merchant_prepare_id: req.body?.merchant_prepare_id,
			error: req.body?.error,
			error_note: req.body?.error_note,
			click_paydoc_id: req.body?.click_paydoc_id,
		};

		console.log(data, "data prepare")

		if (authorization(data) == false) {

			data.error = TRANSACTION_CONSTANTS.AUTHORIZATION_FAIL_CODE;
			data.error_note = TRANSACTION_CONSTANTS.AUTHORIZATION_FAIL;

			return res.json(data);
		}

		console.log(authorization(data), "auth prepare")

		const isTransactionAvailable = await checkTransaction(data.merchant_trans_id, data.amount);

		console.log(isTransactionAvailable, "isTransactionAvailable prepare")

		if (isTransactionAvailable == true) {
			const new_transaction = new transactionModel({
				click_trans_id: data.click_trans_id,
				merchant_trans_id: data.merchant_trans_id,
				amount: data.amount,
				action: TRANSACTION_CONSTANTS.PREPARE,
				sign_string: data.sign_string,
				sign_datetime: data.sign_time,
			});

			await new_transaction.save();

			data.merchant_prepare_id = new_transaction._id;

			console.log(data, "data prepare")
			return res.json(data);
		} else {
			return res.json({
				error: isTransactionAvailable,
			});
		}
	};

	static complete = async (req, res) => {
		console.log(req.body, "complete body")
		console.log(req, "complete body")

		const data = {
			click_trans_id: req.body?.click_trans_id,
			service_id: req.body?.service_id,
			amount: req.body?.amount,
			action: req.body?.action,
			sign_time: req.body?.sign_time,
			sign_string: req.body?.sign_string,
			merchant_trans_id: req.body?.merchant_trans_id,
			merchant_prepare_id: req.body?.merchant_prepare_id,
			error: req.body?.error,
			error_note: req.body?.error_note,
			click_paydoc_id: req.body?.click_paydoc_id,
		};

		console.log(data, "data complete")

		if (authorization(data) == false) {
			data.error = TRANSACTION_CONSTANTS.AUTHORIZATION_FAIL_CODE;
			data.error_note = TRANSACTION_CONSTANTS.AUTHORIZATION_FAIL;
			return res.json(data);
		}

		console.log(authorization(data), "auth complete")

		const isTransactionAvailable = await checkTransaction(data.merchant_trans_id, data.amount);

		console.log(isTransactionAvailable, "isTransactionAvailable complete")

		if (isTransactionAvailable == true) {
			try {
				const transaction = await transactionModel.findById(data.merchant_prepare_id);

				console.log(transaction, "transaction complete")

				if (data.error == TRANSACTION_CONSTANTS.A_LACK_OF_MONEY) {
					data.error = TRANSACTION_CONSTANTS.A_LACK_OF_MONEY_CODE;
					transaction.action = TRANSACTION_CONSTANTS.A_LACK_OF_MONEY;
					transaction.status = TRANSACTION_ENUMS.CANCELED;
					transaction.save();

					console.log(data, "data complete error")
					return res.json(data);
				}

				if (transaction.action == TRANSACTION_CONSTANTS.A_LACK_OF_MONEY) {
					data.error = TRANSACTION_CONSTANTS.A_LACK_OF_MONEY_CODE;

					console.log(data, "data complete action")
					return res.json(data);
				}

				if (transaction.action == data.action) {
					data.error = TRANSACTION_CONSTANTS.INVALID_ACTION;
					console.log(data, "data complete")
					return res.json(data);
				}

				if (transaction.amount != data.amount) {
					data.error = TRANSACTION_CONSTANTS.INVALID_AMOUNT;
					console.log(data, "data complete amount")
					return res.json(data);
				}

				transaction.action = data.action;
				transaction.status = TRANSACTION_ENUMS.FINISHED;
				transaction.save();

				data.merchant_confirm_id = transaction._id;

				const orderTransaction = await userTransactionModel.findOne({
					_id: transaction.merchant_trans_id,
				});

				orderTransaction.isPaid = true;
				orderTransaction.save();

				console.log(orderTransaction, "orderTransaction complete");

				await User.findOneAndUpdate(
					{
						_id: orderTransaction.user_id,
					},
					{
						$inc: {
							balance: orderTransaction.amount,
						},
					},
					{
						new: true,
					}
				);

				console.log(data, "data complete")
				return res.json(data);
			} catch (error) {
				data.error = TRANSACTION_CONSTANTS.TRANSACTION_NOT_FOUND;
				return res.json(data);
			}
		} else {
			return res.json({
				error: isTransactionAvailable,
			});
		}
	};
}

async function checkTransaction(order_id, amount) {
	if (order_id) {
		if (isValidObjectId(order_id) == false) {
			return TRANSACTION_CONSTANTS.ORDER_NOT_FOUND;
		}

		const transaction = await userTransactionModel.findOne({ _id: order_id });

		if (!transaction) {
			return TRANSACTION_CONSTANTS.ORDER_NOT_FOUND;
		}

		if (parseInt(transaction.amount) === parseInt(amount)) {
			return TRANSACTION_CONSTANTS.ORDER_FOUND;
		} else {
			return TRANSACTION_CONSTANTS.INVALID_AMOUNT;
		}
	} else {
		return TRANSACTION_CONSTANTS.ORDER_NOT_FOUND;
	}
}

function generate_url(order_id, amount, return_url = null) {
	const SERVICE_ID = envSecrets.CLICK_SERVICE_ID;
	const MERCHANT_ID = envSecrets.CLICK_MERCHANT_ID;

	let URL = `https://my.click.uz/services/pay?service_id=${SERVICE_ID}&merchant_id=${MERCHANT_ID}&amount=${amount}&transaction_param=${order_id}`;

	if (return_url) {
		URL += `&return_url=${return_url}`;
	}

	return URL;
}

module.exports = TransactionController;
