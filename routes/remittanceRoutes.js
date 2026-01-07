const express = require('express');
const router = express.Router();
const { 
    createRemittance, 
    getAllRemittances, 
    getRemittanceById,
    updateRemittanceStatus,
    getRemittancesByClient,
    getRemittancesByStatus,
    getRemittancesByCurrency 
} = require('../controllers/remittanceController');
const { auth, authorize } = require('../middleware/auth');

// Rutas protegidas para administradores y trabajadores
router.post('/', auth, authorize('admin', 'worker'), createRemittance);
router.get('/', auth, authorize('admin', 'worker'), getAllRemittances);
router.get('/:id', auth, authorize('admin', 'worker'), getRemittanceById);
router.get('/client/:clientId', auth, authorize('admin', 'worker'), getRemittancesByClient);
router.get('/status/:status', auth, authorize('admin', 'worker'), getRemittancesByStatus);
router.get('/currency/:currency', auth, authorize('admin', 'worker'), getRemittancesByCurrency);

// Ruta para actualizar estado (solo para trabajadores)
router.put('/:id/status', auth, authorize('worker'), updateRemittanceStatus);

module.exports = router;
