const mongoose = require('mongoose');
const userDatabase = require('../../connections/database-connections/user-db-connection');

// create this schema when user is registered
// and add the user id to the user field
const userSchema = new mongoose.Schema({
	categoryFavorites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Category',
			autopopulate: true,
		},
	],
	postFavorites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
			autopopulate: true,
		},
	],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});
userSchema.plugin(require('mongoose-autopopulate'));
const UserFavorites = userDatabase.model('UserFavorites', userSchema);
exports.UserFavorites = UserFavorites;
