require('dotenv').config();

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cubana_express',
    JWT_SECRET: process.env.JWT_SECRET || 'tu-secreto-seguro-aqui',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    PORT: process.env.PORT || 3000
};
