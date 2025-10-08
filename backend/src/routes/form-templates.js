import express from 'express';
import BaseModel from '../models/BaseModel.js';

const router = express.Router();

// Form Templates table schema
const FORM_TEMPLATES_TABLE = 'form_templates';
const FORM_TEMPLATES_FIELDS = [
  'id', 'agency_id', 'name', 'description', 'provider', 
  'form_url', 'embed_code', 'external_form_id', 
  'created_date', 'updated_date', 'is_active'
];

class FormTemplate extends BaseModel {
  static tableName = FORM_TEMPLATES_TABLE;
  static fields = FORM_TEMPLATES_FIELDS;
}

// GET /api/form-templates - List all form templates
router.get('/', async (req, res) => {
  try {
    const templates = await FormTemplate.findAll({
      orderBy: 'created_date DESC'
    });
    res.json({ 
      form_templates: templates,
      total: templates.length 
    });
  } catch (error) {
    console.error('Error fetching form templates:', error);
    res.status(500).json({ error: 'Failed to fetch form templates' });
  }
});

// GET /api/form-templates/:id - Get specific form template
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await FormTemplate.findById(id);
    
    if (!template) {
      return res.status(404).json({ error: 'Form template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching form template:', error);
    res.status(500).json({ error: 'Failed to fetch form template' });
  }
});

// POST /api/form-templates - Create new form template
router.post('/', async (req, res) => {
  try {
    const {
      agency_id,
      name,
      description,
      provider,
      form_url,
      embed_code,
      external_form_id
    } = req.body;

    // Validation
    if (!name || !agency_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: name and agency_id are required' 
      });
    }

    const templateData = {
      agency_id,
      name,
      description: description || '',
      provider: provider || 'JotForm',
      form_url: form_url || '',
      embed_code: embed_code || '',
      external_form_id: external_form_id || '',
      is_active: true
    };

    const template = await FormTemplate.create(templateData);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating form template:', error);
    res.status(500).json({ error: 'Failed to create form template' });
  }
});

// PUT /api/form-templates/:id - Update form template
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      provider,
      form_url,
      embed_code,
      external_form_id,
      is_active
    } = req.body;

    const existingTemplate = await FormTemplate.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    const updateData = {
      name: name || existingTemplate.name,
      description: description !== undefined ? description : existingTemplate.description,
      provider: provider || existingTemplate.provider,
      form_url: form_url !== undefined ? form_url : existingTemplate.form_url,
      embed_code: embed_code !== undefined ? embed_code : existingTemplate.embed_code,
      external_form_id: external_form_id !== undefined ? external_form_id : existingTemplate.external_form_id,
      is_active: is_active !== undefined ? is_active : existingTemplate.is_active
    };

    const template = await FormTemplate.update(id, updateData);
    res.json(template);
  } catch (error) {
    console.error('Error updating form template:', error);
    res.status(500).json({ error: 'Failed to update form template' });
  }
});

// DELETE /api/form-templates/:id - Delete form template
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTemplate = await FormTemplate.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Form template not found' });
    }

    await FormTemplate.delete(id);
    res.json({ message: 'Form template deleted successfully' });
  } catch (error) {
    console.error('Error deleting form template:', error);
    res.status(500).json({ error: 'Failed to delete form template' });
  }
});

export default router;