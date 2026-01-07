const mongoose = require('mongoose');

// Esquema para estado de la remesa
const statusSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        required: false
    }
});

// Esquema principal para Remesa
const remittanceSchema = new mongoose.Schema({
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
            required: false
        }
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        enum: ['MLC', 'USD', 'CUP', 'EUR'],
        required: true
    },
    serviceCost: {
        type: Number,
        required: true,
        min: 0
    },
    homeDelivery: {
        type: Boolean,
        default: false
    },
    statusHistory: [{
        type: statusSchema
    }],
    currentStatus: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    trackingNumber: {
        type: String,
        unique: true,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: function() {
            return this.homeDelivery;
        }
    }
}, {
    timestamps: true
});

// Generar número de seguimiento único
remittanceSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastRemittance = await this.constructor.findOne().sort('-createdAt');
        const year = new Date().getFullYear().toString().slice(-2);
        const sequence = lastRemittance ? parseInt(lastRemittance.trackingNumber.slice(2)) + 1 : 1;
        this.trackingNumber = `RE${year}${sequence.toString().padStart(5, '0')}`;
    }
    next();
});

// Índice único para trackingNumber
remittanceSchema.index({ trackingNumber: 1 }, { unique: true });

// Método para actualizar el estado de la remesa
remittanceSchema.methods.updateStatus = async function(newStatus, notes = null) {
    const status = {
        status: newStatus,
        notes
    };
    
    this.currentStatus = newStatus;
    this.statusHistory.push(status);
    await this.save();
};

module.exports = mongoose.model('Remittance', remittanceSchema);
