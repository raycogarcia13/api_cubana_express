const express = require('express');
const router = express.Router();
const { 
    createProvince, 
    getAllProvinces, 
    getProvinceById,
    updateProvince,
    deleteProvince,
    getWorkersByProvince,
    assignWorkerToProvince,
    removeWorkerFromProvince 
} = require('../controllers/provinceController');
const { auth, authorize } = require('../middleware/auth');

// Todas las rutas protegidas para administradores
router.post('/', auth, authorize('admin'), createProvince);
router.get('/', auth, authorize('admin'), getAllProvinces);
router.get('/:id', auth, authorize('admin'), getProvinceById);
router.put('/:id', auth, authorize('admin'), updateProvince);
router.delete('/:id', auth, authorize('admin'), deleteProvince);
router.get('/:id/workers', auth, authorize('admin'), getWorkersByProvince);
router.post('/:id/workers', auth, authorize('admin'), assignWorkerToProvince);
router.delete('/:id/workers', auth, authorize('admin'), removeWorkerFromProvince);

module.exports = router;
