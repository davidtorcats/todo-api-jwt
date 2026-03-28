const express = require('express');
const router = express.Router();
const path = require('path');

// Base de datos temporal 
let tasks = [
    { id: 1, title: 'Aprender express', completed: false },
    { id: 2, title: 'Crear una api rest', completed: false }
];

let nextId = 3;

// obtener todas las tareas
router.get('/', (req, res) => {
    const userTasks = tasks.filter(t => t.userId === req.user.id);
    res.json(userTasks);
});

// obtener una tarea por id
router.get('/:id', (req, res) => {
    const userTasks = tasks.filter(t => t.userId === req.user.id);

    const task = userTasks.find(t => t.id === parseInt(req.params.id))
    if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    res.json(task)
})

// crear una tarea 
router.post('/', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'El titulo es requerido' })
    }

    const newTask = {
        title,
        completed: false,
        id: nextId++,
        userId: req.user.id,
        file: null
    }

    tasks.push(newTask);
    res.status(201).json(newTask)
})


// Subir archivo a una tarea
router.post('/:id/file', (req, res) => {
    const task = tasks.find(
        t => t.id === parseInt(req.params.id) && t.userId === req.user.id
    );
    if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (!req.files || !req.files.attachment) {
        return res.status(400).json({
            error: 'No se envió ningún archivo. Usa el campo "attachment"'
        });
    }

    const file = req.files.attachment;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
            error: 'Tipo no permitido. Solo: JPG, PNG, GIF, PDF'
        });
    }

    const ext = path.extname(file.name);
    const fileName = `task-${task.id}-${Date.now()}${ext}`;
    const uploadPath = path.join(__dirname, '../../uploads', fileName);

    file.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar el archivo' });
        }

        task.file = {
            name: file.name,
            path: `/uploads/${fileName}`,
            size: file.size,
            mimetype: file.mimetype
        };

        res.json({ message: 'Archivo subido exitosamente', task });
    });
});

// actualizar tarea 
router.put('/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id))

    if (!task) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
        task.title = title;
    }

    if (completed !== undefined) {
        task.completed = completed;
    }

    res.json(task)
})

// eliminar una tarea
router.delete('/:id', (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id))

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Tarea no encontrada' })
    }

    tasks.splice(taskIndex, 1);
    res.status(204).send();
})

module.exports = router;