const mongoose = require('mongoose');

const priceTypeSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        unique: true
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

const PriceType = mongoose.model('PriceType', priceTypeSchema);
exports.PriceType = PriceType;