const Province = require('../models/Province');
const User = require('../models/User');

// Crear nueva provincia
const createProvince = async (req, res) => {
    try {
        const { name, code } = req.body;
        
        // Verificar si la provincia ya existe
        const existingProvince = await Province.findOne({ $or: [{ name }, { code }] });
        if (existingProvince) {
            return res.status(400).json({ 
                message: 'Provincia ya existe' 
            });
        }

        const province = new Province({
            name,
            code
        });

        await province.save();
        res.status(201).json(province);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todas las provincias
const getAllProvinces = async (req, res) => {
    try {
        const provinces = await Province.find()
            .populate('workers', 'name email role');
        res.json(provinces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener provincia por ID
const getProvinceById = async (req, res) => {
    try {
        const province = await Province.findById(req.params.id)
            .populate('workers', 'name email role');
        
        if (!province) {
            return res.status(404).json({ message: 'Provincia no encontrada' });
        }

        res.json(province);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar provincia
const updateProvince = async (req, res) => {
    try {
        const province = await Province.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('workers', 'name email role');

        if (!province) {
            return res.status(404).json({ message: 'Provincia no encontrada' });
        }

        res.json(province);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar provincia
const deleteProvince = async (req, res) => {
    try {
        const province = await Province.findById(req.params.id);
        if (!province) {
            return res.status(404).json({ message: 'Provincia no encontrada' });
        }

        // Desasociar trabajadores
        await User.updateMany(
            { province: req.params.id },
            { $unset: { province: 1 } }
        );

        await province.deleteOne();
        res.json({ message: 'Provincia eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener trabajadores de una provincia
const getWorkersByProvince = async (req, res) => {
    try {
        const province = await Province.findById(req.params.id)
            .populate('workers', 'name email role');
        
        if (!province) {
            return res.status(404).json({ message: 'Provincia no encontrada' });
        }

        res.json(province.workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Asignar trabajador a provincia
const assignWorkerToProvince = async (req, res) => {
    try {
        const { workerId } = req.body;
        const province = await Province.findById(req.params.id);
        const worker = await User.findById(workerId);

        if (!province) {
            return res.status(404).json({ message: 'Provincia no encontrada' });
        }

        if (!worker) {
            return res.status(404).json({ message: 'Trabajador no encontrado' });
        }

        if (worker.role !== 'worker') {
            return res.status(400).json({ message: 'El usuario no es un trabajador' });
        }

        // Verificar si el trabajador ya está asignado a otra provincia
        if (worker.province) {
            return res.status(400).json({ message: 'El trabajador ya está asignado a otra provincia' });
        }

        // Asignar trabajador
        worker.province = province._id;
        await worker.save();

        // Agregar trabajador a la provincia
        province.workers.push(worker._id);
        await province.save();

        res.json({ message: 'Trabajador asignado exitosamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remover trabajador de provincia
const removeWorkerFromProvince = async (req, res) => {
    try {
        const { workerId } = req.body;
        const province = await Province.findById(req.params.id);
        const worker = await User.findById(workerId);

        if (!province) {
            return res.status(404).json({ message: 'Provincia no encontrada' });
        }

        if (!worker) {
            return res.status(404).json({ message: 'Trabajador no encontrado' });
        }

        // Verificar si el trabajador está asignado a esta provincia
        if (!province.workers.includes(worker._id)) {
            return res.status(400).json({ message: 'El trabajador no está asignado a esta provincia' });
        }

        // Remover trabajador de la provincia
        worker.province = null;
        await worker.save();

        province.workers = province.workers.filter(w => w.toString() !== workerId);
        await province.save();

        res.json({ message: 'Trabajador removido exitosamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createProvince,
    getAllProvinces,
    getProvinceById,
    updateProvince,
    deleteProvince,
    getWorkersByProvince,
    assignWorkerToProvince,
    removeWorkerFromProvince
};
