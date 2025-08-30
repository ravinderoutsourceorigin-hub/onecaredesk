import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all patients
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json({ patients: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients', message: error.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth } = req.body;
    const result = await query(
      'INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [first_name, last_name, email, phone, date_of_birth]
    );
    res.status(201).json({ patient: result.rows[0] });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Failed to create patient', message: error.message });
  }
});

export default router;
