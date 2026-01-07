const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const userRoutes = require('./routes/userRoutes');
const packageRoutes = require('./routes/packageRoutes');
const provinceRoutes = require('./routes/provinceRoutes');
const remittanceRoutes = require('./routes/remittanceRoutes');
const financeRoutes = require('./routes/financeRoutes');

const app = express();

const remesaRoutes = require('./routes/remesaRoutes');
const ofertaRecargasRoutes = require('./routes/ofertaRecargasRoutes');
const recargaRoutes = require('./routes/recargaRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/remittances', remittanceRoutes);
app.use('/api/remesas', remesaRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ofertas-recargas', ofertaRecargasRoutes);
app.use('/api/recargas', recargaRoutes);

// Conectar a MongoDB
mongoose.connect(config.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba protegida
const { auth, authorize } = require('./middleware/auth');
app.get('/api/test/admin', auth, authorize('admin'), (req, res) => {
    res.json({ message: 'Ruta solo para administradores' });
});

app.get('/api/test/user', auth, authorize('user', 'admin'), (req, res) => {
    res.json({ message: 'Ruta para usuarios y administradores' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal' });
});

const PORT = config.PORT;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
