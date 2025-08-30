import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json({ tasks: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, description, status = 'pending', priority = 'medium' } = req.body;
    const result = await query(
      'INSERT INTO tasks (title, description, status, priority, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [title, description, status, priority]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

export default router;
