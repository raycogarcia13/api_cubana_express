const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        
        const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN
        });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const match_password = await bcrypt.compare(password, user.password)
        if (!user || !match_password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                province: user.province
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    register,
    login
};
