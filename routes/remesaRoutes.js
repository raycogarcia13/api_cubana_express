const express = require('express');
const router = express.Router();
const {
    getAllRemesas,
    getRemesaById,
    createRemesa,
    updateRemesa,
    confirmarRemesa,
    deleteRemesa,
    getRemesasByProvincia
} = require('../controllers/remesaController');
const { auth } = require('../middleware/auth');

// Obtener todas las remesas
router.get('/', auth, getAllRemesas);

// Obtener remesa por ID
router.get('/:id', auth, getRemesaById);

// Crear nueva remesa
router.post('/', auth, createRemesa);

// Actualizar remesa
router.put('/:id', auth, updateRemesa);

// Confirmar remesa
router.put('/:id/confirmar', auth, confirmarRemesa);

// Eliminar remesa
router.delete('/:id', auth, deleteRemesa);

// Obtener remesas por provincia
router.get('/provincia/:provinceId', auth, getRemesasByProvincia);

module.exports = router;
