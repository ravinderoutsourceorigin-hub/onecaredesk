import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all agencies
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM agencies ORDER BY created_date DESC');
    res.json({ agencies: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get agencies error:', error);
    res.status(500).json({ error: 'Failed to fetch agencies', message: error.message });
  }
});

// Get agency by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM agencies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agency not found' });
    }
    
    res.json({ agency: result.rows[0] });
  } catch (error) {
    console.error('Get agency by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch agency', message: error.message });
  }
});

// Create agency
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;
    const result = await query(
      'INSERT INTO agencies (name, address, phone, email, created_date, updated_date) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, address, phone, email]
    );
    res.status(201).json({ agency: result.rows[0] });
  } catch (error) {
    console.error('Create agency error:', error);
    res.status(500).json({ error: 'Failed to create agency', message: error.message });
  }
});

export default router;
