const mongoose = require('mongoose');

// Esquema para estado del paquete
const statusSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['RECEIVED', 'TRANSPORTING', 'DELIVERED'],
        required: true
    },
    location: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    deliveryPhoto: {
        type: String, // URL de la foto
        required: false
    }
});

// Esquema principal para Envío de Paquete
const packageSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    recipient: {
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
            required: true
        }
    },
    weight: {
        type: Number, // en libras
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    moneyAmount: {
        type: Number,
        required: true,
        min: 0
    },
    destinationProvince: {
        type: String,
        required: true
    },
    statusHistory: [{
        type: statusSchema
    }],
    currentStatus: {
        type: String,
        enum: ['RECEIVED', 'TRANSPORTING', 'DELIVERED'],
        default: 'RECEIVED'
    },
    trackingNumber: {
        type: String,
        unique: true,
        required: true
    }
}, {
    timestamps: true
});

// Generar número de seguimiento único
packageSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastPackage = await this.constructor.findOne().sort('-createdAt');
        const year = new Date().getFullYear().toString().slice(-2);
        const sequence = lastPackage ? parseInt(lastPackage.trackingNumber.slice(2)) + 1 : 1;
        this.trackingNumber = `PX${year}${sequence.toString().padStart(5, '0')}`;
    }
    next();
});

// Índice único para trackingNumber
packageSchema.index({ trackingNumber: 1 }, { unique: true });

// Método para actualizar el estado del paquete
packageSchema.methods.updateStatus = async function(newStatus, location, worker = null, deliveryPhoto = null) {
    const status = {
        status: newStatus,
        location,
        worker,
        deliveryPhoto
    };
    
    this.currentStatus = newStatus;
    this.statusHistory.push(status);
    await this.save();
};

module.exports = mongoose.model('Package', packageSchema);
