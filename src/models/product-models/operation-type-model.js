const mongoose = require('mongoose');

const operationTypeSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        unique: true
    },
    shortDescription: {
        type: mongoose.Schema.Types.Mixed,
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

const OperationType = mongoose.model('OperationType', operationTypeSchema);
exports.OperationType = OperationType;