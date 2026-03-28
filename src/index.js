const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Crear carpeta uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middlewares — TODOS antes de las rutas
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static(uploadsDir));

// Ruta pública
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: "API funcionando correctamente" });
});

// Rutas
const authRouter = require('./routes/auth');
const tasksRouter = require('./routes/tasks');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});