import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM appointments ORDER BY appointment_date DESC');
    res.json({ appointments: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments', message: error.message });
  }
});

// Create appointment
router.post('/', async (req, res) => {
  try {
    const { patient_id, caregiver_id, appointment_date, duration, notes } = req.body;
    const result = await query(
      'INSERT INTO appointments (patient_id, caregiver_id, appointment_date, duration, notes, created_date, updated_date) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [patient_id, caregiver_id, appointment_date, duration, notes]
    );
    res.status(201).json({ appointment: result.rows[0] });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment', message: error.message });
  }
});

export default router;
