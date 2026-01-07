const mongoose = require('mongoose');
const User = require('./models/User');
const Client = require('./models/Client');

async function seedDatabase() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://raycogarcia13_db_user:kronosk13@cubana.hwvluzo.mongodb.net/?appName=cubana');
        console.log('Conectado a MongoDB');

        // Eliminar datos existentes
        await User.deleteMany();
        await Client.deleteMany();
        console.log('Datos anteriores eliminados');

        // Crear usuario administrador
        const adminPassword = "2209";
        // const adminPassword = await bcrypt.hash('2209', 10);
        const admin = await User.create({
            name: 'Jorge A. Rodríguez Sanarrucia',
            email: 'capoyo2003@yahoo.com',
            password: adminPassword,
            role: 'admin'
        });

        console.log('Usuario administrador creado');

        // Crear clientes de ejemplo
        console.log('Seed completado exitosamente');
    } catch (error) {
        console.error('Error en el seed:', error);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
    }
}

// Ejecutar el seeder
seedDatabase();
