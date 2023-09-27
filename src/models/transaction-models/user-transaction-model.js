const transactionDatabase = require('../../connections/database-connections/transaction-db-connection');
const User = require('../user-models/user-model').User;
const mongoose = require('mongoose');

const userTransactionSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
		},
		user_id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User,
			required: true,
		},
		amount: {
			type: String,
			required: true,
		},
		isPaid: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

userTransactionSchema.pre('save', function (next) {
    if (this.isNew) {
        userTransactionModel.count().then(res => {
            this.id = res + 1;
            next();
        });
    } else {
        next();
    }
});

const userTransactionModel = transactionDatabase.model('user_transaction', userTransactionSchema);
exports.userTransactionModel = userTransactionModel;
