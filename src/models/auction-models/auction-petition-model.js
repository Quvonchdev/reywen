const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const User = require('../user-models/user-model').User;
const Auction = require('./auction-model').Auction;

const auctionSchema = new mongoose.Schema({
    creditCardNumber: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
        index: true,
    },
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Auction,
        required: true,
        autopopulate: true,
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        autopopulate: true,
    },
    message: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
})

auctionSchema.plugin(require('mongoose-autopopulate'));
const AuctionPetition = auctionDatabase.model('AuctionPetition', auctionSchema);
exports.AuctionPetition = AuctionPetition;