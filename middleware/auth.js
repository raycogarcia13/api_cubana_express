const jwt = require('jsonwebtoken');
const config = require('../config/config');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided',
                redirect: '/login'
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // Handle different JWT errors
        let message = 'Invalid token';
        let redirect = '/login';
        
        if (error.name === 'TokenExpiredError') {
            message = 'Token expired';
            redirect = '/login';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Invalid token';
            redirect = '/login';
        }
        
        res.status(401).json({ 
            message,
            redirect,
            expired: error.name === 'TokenExpiredError'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this resource` 
            });
        }
        next();
    };
};

module.exports = {
    auth,
    authorize
};
