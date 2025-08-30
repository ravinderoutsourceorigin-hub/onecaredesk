import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all documents
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM documents ORDER BY created_at DESC');
    res.json({ documents: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents', message: error.message });
  }
});

// Create document
router.post('/', async (req, res) => {
  try {
    const { name, type, content, related_entity_type, related_entity_id } = req.body;
    const result = await query(
      'INSERT INTO documents (name, type, content, related_entity_type, related_entity_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
      [name, type, content, related_entity_type, related_entity_id]
    );
    res.status(201).json({ document: result.rows[0] });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document', message: error.message });
  }
});

export default router;
