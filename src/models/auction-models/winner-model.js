const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const User = require('../user-models/user-model').User;
const Auction = require('./auction-model').Auction;

const winnerAuctionSchema = new mongoose.Schema({
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Auction,
        required: true,
    },
    winners: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: User,
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isVerified: {
        type: Boolean,
        default: false,
    }
})

winnerAuctionSchema.index({ auction: 1 }, { unique: true });
const WinnerAuction = auctionDatabase.model('WinnerAuction', winnerAuctionSchema);
exports.WinnerAuction = WinnerAuction;