const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const Post = require('../post-models/post-model').Post;
const User = require('../user-models/user-model').User;

const auctionSchema = new mongoose.Schema({
    title: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    description: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        required: false
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Post,
        required: true,
    },
    startPrice: {
        type: Number,
        required: true,
    },
    currentPrice: {
        type: Number,
        default: null,
    },
    bidIncrement: {
        type: Number,
        required: true,
    },
    bidIncrementType: {
        type: String,
        enum: ['fixed', 'percentage'],
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isPayed: {
        type: Boolean,
        default: false,
    }
})

const Auction = auctionDatabase.model('Auction', auctionSchema);
exports.Auction = Auction;