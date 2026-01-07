require('dotenv').config();

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://raycogarcia13_db_user:kronosk13@cubana.hwvluzo.mongodb.net/?appName=cubana',
    JWT_SECRET: process.env.JWT_SECRET || 'tu-secreto-seguro-aqui',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    PORT: process.env.PORT || 3000
};
