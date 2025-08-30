import express from 'express';
import boldSignService from '../services/boldSignService.js';

const router = express.Router();

// Get BoldSign templates
router.get('/templates', async (req, res) => {
  try {
    console.log('🔍 API call: GET /boldsign/templates');
    const result = await boldSignService.getTemplates();
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          success: true,
          templates: result.templates
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ BoldSign templates API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch BoldSign templates'
    });
  }
});

// Send signature request
router.post('/send', async (req, res) => {
  try {
    console.log('📤 API call: POST /boldsign/send');
    console.log('Request body:', req.body);
    
    const { templateId, title, message, signers } = req.body;
    
    if (!templateId || !title || !signers || signers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: templateId, title, and signers'
      });
    }
    
    const result = await boldSignService.sendSignatureRequest({
      templateId,
      title,
      message,
      signers
    });
    
    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ BoldSign send API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send signature request'
    });
  }
});

// Get document status
router.get('/document/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    console.log(`🔍 API call: GET /boldsign/document/${documentId}`);
    
    const result = await boldSignService.getDocumentStatus(documentId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.document
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ BoldSign document status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get document status'
    });
  }
});

// List documents
router.get('/documents', async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    console.log(`🔍 API call: GET /boldsign/documents?page=${page}&pageSize=${pageSize}`);
    
    const result = await boldSignService.listDocuments(parseInt(page), parseInt(pageSize));
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          documents: result.documents,
          totalCount: result.totalCount
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ BoldSign documents list API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list documents'
    });
  }
});

export default router;
