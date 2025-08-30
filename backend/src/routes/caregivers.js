import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all caregivers
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM caregivers ORDER BY created_date DESC');
    res.json({ caregivers: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get caregivers error:', error);
    res.status(500).json({ error: 'Failed to fetch caregivers', message: error.message });
  }
});

// Create caregiver
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization } = req.body;
    const result = await query(
      'INSERT INTO caregivers (first_name, last_name, email, phone, specialization, created_date, updated_date) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [first_name, last_name, email, phone, specialization]
    );
    res.status(201).json({ caregiver: result.rows[0] });
  } catch (error) {
    console.error('Create caregiver error:', error);
    res.status(500).json({ error: 'Failed to create caregiver', message: error.message });
  }
});

export default router;
