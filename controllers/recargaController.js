const Recarga = require('../models/Recarga');
const OfertaRecargas = require('../models/OfertaRecargas');
const Client = require('../models/Client');
const Province = require('../models/Province');
const Finance = require('../models/Finance');

// @desc    Obtener todas las recargas
// @route   GET /api/recargas
// @access  Private/Admin
const getAllRecargas = async (req, res) => {
    try {
        const recargas = await Recarga.find()
            .populate('oferta', 'titulo descripcion precio bonos')
            .populate('client', 'name email phone')
            .populate('destinationProvince', 'name code')
            .sort({ date: -1 });
        res.json(recargas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener recarga por ID
// @route   GET /api/recargas/:id
// @access  Private/Admin
const getRecargaById = async (req, res) => {
    try {
        const recarga = await Recarga.findById(req.params.id)
            .populate('oferta')
            .populate('client')
            .populate('destinationProvince');
        
        if (!recarga) {
            return res.status(404).json({ message: 'Recarga no encontrada' });
        }

        res.json(recarga);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear nueva recarga
// @route   POST /api/recargas
// @access  Private/Admin
const createRecarga = async (req, res) => {
    try {
        const { oferta, client, phone, confirmation, destinationProvince } = req.body;

        // Validar que la oferta exista
        const ofertaExistente = await OfertaRecargas.findById(oferta);
        if (!ofertaExistente) {
            return res.status(400).json({ message: 'La oferta seleccionada no existe' });
        }

        // Validar que el cliente exista
        const clienteExistente = await Client.findById(client);
        if (!clienteExistente) {
            return res.status(400).json({ message: 'El cliente seleccionado no existe' });
        }

        // Validar que la provincia exista
        const provinciaExistente = await Province.findById(destinationProvince);
        if (!provinciaExistente) {
            return res.status(400).json({ message: 'La provincia seleccionada no existe' });
        }

        // Crear la recarga con el precio de la oferta
        const recarga = new Recarga({
            oferta,
            client,
            amount: ofertaExistente.precio,
            phone,
            confirmation,
            destinationProvince
        });

        const savedRecarga = await recarga.save();
        
        // Populate para devolver datos completos
        const populatedRecarga = await Recarga.findById(savedRecarga._id)
            .populate('oferta', 'titulo descripcion precio')
            .populate('client', 'name email phone')
            .populate('destinationProvince', 'name code');

        res.status(201).json(populatedRecarga);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Actualizar recarga
// @route   PUT /api/recargas/:id
// @access  Private/Admin
const updateRecarga = async (req, res) => {
    try {
        const { oferta, client, phone, confirmation, destinationProvince, status } = req.body;

        // Validar que la recarga exista
        const recargaExistente = await Recarga.findById(req.params.id);
        if (!recargaExistente) {
            return res.status(404).json({ message: 'Recarga no encontrada' });
        }

        // Si se cambia la oferta, actualizar el monto
        let amount = recargaExistente.amount;
        if (oferta && oferta !== recargaExistente.oferta.toString()) {
            const nuevaOferta = await OfertaRecargas.findById(oferta);
            if (!nuevaOferta) {
                return res.status(400).json({ message: 'La oferta seleccionada no existe' });
            }
            amount = nuevaOferta.precio;
        }

        const recarga = await Recarga.findByIdAndUpdate(
            req.params.id,
            { oferta, client, phone, confirmation, destinationProvince, status, amount },
            { new: true, runValidators: true }
        )
        .populate('oferta', 'titulo descripcion precio')
        .populate('client', 'name email phone')
        .populate('destinationProvince', 'name code');

        res.json(recarga);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Eliminar recarga
// @route   DELETE /api/recargas/:id
// @access  Private/Admin
const deleteRecarga = async (req, res) => {
    try {
        const recarga = await Recarga.findById(req.params.id);
        
        if (!recarga) {
            return res.status(404).json({ message: 'Recarga no encontrada' });
        }

        await recarga.deleteOne();
        res.json({ message: 'Recarga eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Confirmar recarga
// @route   PATCH /api/recargas/:id/confirmar
// @access  Private/Admin
const confirmarRecarga = async (req, res) => {
    try {
        const { confirmation } = req.body;

        // Obtener la recarga para confirmar
        const recarga = await Recarga.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'Realizado',
                confirmation: confirmation || 'Recarga confirmada'
            },
            { new: true, runValidators: true }
        )
        .populate('oferta', 'titulo descripcion precio costo')
        .populate('client', 'name email phone')
        .populate('destinationProvince', 'name code');

        if (!recarga) {
            return res.status(404).json({ message: 'Recarga no encontrada' });
        }

        // Crear operación de finanzas para la recarga confirmada
        const financeOperation = {
            type: 'recarga',
            amount: -recarga.oferta.costo, // Monto negativo del costo de la oferta
            operationId: recarga._id
        };

        // Buscar o crear registro de finanzas para la provincia
        let financeRecord = await Finance.findOne({ province: recarga.destinationProvince._id });
        
        if (!financeRecord) {
            // Si no existe, crearlo
            financeRecord = new Finance({
                amount: 0,
                province: recarga.destinationProvince._id,
                movements: [financeOperation]
            });
            await financeRecord.save();
        } else {
            // Si existe, agregar el movimiento
            financeRecord.movements.push(financeOperation);
            await financeRecord.save();
        }

        res.json(recarga);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener recargas por cliente
// @route   GET /api/recargas/cliente/:clientId
// @access  Private/Admin
const getRecargasByCliente = async (req, res) => {
    try {
        const recargas = await Recarga.find({ client: req.params.clientId })
            .populate('oferta', 'titulo descripcion precio')
            .populate('destinationProvince', 'name code')
            .sort({ date: -1 });
        
        res.json(recargas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener recarga por ID para detalles
// @route   GET /api/recargas/:id/detalles
// @access  Private/Admin
const getRecargaDetalles = async (req, res) => {
    try {
        const recarga = await Recarga.findById(req.params.id)
            .populate('oferta', 'titulo descripcion precio costo bonos')
            .populate('client', 'name email phone')
            .populate('destinationProvince', 'name code');
        
        if (!recarga) {
            return res.status(404).json({ message: 'Recarga no encontrada' });
        }

        res.json(recarga);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener recargas por provincia
// @route   GET /api/recargas/provincia/:provinceId
// @access  Private/Admin
const getRecargasByProvincia = async (req, res) => {
    try {
        const recargas = await Recarga.find({ destinationProvince: req.params.provinceId })
            .populate('oferta', 'costo bonos titulo descripcion precio')
            .populate('client', 'name email phone')
            .populate('destinationProvince', 'name')
            .sort({ date: -1 });
        
        res.json(recargas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRecargas,
    getRecargaById,
    createRecarga,
    updateRecarga,
    deleteRecarga,
    confirmarRecarga,
    getRecargasByCliente,
    getRecargasByProvincia
};
