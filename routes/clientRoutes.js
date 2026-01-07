const express = require('express');
const router = express.Router();
const { 
    createClient, 
    getAllClients, 
    getClientById, 
    updateClient, 
    deleteClient,
    addRecipient,
    removeRecipient,
    getClientsCount
} = require('../controllers/clientController');
const { auth, authorize } = require('../middleware/auth');

// Rutas protegidas para administradores y trabajadores
router.post('/', auth, authorize('admin', 'worker'), createClient);
router.get('/', auth, authorize('admin', 'worker'), getAllClients);
router.get('/count', auth, authorize('admin', 'worker'), getClientsCount);
router.get('/:id', auth, authorize('admin', 'worker'), getClientById);
router.put('/:id', auth, authorize('admin', 'worker'), updateClient);
router.delete('/:id', auth, authorize('admin', 'worker'), deleteClient);

// Rutas para gestionar destinatarios
router.post('/:id/recipients', auth, authorize('admin'), addRecipient);
router.delete('/:id/recipients/:recipientId', auth, authorize('admin'), removeRecipient);

module.exports = router;
