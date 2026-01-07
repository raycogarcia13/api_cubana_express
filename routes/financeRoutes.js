const express = require('express');
const router = express.Router();
const { 
    getFinances,
    getFinanceByProvince,
    addOperation,
    getFinancialStatus,
    getOperations,
    deleteOperation
} = require('../controllers/financeController');
const { auth, authorize } = require('../middleware/auth');

// Rutas protegidas para administradores y trabajadores
router.get('/', auth, authorize('admin', 'worker'), getFinances);
router.get('/status', auth, authorize('admin', 'worker'), getFinancialStatus);
router.get('/operations', auth, authorize('admin', 'worker'), getOperations);

// Rutas para operaciones financieras
router.post('/operation', auth, authorize('admin', 'worker'), addOperation);
router.delete('/operation/:provinceId/:operationId', auth, authorize('admin', 'worker'), deleteOperation);

// Rutas por provincia
router.get('/province/:provinceId', auth, authorize('admin', 'worker'), getFinanceByProvince);

module.exports = router;
