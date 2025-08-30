import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all leads
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM leads ORDER BY created_date DESC');
    res.json({ leads: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads', message: error.message });
  }
});

// Create lead - updated with enhanced error logging
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, status = 'new', agency_id } = req.body;
    
    // If no agency_id provided, use the first available agency for development
    let finalAgencyId = agency_id;
    if (!finalAgencyId) {
      const agenciesResult = await query('SELECT id FROM agencies LIMIT 1');
      if (agenciesResult.rows.length > 0) {
        finalAgencyId = agenciesResult.rows[0].id;
      } else {
        return res.status(400).json({ error: 'No agency available. Please create an agency first.' });
      }
    }
    
    console.log('📝 Creating lead with data:', { name, email, phone, status, agency_id: finalAgencyId });
    
    const result = await query(
      'INSERT INTO leads (agency_id, name, email, phone, status, created_date, updated_date) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [finalAgencyId, name, email, phone, status]
    );
    
    console.log('✅ Lead created successfully:', result.rows[0]);
    res.status(201).json({ lead: result.rows[0] });
  } catch (error) {
    console.error('❌ Create lead error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      column: error.column,
      table: error.table
    });
    res.status(500).json({ error: 'Failed to create lead', message: error.message });
  }
});

// Update lead
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, notes } = req.body;
    
    const result = await query(
      'UPDATE leads SET name = $1, email = $2, phone = $3, status = $4, notes = $5, updated_date = NOW() WHERE id = $6 RETURNING *',
      [name, email, phone, status, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ lead: result.rows[0] });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead', message: error.message });
  }
});

export default router;
