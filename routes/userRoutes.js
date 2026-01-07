const express = require('express');
const router = express.Router();
const { 
    createUser,
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser,
    getUsersByRole,
    changePassword
} = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// Todas las rutas protegidas para administradores
router.post('/', auth, authorize('admin'), createUser);
router.get('/', auth, authorize('admin'), getAllUsers);
router.get('/:id', auth, authorize('admin'), getUserById);
router.get('/role/:role', auth, authorize('admin'), getUsersByRole);
router.put('/:id', auth, authorize('admin'), updateUser);
router.put('/:id/password', auth, authorize('admin'), changePassword);
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;
