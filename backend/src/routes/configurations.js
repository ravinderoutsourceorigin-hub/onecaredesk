import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all configurations
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM configurations ORDER BY created_at DESC');
    res.json({ configurations: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get configurations error:', error);
    res.status(500).json({ error: 'Failed to fetch configurations', message: error.message });
  }
});

// Create/Update configuration
router.post('/', async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const result = await query(
      'INSERT INTO configurations (key, value, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW() RETURNING *',
      [key, value, description]
    );
    res.json({ configuration: result.rows[0] });
  } catch (error) {
    console.error('Save configuration error:', error);
    res.status(500).json({ error: 'Failed to save configuration', message: error.message });
  }
});

export default router;
