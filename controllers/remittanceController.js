const Remittance = require('../models/Remittance');
const Client = require('../models/Client');

// Crear nueva remesa
const createRemittance = async (req, res) => {
    try {
        const { client, recipient, amount, currency, serviceCost, homeDelivery, deliveryAddress } = req.body;

        // Validar que el cliente exista
        const clientData = await Client.findById(client);
        if (!clientData) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Validar que el destinatario sea un destinatario válido del cliente
        const validRecipient = clientData.recipients.some(r => 
            r.name === recipient.name && 
            r.phone === recipient.phone && 
            r.address === recipient.address
        );
        
        if (!validRecipient) {
            return res.status(400).json({ 
                message: 'El destinatario no es un destinatario válido del cliente' 
            });
        }

        // Validar dirección de entrega si homeDelivery es true
        if (homeDelivery && !deliveryAddress) {
            return res.status(400).json({ message: 'Se requiere dirección de entrega para entrega a domicilio' });
        }

        const remittance = new Remittance({
            client,
            recipient,
            amount,
            currency,
            serviceCost,
            homeDelivery,
            deliveryAddress
        });

        // Agregar primer estado (PENDING)
        await remittance.updateStatus('PENDING');

        await remittance.save();
        res.status(201).json(remittance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todas las remesas
const getAllRemittances = async (req, res) => {
    try {
        const remittances = await Remittance.find()
            .populate('client', 'name email')
            .populate('statusHistory');
        res.json(remittances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener remesa por ID
const getRemittanceById = async (req, res) => {
    try {
        const remittance = await Remittance.findById(req.params.id)
            .populate('client', 'name email')
            .populate('statusHistory');

        if (!remittance) {
            return res.status(404).json({ message: 'Remesa no encontrada' });
        }

        res.json(remittance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar estado de la remesa
const updateRemittanceStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const remittance = await Remittance.findById(req.params.id);

        if (!remittance) {
            return res.status(404).json({ message: 'Remesa no encontrada' });
        }

        // Solo trabajadores pueden actualizar el estado
        if (req.user.role !== 'worker') {
            return res.status(403).json({ message: 'Solo los trabajadores pueden actualizar el estado' });
        }

        // Validar que el estado sea válido
        if (!['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        // Actualizar estado
        await remittance.updateStatus(status, notes);

        res.json(remittance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener remesas por cliente
const getRemittancesByClient = async (req, res) => {
    try {
        const remittances = await Remittance.find({ client: req.params.clientId })
            .populate('client', 'name email')
            .populate('statusHistory');
        res.json(remittances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener remesas por estado
const getRemittancesByStatus = async (req, res) => {
    try {
        const remittances = await Remittance.find({ currentStatus: req.params.status })
            .populate('client', 'name email')
            .populate('statusHistory');
        res.json(remittances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener remesas por moneda
const getRemittancesByCurrency = async (req, res) => {
    try {
        const remittances = await Remittance.find({ currency: req.params.currency })
            .populate('client', 'name email')
            .populate('statusHistory');
        res.json(remittances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createRemittance,
    getAllRemittances,
    getRemittanceById,
    updateRemittanceStatus,
    getRemittancesByClient,
    getRemittancesByStatus,
    getRemittancesByCurrency
};
