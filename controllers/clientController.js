const Client = require('../models/Client');

// Crear nuevo cliente
const createClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todos los clientes
const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find().populate('recipients');
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un cliente por ID
const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).populate('recipients');
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar cliente
const updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar cliente
const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agregar destinatario a cliente
const addRecipient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        client.recipients.push(req.body);
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar destinatario de cliente
const removeRecipient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        client.recipients = client.recipients.filter(
            recipient => recipient._id.toString() !== req.params.recipientId
        );
        await client.save();
        res.json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener conteo de clientes
const getClientsCount = async (req, res) => {
    try {
        const count = await Client.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient,
    addRecipient,
    removeRecipient,
    getClientsCount
};
