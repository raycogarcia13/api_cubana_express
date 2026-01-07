const Finance = require('../models/Finance');
const mongoose = require('mongoose');

// @desc    Get all finance records
// @route   GET /api/finance
// @access  Private/Admin
exports.getFinances = async (req, res) => {
    try {
        const finances = await Finance.find().populate('province', 'name');
        res.json(finances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get finance record by province
// @route   GET /api/finance/province/:provinceId
// @access  Private
exports.getFinanceByProvince = async (req, res) => {
    try {
        const finance = await Finance.findOne({ 
            province: req.params.provinceId 
        }).populate('province', 'name');
        
        if (!finance) {
            return res.status(404).json({ message: 'No se encontró registro financiero para esta provincia' });
        }
        
        res.json(finance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new operation (entrada, remesa, recarga)
// @route   POST /api/finance/operation
// @access  Private
exports.addOperation = async (req, res) => {
    const { type, amount, provinceId } = req.body;

    try {
        // Validate input
        if (!['entrada', 'remesa', 'recarga'].includes(type)) {
            return res.status(400).json({ message: 'Tipo de operación no válido' });
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ message: 'El monto debe ser un número positivo' });
        }

        if (!mongoose.Types.ObjectId.isValid(provinceId)) {
            return res.status(400).json({ message: 'ID de provincia no válido' });
        }

        // Calculate the final amount (negative for remesa/recarga, positive for entrada)
        const operationAmount = type === 'entrada' ? amount : -amount;

        // Find or create finance record for the province
        let finance = await Finance.findOne({ province: provinceId });

        if (!finance) {
            finance = new Finance({
                province: provinceId,
                amount: 0,
                movements: []
            });
        }

        // Add the new movement
        const newMovement = {
            type,
            amount: operationAmount
        };

        finance.movements.push(newMovement);
        await finance.save();

        res.status(201).json(finance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current financial status
// @route   GET /api/finance/status
// @access  Private/Admin
exports.getFinancialStatus = async (req, res) => {
    try {
        const finances = await Finance.find().populate('province', 'name');
        
        // Calculate total by province and overall total
        const status = {
            byProvince: [],
            total: 0
        };

        finances.forEach(finance => {
            const provinceTotal = finance.movements.reduce(
                (sum, movement) => sum + movement.amount, 0
            );
            
            status.byProvince.push({
                province: finance.province,
                total: provinceTotal,
                movements: finance.movements
            });

            status.total += provinceTotal;
        });

        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get operations by type and date range
// @route   GET /api/finance/operations
// @access  Private
exports.getOperations = async (req, res) => {
    try {
        const { type, startDate, endDate, provinceId } = req.query;
        const match = {};
        
        if (type) match['movements.type'] = type;
        if (provinceId) match.province = provinceId;

        // Add date range filter if provided
        if (startDate || endDate) {
            match['movements.date'] = {};
            if (startDate) match['movements.date'].$gte = new Date(startDate);
            if (endDate) match['movements.date'].$lte = new Date(endDate);
        }

        const result = await Finance.aggregate([
            { $match: match },
            { $unwind: '$movements' },
            {
                $match: {
                    ...(type ? { 'movements.type': type } : {}),
                    ...(startDate || endDate ? {
                        'movements.date': {
                            ...(startDate ? { $gte: new Date(startDate) } : {}),
                            ...(endDate ? { $lte: new Date(endDate) } : {})
                        }
                    } : {})
                }
            },
            {
                $lookup: {
                    from: 'provinces',
                    localField: 'province',
                    foreignField: '_id',
                    as: 'province'
                }
            },
            { $unwind: '$province' },
            {
                $project: {
                    _id: 0,
                    type: '$movements.type',
                    amount: '$movements.amount',
                    operationId: '$movements.operationId',
                    _id: '$movements._id',
                    date: '$movements.date',
                    province: {
                        _id: '$province._id',
                        name: '$province.name'
                    }
                }
            },
            { $sort: { date: -1 } }
        ]);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an operation
// @route   DELETE /api/finance/operation/:provinceId/:operationId
// @access  Private
exports.deleteOperation = async (req, res) => {
    try {
        const { provinceId, operationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(provinceId) || !mongoose.Types.ObjectId.isValid(operationId)) {
            return res.status(400).json({ message: 'IDs no válidos' });
        }

        const finance = await Finance.findOne({ province: provinceId });
        
        if (!finance) {
            return res.status(404).json({ message: 'Registro financiero no encontrado' });
        }

        // Remove the operation
        finance.movements = finance.movements.filter(
            movement => movement._id.toString() !== operationId
        );

        await finance.save();

        res.json({ message: 'Operación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
