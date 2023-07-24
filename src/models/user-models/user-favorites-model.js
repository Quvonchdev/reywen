const mongoose = require('mongoose');

// create this schema when user is registered
// and add the user id to the user field
const userSchema = new mongoose.Schema({
	categoryFavorites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
		},
	],
	productFavorites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
		},
	],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
});

const UserFavorites = mongoose.model('UserFavorites', userSchema);
exports.UserFavorites = UserFavorites;
