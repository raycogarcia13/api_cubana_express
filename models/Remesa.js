const mongoose = require('mongoose');

const remesaSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    beneficiary: {
        name: {
            type: String,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        cardNumber: {
            type: String,
            default: null
        }
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    destinationProvince: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
        required: true
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Realizado'],
        default: 'Pendiente'
    },
    description: {
        type: String,
        required: false,
        maxlength: 500
    },
    confirmation: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Índices para mejor rendimiento
remesaSchema.index({ client: 1 });
remesaSchema.index({ status: 1 });
remesaSchema.index({ date: -1 });
remesaSchema.index({ destinationProvince: 1 });

module.exports = mongoose.model('Remesa', remesaSchema);
