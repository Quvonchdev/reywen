const mongoose = require('mongoose');
const currencyTypeSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        unique: true
    },
    shortDescription: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    symbol: {
        type: String,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const CurrencyType = mongoose.model('CurrencyType', currencyTypeSchema);
exports.CurrencyType = CurrencyType;