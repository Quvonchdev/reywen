const mongoose = require('mongoose');
const userDatabase = require('../../connections/database-connections/user-db-connection');
const Category = require('../post-models/category-model').Category;
const Post = require('../post-models/post-model').Post;
const User = require('../user-models/user-model').User

// create this schema when user is registered
// and add the user id to the user field
const userSchema = new mongoose.Schema({
	categoryFavorites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: Category,
		},
	],
	postFavorites: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: Post,
			autopopulate: true,
		},
	],
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
});
userSchema.plugin(require('mongoose-autopopulate'));
const UserFavorites = userDatabase.model('UserFavorites', userSchema);
exports.UserFavorites = UserFavorites;
