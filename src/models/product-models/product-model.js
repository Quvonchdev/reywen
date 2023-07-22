const mongoose = require('mongoose');
const generateSlag = require('../../helpers/slug-generator');

const productSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true
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
    priceType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PriceType'
        }
    ],
    paymentType: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentType'
        }
    ],
    facilities: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    slug: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        unique: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    expiredFreeModeAt: {
        type: Date,
        default: null
    },
    fullInfo: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // Admin panel
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    moderationComment: {
        type: String,
        default: null
    },
    moderationBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isUrgently: {
        type: Boolean,
        default: false
    },
    expiredUrgentlyAt: {
        type: Date,
        default: null
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    expiredPremiumAt: {
        type: Date,
        default: null
    },
    isVip: {
        type: Boolean,
        default: false
    },
    expiredVipAt: {
        type: Date,
        default: null
    },
    isTop: {
        type: Boolean,
        default: false
    },
    expiredTopAt: {
        type: Date,
        default: null
    },
    isUp: {
        type: Boolean,
        default: false
    },
    expiredUpAt: {
        type: Date,
        default: null
    },
    // User panel
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date,
        default: null
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
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