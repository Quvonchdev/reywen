const mongoose = require('mongoose');

const pricesSchema = new mongoose.Schema(
	{
		vip: {
			type: mongoose.Schema.Types.Mixed,
		},
		vipDescription: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		top: {
			type: mongoose.Schema.Types.Mixed,
			default: 0,
		},
		topDescription: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		urgently: {
			type: mongoose.Schema.Types.Mixed,
			default: 0,
		},
		urgentlyDescription: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		premium: {
			type: mongoose.Schema.Types.Mixed,
			default: 0,
		},
		premiumDescription: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			required: true,
		},
		auksion: {
			type: mongoose.Schema.Types.Mixed,
		},
		auksionDescription: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		custom: {
			type: mongoose.Schema.Types.Mixed,
		},
		customDescription: {
			type: mongoose.Schema.Types.Mixed,
			default: null,
		},
		status: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

const Prices = mongoose.model('Prices', pricesSchema);
exports.Prices = Prices;
