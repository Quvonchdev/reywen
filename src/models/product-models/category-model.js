const mongoose = require('mongoose');
const generateSlag = require('../../helpers/slug-generator');

const categorySchema = new mongoose.Schema({
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

categorySchema.pre('validate', function (next) {
    if(this.name) {
        this.slug = generateSlag(this.name);
    }
    next();
})

const Category = mongoose.model('Category', categorySchema);
exports.Category = Category;