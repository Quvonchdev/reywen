const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');
const userDatabase = require('../../connections/database-connections/user-db-connection');

const userSchema = new mongoose.Schema(
	{
		userId: {
			type: Number,
		},
		uuid: {
			type: String,
			default: uuid(),
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 255,
			index: true,
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 9,
			maxlength: 15,
			index: true,
		},
		balance: {
			type: Number,
			default: 0,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 1024,
		},
		confirmPassword: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 1024,
		},
		email: {
			type: String,
			required: false,
		},
		shortDescription: {
			type: String,
			default: null,
		},
		coverImage: {
			type: String,
			default: null,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		userRoles: {
			type: [String],
			default: ['User'],
		},
		isBlockedUser: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre('save', function (next) {
    // Only increment when the document is new
    if (this.isNew) {
        User.count().then(res => {
            this.userId = res; // Increment count
            next();
        });
    } else {
        next();
    }
});

const User = userDatabase.model('User', userSchema);
exports.User = User;
