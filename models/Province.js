const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices únicos
provinceSchema.index({ name: 1 }, { unique: true });
provinceSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Province', provinceSchema);
