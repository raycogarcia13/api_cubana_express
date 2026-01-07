const express = require('express');
const router = express.Router();
const { 
    createPackage, 
    getAllPackages, 
    getPackageById,
    updatePackageStatus,
    getPackagesByClient,
    getPackagesByRecipient,
    getPackagesByStatus 
} = require('../controllers/packageController');
const { auth, authorize } = require('../middleware/auth');

// Rutas protegidas para administradores y trabajadores
router.post('/', auth, authorize('admin', 'worker'), createPackage);
router.get('/', auth, authorize('admin', 'worker'), getAllPackages);
router.get('/:id', auth, authorize('admin', 'worker'), getPackageById);
router.get('/client/:clientId', auth, authorize('admin', 'worker'), getPackagesByClient);
router.get('/recipient/:recipientId', auth, authorize('admin', 'worker'), getPackagesByRecipient);
router.get('/status/:status', auth, authorize('admin', 'worker'), getPackagesByStatus);

// Ruta para actualizar estado (solo para trabajadores)
router.put('/:id/status', auth, authorize('worker'), updatePackageStatus);

module.exports = router;
