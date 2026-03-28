const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

const router = express.Router();

// Base de datos temporal 
const users = [];

// registrar usuario
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' })
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya esta registrado' })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        }

        users.push(newUser);

        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.status(201).json({ message: 'Usuario registrado correctamente', user: { id: newUser.id, name: newUser.name, email: newUser.email }, token })
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' })
    }
})

// login usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y password son requeridos' })
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Credenciales invalidas' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Credenciales invalidas' })
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.json({ message: 'Login exitoso', user: { id: user.id, name: user.name, email: user.email }, token })
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesion' })
    }
}
)
module.exports = router;