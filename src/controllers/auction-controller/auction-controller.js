const { Auction } = require('../../models/auction-models/auction-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const { UserMessage } = require('../../models/user-models/user-message-model');
const ReturnResult = require('../../helpers/return-result');
const Telegram = require('../../utils/telegram');

const MESSAGES = {
    getAuctions: "successful",
    notFound: "Not found",
    getAuction: "successful"
}

class AuctionController {
    static getAuctions = async (req, res) => {
        const auctions = await Auction.find();
        return res.status(200).json(ReturnResult.success(auctions,MESSAGES.getAuctions))
    }

    static getAuction = async (req, res) => {
        const { auctionId } = req.params;

        const auction = await Auction.findById(auctionId);

        if(!auction) {
            return res.status(404).json(ReturnResult.errorMessage(MESSAGES.notFound))
        }

        return res.status(200).json(ReturnResult.success(auction, MESSAGES.getAuction))
    }

    static createAuction = async (req, res) => {
    }
}

class Validation {
    static create(reqBody) {
        const schema = Joi.object({
            title: Joi.alternatives(Joi.string, Joi.object).required(),
            description: Joi.alternatives(Joi.string, Joi.object).optional(),
            post: Joi.string.required(),
        })
    }
}