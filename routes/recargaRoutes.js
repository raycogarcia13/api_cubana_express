const express = require('express');
const router = express.Router();
const { 
    getAllRecargas,
    getRecargaById,
    createRecarga,
    updateRecarga,
    deleteRecarga,
    confirmarRecarga,
    getRecargasByCliente,
    getRecargasByProvincia
} = require('../controllers/recargaController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/recargas
router.get('/', auth, authorize('admin', 'worker'), getAllRecargas);

// @route   GET /api/recargas/:id
router.get('/:id', auth, authorize('admin', 'worker'), getRecargaById);

// @route   GET /api/recargas/:id/detalles
router.get('/:id/detalles', auth, authorize('admin', 'worker'), getRecargaById);

// @route   POST /api/recargas
router.post('/', auth, authorize('admin', 'worker'), createRecarga);

// @route   PUT /api/recargas/:id
router.put('/:id', auth, authorize('admin', 'worker'), updateRecarga);

// @route   DELETE /api/recargas/:id
router.delete('/:id', auth, authorize('admin', 'worker'), deleteRecarga);

// @route   PATCH /api/recargas/:id/confirmar
router.patch('/:id/confirmar', auth, authorize('admin', 'worker'), confirmarRecarga);

// @route   GET /api/recargas/cliente/:clientId
router.get('/cliente/:clientId', auth, authorize('admin', 'worker'), getRecargasByCliente);

// @route   GET /api/recargas/provincia/:provinceId
router.get('/provincia/:provinceId', auth, authorize('admin', 'worker'), getRecargasByProvincia);

module.exports = router;
