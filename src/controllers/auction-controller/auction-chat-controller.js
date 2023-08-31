const { UserAuctionMessage } = require('../../models/user-models/user-auction-message-model');
const ReturnResult = require('../../helpers/return-result');

class AuctionChatController {
    static getAll = async (req, res) => {
        const messages = await UserAuctionMessage.find({ auction: req.params.auctionId, isDeleted: false });
        return res.status(200).json(ReturnResult.success(messages, 'Messages retrieved successfully'));
    }

    static getMessagesByUser = async (req, res) => {
        const messages = await UserAuctionMessage.find({ receiver: req.params.userId, isDeleted: false });
        return res.status(200).json(ReturnResult.success(messages, 'Messages retrieved successfully'));
    }

    static getMessagesByAuctionAndUser = async (req, res) => {
        const messages = await UserAuctionMessage.find({
            auction: req.params.auctionId,
            receiver: req.params.userId,
        });
        return res.status(200).json(ReturnResult.success(messages, 'Messages retrieved successfully'));
    }

    static deleteMessageByUser = async (req, res) => {
        const message = await UserAuctionMessage.findOne({
            _id: req.params.messageId,
            receiver: req.params.userId,
        })

        if (!message) {
            return res.status(404).json(ReturnResult.fail('Message not found'));
        }

        message.isDeleted = true;
        await message.save();

        return res.status(200).json(ReturnResult.success(message, 'Message deleted successfully'));
    }
}

module.exports = AuctionChatController;