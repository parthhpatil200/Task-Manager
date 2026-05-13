const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a task
router.post('/', async (req, res) => {
    const task = new Task({
        title:       req.body.title,
        description: req.body.description,
        priority:    req.body.priority    || 'medium',
        category:    req.body.category    || 'Other',
        status:      req.body.status      || 'todo',
        dueDate:     req.body.dueDate     || null,
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update a task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (req.body.title       != null) task.title       = req.body.title;
        if (req.body.description != null) task.description = req.body.description;
        if (req.body.priority    != null) task.priority    = req.body.priority;
        if (req.body.category    != null) task.category    = req.body.category;
        if (req.body.status      != null) {
            task.status    = req.body.status;
            task.completed = req.body.status === 'done';
        }
        if (req.body.dueDate     != null) task.dueDate     = req.body.dueDate;
        if (req.body.completed   != null) task.completed   = req.body.completed;

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await task.deleteOne();
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
