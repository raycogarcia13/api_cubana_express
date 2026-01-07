const Package = require('../models/Package');
const Client = require('../models/Client');

// Crear nuevo envío
const createPackage = async (req, res) => {
    try {
        const { client, recipient, weight, cost, moneyAmount, destinationProvince } = req.body;

        // Validar que el cliente y destinatario existan
        const sender = await Client.findById(client);
        const receiver = await Client.findById(recipient);
        
        if (!sender || !receiver) {
            return res.status(404).json({ 
                message: 'Cliente o destinatario no encontrado' 
            });
        }

        // Validar que el destinatario sea un destinatario válido del cliente
        const validRecipient = sender.recipients.some(r => 
            r.name === recipient.name && 
            r.phone === recipient.phone && 
            r.address === recipient.address && 
            r.bankCardNumber === recipient.bankCardNumber
        );
        
        if (!validRecipient) {
            return res.status(400).json({ 
                message: 'El destinatario no es un destinatario válido del cliente' 
            });
        }

        const package = new Package({
            client,
            recipient: {
                name: recipient.name,
                phone: recipient.phone,
                address: recipient.address,
                bankCardNumber: recipient.bankCardNumber
            },
            weight,
            cost,
            moneyAmount,
            destinationProvince
        });

        // Agregar primer estado (RECEIVED)
        await package.updateStatus('RECEIVED', sender.department);

        await package.save();
        res.status(201).json(package);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todos los envíos
const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find()
            .populate('client', 'name email')
            .populate('recipient', 'name phone')
            .populate('statusHistory.worker', 'name');
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener envío por ID
const getPackageById = async (req, res) => {
    try {
        const package = await Package.findById(req.params.id)
            .populate('client', 'name email')
            .populate('recipient', 'name phone')
            .populate('statusHistory.worker', 'name');

        if (!package) {
            return res.status(404).json({ message: 'Envío no encontrado' });
        }

        res.json(package);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar estado del envío
const updatePackageStatus = async (req, res) => {
    try {
        const { status, location } = req.body;
        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({ message: 'Envío no encontrado' });
        }

        // Solo trabajadores pueden actualizar el estado
        if (req.user.role !== 'worker') {
            return res.status(403).json({ message: 'Solo los trabajadores pueden actualizar el estado' });
        }

        // Validar que el estado sea válido
        if (!['RECEIVED', 'TRANSPORTING', 'DELIVERED'].includes(status)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        // Validar que el cambio de estado sea lógico
        if (status === 'RECEIVED' && package.currentStatus !== 'RECEIVED') {
            return res.status(400).json({ 
                message: 'No se puede volver a RECEIVED una vez que el paquete ha sido transportado' 
            });
        }

        // Actualizar estado
        await package.updateStatus(
            status,
            location,
            req.user._id,
            status === 'DELIVERED' ? req.body.deliveryPhoto : null
        );

        res.json(package);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener envíos por cliente
const getPackagesByClient = async (req, res) => {
    try {
        const packages = await Package.find({ client: req.params.clientId })
            .populate('client', 'name email')
            .populate('recipient', 'name phone')
            .populate('statusHistory.worker', 'name');
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener envíos por destinatario
const getPackagesByRecipient = async (req, res) => {
    try {
        const packages = await Package.find({ recipient: req.params.recipientId })
            .populate('client', 'name email')
            .populate('recipient', 'name phone')
            .populate('statusHistory.worker', 'name');
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener envíos por estado
const getPackagesByStatus = async (req, res) => {
    try {
        const packages = await Package.find({ currentStatus: req.params.status })
            .populate('client', 'name email')
            .populate('recipient', 'name phone')
            .populate('statusHistory.worker', 'name');
        res.json(packages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackageStatus,
    getPackagesByClient,
    getPackagesByRecipient,
    getPackagesByStatus
};
