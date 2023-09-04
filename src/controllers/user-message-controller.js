const { User } = require('../models/user-models/user-model');
const { UserMessage } = require('../models/chat-models/user-message-model');
const ReturnResult = require('../helpers/return-result');

const SUCCESS_MESSAGES = {
	SEND_MESSAGE_SUCCESS: 'Send message success',
	GET_MESSAGE_SUCCESS: 'Get message success',
	READ_MESSAGE_SUCCESS: 'Read message success',
	DELETE_MESSAGE_SUCCESS: 'Delete message success',
};

const ERROR_MESSAGES = {
	INVALID_POST_ID: 'Invalid post id',
	NOT_FOUND_USER: 'Not found user',
	NOT_FOUND_MESSAGE: 'Not found message',
	NOT_PERMISSION: 'Not permission',
};

class UserMessageController {
	static sendMessages = async (req, res) => {
		const { sender, receiver, message } = req.body;

		const user = await User.findById(sender);
		const userReceiver = await User.findById(receiver);

		if (!user || !userReceiver) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const sendMessage = await UserMessage.create({
			message,
			sender,
			receiver,
		});

		await sendMessage.save();
		return res.status(200).json(ReturnResult.success({}, SUCCESS_MESSAGES.SEND_MESSAGE_SUCCESS));
	};

	static getMessages = async (req, res) => {
		const { userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const messages = await UserMessage.find({ receiver: userId });

		return res
			.status(200)
			.json(ReturnResult.success(messages, SUCCESS_MESSAGES.GET_MESSAGE_SUCCESS));
	};

	static getMessagesByUser = async (req, res) => {
		const { userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const messages = await UserMessage.find({ sender: userId });

		return res
			.status(200)
			.json(ReturnResult.success(messages, SUCCESS_MESSAGES.GET_MESSAGE_SUCCESS));
	};

	static readMessage = async (req, res) => {
		const { messageId } = req.params;

		const message = await UserMessage.findById(messageId);

		if (!message) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_MESSAGE));
		}

		message.isRead = true;
		await message.save();

		return res.status(200).json(ReturnResult.success({}, SUCCESS_MESSAGES.READ_MESSAGE_SUCCESS));
	};

	static deleteMessage = async (req, res) => {
		const { messageId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const message = await UserMessage.findById(messageId);

		if (!message) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_MESSAGE));
		}

		if (message.receiver != userId) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_PERMISSION));
		}

		return res.status(200).json(ReturnResult.success({}, SUCCESS_MESSAGES.DELETE_MESSAGE_SUCCESS));
	};

	static deleteMessages = async (req, res) => {
		const { userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}

		const messages = await UserMessage.deleteMany({ receiver: userId });
		return res
			.status(200)
			.json(ReturnResult.success(messages, SUCCESS_MESSAGES.DELETE_MESSAGE_SUCCESS));
	};

	static editMessage = async (req, res) => {
		const { messageId, userId } = req.params;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_USER));
		}
		const message = await UserMessage.findById(messageId);

		if (!message) {
			return res.status(404).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_FOUND_MESSAGE));
		}

		if (message.sender != userId) {
			return res.status(400).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_PERMISSION));
		}

		message.message = req.body.message;
		await message.save();

		return res
			.status(200)
			.json(ReturnResult.success(message, SUCCESS_MESSAGES.SEND_MESSAGE_SUCCESS));
	};
}

module.exports = UserMessageController;
