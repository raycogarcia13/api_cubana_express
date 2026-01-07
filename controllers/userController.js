const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Crear nuevo usuario
const createUser = async (req, res) => {
    try {
        // Validar que el rol sea válido
        if (req.body.role && !['admin', 'client', 'worker'].includes(req.body.role)) {
            return res.status(400).json({ 
                message: 'Rol no válido. Los roles permitidos son: admin, client, worker' 
            });
        }

        // Solo administradores pueden crear otros administradores
        if (req.body.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden crear otros administradores' 
            });
        }

        const { name, email, password, role, province } = req.body;
        
        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            province: province || null,
            role: role || 'client'
        });

        await user.save();
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar usuario
const updateUser = async (req, res) => {
    try {
        // No permitir cambiar el rol a admin
        if (req.body.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden crear otros administradores' 
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        // No permitir eliminar el único administrador
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden eliminar otros administradores' 
            });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cambiar contraseña de usuario
const changePassword = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password || password.length < 6) {
            return res.status(400).json({ 
                message: 'La contraseña debe tener al menos 6 caracteres' 
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Hash nueva contraseña
        // const hashedPassword = await bcrypt.hash(password, 10);
        user.password = password;
        await user.save();

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener usuarios por rol
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const users = await User.find({ role }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUsersByRole,
    changePassword
};
