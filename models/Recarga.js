const mongoose = require('mongoose');

const recargaSchema = new mongoose.Schema({
    oferta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OfertaRecargas',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Pendiente', 'Realizado'],
        default: 'Pendiente'
    },
    confirmation: {
        type: String,
        required: true
    },
    destinationProvince: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Province',
        required: true
    }
}, {
    timestamps: true
});

// Índices para mejor rendimiento
recargaSchema.index({ oferta: 1 });
recargaSchema.index({ client: 1 });
recargaSchema.index({ date: -1 });
recargaSchema.index({ status: 1 });

module.exports = mongoose.model('Recarga', recargaSchema);
