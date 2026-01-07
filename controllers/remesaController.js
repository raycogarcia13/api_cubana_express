const mongoose = require('mongoose');
const Remesa = require('../models/Remesa');
const Client = require('../models/Client');
const Province = require('../models/Province');
const Finance = require('../models/Finance');

// @desc    Obtener todas las remesas
// @route   GET /api/remesas
// @access  Private
const getAllRemesas = async (req, res) => {
    try {
        const remesas = await Remesa.find()
            .populate('client', 'name email')
            .populate('destinationProvince', 'name code')
            .sort({ date: -1 });
        
        res.json(remesas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener remesa por ID
// @route   GET /api/remesas/:id
// @access  Private
const getRemesaById = async (req, res) => {
    try {
        const remesa = await Remesa.findById(req.params.id)
            .populate('client', 'name email')
            .populate('destinationProvince', 'name code');
        
        if (!remesa) {
            return res.status(404).json({ message: 'Remesa no encontrada' });
        }

        res.json(remesa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear nueva remesa
// @route   POST /api/remesas
// @access  Private
const createRemesa = async (req, res) => {
    try {
        const { amount, cost, client, beneficiary, date, destinationProvince, description } = req.body;
        
        // Verificar si el cliente existe
        const clientExists = await Client.findById(client);
        if (!clientExists) {
            return res.status(400).json({ message: 'Cliente no encontrado' });
        }

        let beneficiaryData;

        if (typeof beneficiary === 'string' && beneficiary !== 'manual') {
            // Beneficiario existente
            const clientWithBeneficiary = await Client.findOne({ 
                '_id': client,
                'recipients._id': beneficiary 
            });
            
            if (!clientWithBeneficiary) {
                return res.status(400).json({ message: 'Beneficiario no encontrado o no pertenece al cliente' });
            }

            // Obtener el objeto del beneficiario
            beneficiaryData = clientWithBeneficiary.recipients.id(beneficiary);
        } else if (typeof beneficiary === 'object') {
            // Datos manuales del beneficiario
            beneficiaryData = beneficiary;
        } else {
            return res.status(400).json({ message: 'Datos de beneficiario inválidos' });
        }

        const remesa = new Remesa({
            amount,
            cost,
            client,
            beneficiary: {
                name: beneficiaryData.name,
                phone: beneficiaryData.phone,
                address: beneficiaryData.address,
                cardNumber: beneficiaryData.cardNumber || null
            },
            date: date || Date.now(),
            destinationProvince,
            description: description || '',
            status: 'Pendiente'
        });

        const savedRemesa = await remesa.save();
        res.status(201).json(savedRemesa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Actualizar remesa
// @route   PUT /api/remesas/:id
// @access  Private
const updateRemesa = async (req, res) => {
    try {
        const remesa = await Remesa.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('client', 'name email')
         .populate('beneficiary', 'name phone address')
         .populate('destinationProvince', 'name code');

        if (!remesa) {
            return res.status(404).json({ message: 'Remesa no encontrada' });
        }

        res.json(remesa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Confirmar remesa
// @route   PUT /api/remesas/:id/confirmar
// @access  Private
const confirmarRemesa = async (req, res) => {
    try {
        const { confirmation, beneficiary } = req.body;
        
        const updateData = { 
            status: 'Realizado',
            confirmation: confirmation 
        };
        
        // Si se proporcionan datos del beneficiario, actualizarlos
        if (beneficiary) {
            updateData.beneficiary = {
                name: beneficiary.name,
                phone: beneficiary.phone,
                address: beneficiary.address,
                cardNumber: beneficiary.cardNumber || null
            };
        }
        
        const remesa = await Remesa.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('client', 'name email')
         .populate('destinationProvince', 'name code');

        if (!remesa) {
            return res.status(404).json({ message: 'Remesa no encontrada' });
        }

        // Generar operación financiera de tipo remesa
        try {
            const financeRecord = await Finance.findOne({ 
                province: remesa.destinationProvince._id 
            });
            
            if (financeRecord) {
                // Agregar movimiento de tipo remesa (monto negativo)
                financeRecord.movements.push({
                    type: 'remesa',
                    amount: -Math.abs(remesa.amount), // Monto negativo
                    operationId: remesa._id,
                    date: new Date()
                });
                
                await financeRecord.save();
            }
        } catch (financeError) {
            console.error('Error creando operación financiera:', financeError);
            // No fallar la confirmación si hay error en finanzas
        }

        res.json(remesa);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Eliminar remesa
// @route   DELETE /api/remesas/:id
// @access  Private
const deleteRemesa = async (req, res) => {
    try {
        const remesa = await Remesa.findById(req.params.id);
        
        if (!remesa) {
            return res.status(404).json({ message: 'Remesa no encontrada' });
        }

        await remesa.deleteOne();
        res.json({ message: 'Remesa eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener remesas por provincia
// @route   GET /api/remesas/provincia/:provinceId
// @access  Private/Admin
const getRemesasByProvincia = async (req, res) => {
    try {
        const remesas = await Remesa.find({ destinationProvince: req.params.provinceId })
            .populate('client', 'name email phone')
            .populate('destinationProvince', 'name code')
            .sort({ date: -1 });
        
        res.json(remesas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRemesas,
    getRemesaById,
    createRemesa,
    updateRemesa,
    confirmarRemesa,
    deleteRemesa,
    getRemesasByProvincia
};
