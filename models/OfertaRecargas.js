const mongoose = require('mongoose');

const bonoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['Minutos', 'Mensajes', 'Datos'],
        required: true
    }
});

const ofertaRecargasSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    costo: {
        type: Number,
        required: true,
        min: 0
    },
    bonos: [bonoSchema],
    activa: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Índices para mejor rendimiento
ofertaRecargasSchema.index({ activa: 1 });
ofertaRecargasSchema.index({ precio: 1 });
ofertaRecargasSchema.index({ createdAt: -1 });

module.exports = mongoose.model('OfertaRecargas', ofertaRecargasSchema);
