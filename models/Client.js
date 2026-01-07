const mongoose = require('mongoose');

// Esquema para destinatarios
const recipientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    bankCardNumber: {
        type: String,
        required: false
    }
});

// Esquema principal para Cliente
const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    recipients: [{
        type: recipientSchema
    }]
}, {
    timestamps: true
});

// Índice único para email
// clientSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Client', clientSchema);
