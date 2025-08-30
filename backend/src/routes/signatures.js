import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all signatures
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM signatures ORDER BY created_date DESC');
    res.json({ signatures: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Get signatures error:', error);
    res.status(500).json({ error: 'Failed to fetch signatures', message: error.message });
  }
});

// Create signature request
router.post('/', async (req, res) => {
  try {
    console.log('📝 Signature request data:', req.body);
    
    const { 
      title, 
      recipients = [], 
      custom_message, 
      provider = 'boldsign',
      external_request_id,
      related_entity_type,
      related_entity_id,
      status = 'pending',
      // Legacy fields for backward compatibility
      document_id, 
      signer_email, 
      signer_name 
    } = req.body;
    
    // Get agency_id from first agency (similar to leads route)
    const agencyResult = await query('SELECT id FROM agencies LIMIT 1');
    if (agencyResult.rows.length === 0) {
      return res.status(400).json({ error: 'No agency found' });
    }
    const agency_id = agencyResult.rows[0].id;
    
    // Handle multiple recipients or single signer
    if (recipients && recipients.length > 0) {
      // Create signature request for each recipient
      const signatures = [];
      for (const recipient of recipients) {
        if (!recipient.email || !recipient.name) {
          return res.status(400).json({ 
            error: 'Invalid recipient data: email and name are required',
            recipient 
          });
        }
        
        const result = await query(
          'INSERT INTO signatures (agency_id, document_id, signer_email, signer_name, status, metadata, created_date, updated_date) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
          [
            agency_id, 
            external_request_id || document_id || title, 
            recipient.email, 
            recipient.name, 
            status,
            JSON.stringify({ 
              title, 
              custom_message, 
              provider, 
              related_entity_type, 
              related_entity_id 
            })
          ]
        );
        signatures.push(result.rows[0]);
      }
      res.status(201).json({ signatures, total: signatures.length });
    } else if (signer_email && signer_name) {
      // Legacy single signer support
      const result = await query(
        'INSERT INTO signatures (agency_id, document_id, signer_email, signer_name, status, created_date, updated_date) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *',
        [agency_id, document_id, signer_email, signer_name, status]
      );
      res.status(201).json({ signature: result.rows[0] });
    } else {
      return res.status(400).json({ 
        error: 'No recipients provided. Please add at least one recipient with name and email.',
        receivedData: { recipients, signer_email, signer_name }
      });
    }
  } catch (error) {
    console.error('Create signature error:', error);
    res.status(500).json({ error: 'Failed to create signature', message: error.message });
  }
});

export default router;
