const express = require('express');
const router = express.Router();
const { 
    getAllOfertas,
    getOfertaById,
    createOferta,
    updateOferta,
    deleteOferta,
    toggleOferta
} = require('../controllers/ofertaRecargasController');
const { auth, authorize } = require('../middleware/auth');

// @route   GET /api/ofertas-recargas
router.get('/', auth, authorize('admin', 'worker'), getAllOfertas);

// @route   GET /api/ofertas-recargas/:id
router.get('/:id', auth, authorize('admin', 'worker'), getOfertaById);

// @route   POST /api/ofertas-recargas
router.post('/', auth, authorize('admin', 'worker'), createOferta);

// @route   PUT /api/ofertas-recargas/:id
router.put('/:id', auth, authorize('admin', 'worker'), updateOferta);

// @route   DELETE /api/ofertas-recargas/:id
router.delete('/:id', auth, authorize('admin', 'worker'), deleteOferta);

// @route   PATCH /api/ofertas-recargas/:id/toggle
router.patch('/:id/toggle', auth, authorize('admin', 'worker'), toggleOferta);

module.exports = router;
