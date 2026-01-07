const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        required: true,
        default:new mongoose.Types.ObjectId()
    },
    type: {
        type: String,
        enum: ['entrada', 'remesa', 'recarga'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    operationId: {
        type: mongoose.Types.ObjectId
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const financeSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    province: {
        type: mongoose.Types.ObjectId,
        ref: 'Province',
        required: true
    },
    movements: [movementSchema]
}, {
    timestamps: true
});

// Update total amount when movements change
financeSchema.pre('save', function(next) {
    if (this.isModified('movements')) {
        this.amount = this.movements.reduce((total, movement) => {
            return total + movement.amount;
        }, 0);
    }
    next();
});

// Add a method to add a new movement
financeSchema.methods.addMovement = async function(movementData) {
    this.movements.push(movementData);
    return this.save();
};

// Add a method to get movements by type
financeSchema.methods.getMovementsByType = function(type) {
    return this.movements.filter(movement => movement.type === type);
};

// Add a method to get total by movement type
financeSchema.methods.getTotalByType = function(type) {
    return this.movements
        .filter(movement => movement.type === type)
        .reduce((total, movement) => total + movement.amount, 0);
};

// Create index for better query performance
financeSchema.index({ province: 1 });
financeSchema.index({ 'movements.type': 1 });
financeSchema.index({ 'movements.date': 1 });

module.exports = mongoose.model('Finance', financeSchema);
