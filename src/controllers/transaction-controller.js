const { Post } = require('../models/post-models/post-model');
const { User } = require('../models/user-models/user-model');
const ReturnResult = require('../helpers/return-result');
const { Auction } = require('../models/auction-models/auction-model');
const { transactionModel } = require('../models/transaction-models/transaction-model');
const { Prices } = require('../models/post-models/prices-model');

const {
    ClickError,
    ClickAction,
    TransactionStatus,
    } = require("../enums/transaction-enum");

const { checkClickSignature } = require("../helpers/check-signature");

class TransactionController {
    static prepareTransaction = async (req, res) => {

        const { click_trans_id, service_id, merchant_trans_id, error, error_note,  amount, action, sign_time, sign_string, click_paydoc_id } = req.body;

          console.log(req.body, "body");

            const signatureData = {
                click_trans_id,
                service_id,
                merchant_trans_id,
                amount: amount,
                action: action,
                sign_time: sign_time,
            };

            console.log(signatureData, "signature");

            const checkSignature = checkClickSignature(signatureData, sign_string);

            console.log(checkSignature, "check");

            if (!checkSignature) {
                return res.status(400).json(ReturnResult.error(
                    {
                        error: ClickError.SignFailed,
                        error_note: "Invalid sign",
                    },
                    "Invalid sign"
                ));
            }

            console.log(parseInt(action, "action"));

            if (parseInt(action) !== ClickAction.Prepare) {
                return res.status(400).json(ReturnResult.error(
                    {
                        error: ClickError.ActionNotFound,
                        error_note: "Action not found",
                    },
                    "Action not found"
                ))
            }

            const isAlreadyPaid = await transactionModel.findOne({
                merchant_trans_id: merchant_trans_id,
                status: TransactionStatus.Paid,
            })

            console.log(isAlreadyPaid, "isPaid");

            if (isAlreadyPaid) {
                return res.status(400).json(ReturnResult.error(
                    {
                        error: ClickError.AlreadyPaid,
                        error_note: "Already paid",
                    },
                    "Already paid"
                ))
            }

            const post = await Post.findById(merchant_trans_id);
            const auction = await Auction.findById(merchant_trans_id);

            if(!post && !auction) {
                return res.status(400).json(ReturnResult.error(
                    {
                        error: ClickError.BadRequest,
                        error_note: "Not found",
                    },
                    "Not found"
                ))
            }

            const transaction = await transactionModel.findOne({
                transId: click_trans_id,
            });

            console.log(transaction);

            if (transaction && transaction.status === TransactionStatus.Canceled) {
                return res.status(400).json(ReturnResult.error(
                    {
                        error: ClickError.TransactionCanceled,
                        error_note: "Transaction canceled",
                    },
                    "Transaction canceled"
                ))
            }

            const time = new Date().getTime();

            const newTransaction = new transactionModel({
                transId: click_trans_id,
                merchant_trans_id: merchant_trans_id,
                status: TransactionStatus.Pending,
                create_time: time,
                amount,
                prepare_id: time,
            });

            console.log(newTransaction);

            await newTransaction.save();

            const returnResult = {
                click_trans_id: click_trans_id,
                merchant_trans_id: merchant_trans_id,
                merchant_prepare_id: time,
                error: ClickError.Success,
                error_note: "Success",
            }
            
            return res.status(200).json(ReturnResult.success(
                returnResult,
                "Successfully prepared transaction"
            ))

    };

    static completeTransaction = async (req, res) => {

        const { click_trans_id, service_id, merchant_trans_id, error, error_note,  amount, action, sign_time, sign_string, click_paydoc_id, prepare_id = 1693620895033 } = req.body;

        const signatureData = {
            click_trans_id,
            service_id,
            merchant_trans_id,
            amount: amount,
            action: action,
            sign_time: sign_time,
            prepare_id: prepare_id,
        };
      
          const checkSignature = checkClickSignature(signatureData, sign_string);
          if (!checkSignature) {
            return res.status(400).json(ReturnResult.error({
              error: ClickError.SignFailed,
              error_note: "Invalid sign",
            }, "Invalid sign"));
          }

          console.log(parseInt(action), "action");
          console.log(prepare_id, "prepareId");

          if(parseInt(action) !== ClickAction.Complete) {
            return res.status(400).json(ReturnResult.error({
                error: ClickError.ActionNotFound,
                error_note: "Action not found",
            }, "Action not found"));
          }


            const post = await Post.findById(merchant_trans_id);
            const auction = await Auction.findById(merchant_trans_id);

            if (!post && !auction) {
                return res.status(400).json(ReturnResult.error({
                    error: ClickError.BadRequest,
                    error_note: "Not found",
                }, "Not found"));
            }

            const isPrepared = await transactionModel.findOne({
                prepare_id: prepare_id
            });

            if (!isPrepared) {
                return res.status(400).json(ReturnResult.error({
                    error: ClickError.TransactionNotFound,
                    error_note: "Transaction not found",
                }, "Transaction not found"));
            }

            const isAlreadyPaid = await transactionModel.findOne({
                userId: merchant_trans_id,
                status: TransactionStatus.Paid,
            })

            if (isAlreadyPaid) {
                return  res.status(400).json(ReturnResult.error({
                    error: ClickError.AlreadyPaid,
                    error_note: "Already paid",
                }, "Already paid"));
            }

            const prices = await Prices.find().sort({ createdAt: -1 }).limit(1);

            // check if prices exist
            if (!prices) {
                return res.status(400).json(ReturnResult.error({
                    error: ClickError.BadRequest,
                    error_note: "Prices not found",
                }, "Prices not found"));
            }

            const transaction = await transactionModel.findOne({
                transId: click_trans_id,
            });

            console.log(transaction);

            if (transaction && transaction.status === TransactionStatus.Canceled) {
                return res.status(400).json(ReturnResult.error({
                    error: ClickError.TransactionCanceled,
                    error_note: "Transaction canceled",
                }, "Transaction canceled"));
            }

            const time = new Date().getTime();

            if(error < 0) {
                await transactionModel.updateOne(
                    {
                        transId: click_trans_id,
                    },
                    {
                        status: TransactionStatus.Canceled,
                        cancel_time: time,
                    }
                );

                return res.status(404).json(ReturnResult.error(
                    {
                        error: ClickError.TransactionNotFound,
                        error_note: "Transaction not found",
                    },
                    "Transaction not found"
                ))
            }

            await transactionModel.updateOne(
                {
                    transId: click_trans_id,
                },
                {
                    status: TransactionStatus.Paid,
                    perform_time: time,
                }
            )

            const returnResult = {
                click_trans_id: click_trans_id,
                merchant_trans_id: merchant_trans_id,
                merchant_confirm_id: time,
                error: ClickError.Success,
                error_note: "Success",
            }

            return res.status(200).json(ReturnResult.success(
                returnResult,
                "Successfully completed transaction"
            ));
    }
}

module.exports = TransactionController;