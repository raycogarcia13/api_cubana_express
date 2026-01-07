const OfertaRecargas = require('../models/OfertaRecargas');

// @desc    Obtener todas las ofertas de recargas
// @route   GET /api/ofertas-recargas
// @access  Private/Admin
const getAllOfertas = async (req, res) => {
    try {
        const ofertas = await OfertaRecargas.find().sort({ createdAt: -1 });
        res.json(ofertas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener oferta por ID
// @route   GET /api/ofertas-recargas/:id
// @access  Private/Admin
const getOfertaById = async (req, res) => {
    try {
        const oferta = await OfertaRecargas.findById(req.params.id);
        
        if (!oferta) {
            return res.status(404).json({ message: 'Oferta no encontrada' });
        }

        res.json(oferta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Crear nueva oferta de recargas
// @route   POST /api/ofertas-recargas
// @access  Private/Admin
const createOferta = async (req, res) => {
    try {
        const { titulo, descripcion, precio,costo,  bonos } = req.body;

        // Validar que los bonos tengan la estructura correcta
        if (bonos && Array.isArray(bonos)) {
            for (const bono of bonos) {
                if (!bono.titulo || !bono.tipo) {
                    return res.status(400).json({ 
                        message: 'Cada bono debe tener titulo y tipo' 
                    });
                }

                if (!['Minutos', 'Mensajes', 'Datos'].includes(bono.tipo)) {
                    return res.status(400).json({ 
                        message: 'Tipo de bono no válido. Debe ser: Minutos, Mensajes o Datos' 
                    });
                }
            }
        }

        const oferta = new OfertaRecargas({
            titulo,
            descripcion,
            precio,
            costo,
            bonos: bonos || []
        });

        const savedOferta = await oferta.save();
        res.status(201).json(savedOferta);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Actualizar oferta de recargas
// @route   PUT /api/ofertas-recargas/:id
// @access  Private/Admin
const updateOferta = async (req, res) => {
    try {
        const { titulo, descripcion, precio, costo, bonos, activa } = req.body;

        // Validar que los bonos tengan la estructura correcta
        if (bonos && Array.isArray(bonos)) {
            for (const bono of bonos) {
                if (!bono.titulo || !bono.tipo) {
                    return res.status(400).json({ 
                        message: 'Cada bono debe tener titulo y tipo' 
                    });
                }

                if (!['Minutos', 'Mensajes', 'Datos'].includes(bono.tipo)) {
                    return res.status(400).json({ 
                        message: 'Tipo de bono no válido. Debe ser: Minutos, Mensajes o Datos' 
                    });
                }
            }
        }

        const oferta = await OfertaRecargas.findByIdAndUpdate(
            req.params.id,
            { titulo, descripcion, precio, costo, bonos, activa },
            { new: true, runValidators: true }
        );

        if (!oferta) {
            return res.status(404).json({ message: 'Oferta no encontrada' });
        }

        res.json(oferta);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Eliminar oferta de recargas
// @route   DELETE /api/ofertas-recargas/:id
// @access  Private/Admin
const deleteOferta = async (req, res) => {
    try {
        const oferta = await OfertaRecargas.findById(req.params.id);
        
        if (!oferta) {
            return res.status(404).json({ message: 'Oferta no encontrada' });
        }

        await oferta.deleteOne();
        res.json({ message: 'Oferta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Activar/Desactivar oferta
// @route   PATCH /api/ofertas-recargas/:id/toggle
// @access  Private/Admin
const toggleOferta = async (req, res) => {
    try {
        const oferta = await OfertaRecargas.findById(req.params.id);
        
        if (!oferta) {
            return res.status(404).json({ message: 'Oferta no encontrada' });
        }

        oferta.activa = !oferta.activa;
        await oferta.save();
        res.json(oferta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllOfertas,
    getOfertaById,
    createOferta,
    updateOferta,
    deleteOferta,
    toggleOferta
};
