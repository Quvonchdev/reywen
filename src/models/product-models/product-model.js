const mongoose = require('mongoose');
const generateSlag = require('../../helpers/slug-generator');

const productSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        unique: true
    },
    shortDescription: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    coverImage: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    productImages: {
        type: Array,
        default: []
    },
    operationType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OperationType'
        }
    ],
    currencyType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CurrencyType'
    },
    price: {
        type: Number,
        required: true
    },
    priceType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PriceType'
    },
    discount: {
        type: Number,
        default: 0
    },
    paymentType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentType'
        }
    ],
    slug: {
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

productSchema.pre('validate', function (next) {
    if(this.name) {
        this.slug = generateSlag(this.name);
    }
    next();
})

const Product = mongoose.model('Product', productSchema);
exports.Product = Product;