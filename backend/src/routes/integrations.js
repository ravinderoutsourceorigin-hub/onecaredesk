import express from 'express';
import Configuration from '../models/Configuration.js';

const router = express.Router();

// Create configuration instance
const configModel = new Configuration();

// JotForm API endpoints
router.post('/jotform', async (req, res) => {
  try {
    console.log('JotForm API request received:', JSON.stringify(req.body, null, 2));
    const { action, ...params } = req.body;
    
    // Get JotForm API key from configuration or environment (for development)
    let apiKey;
    
    try {
      const jotformConfigs = await configModel.findAll({ 
        key: 'jotform_api_key' 
      });
      const jotformConfig = jotformConfigs.length > 0 ? jotformConfigs[0] : null;
      apiKey = jotformConfig?.value;
    } catch (dbError) {
      console.warn('Database connection failed for JotForm config, using environment fallback:', dbError.message);
    }
    
    // Fallback to environment variable for development
    if (!apiKey) {
      apiKey = process.env.JOTFORM_API_KEY || 'demo_api_key_for_testing';
      
      if (apiKey === 'demo_api_key_for_testing') {
        return res.status(400).json({
          success: false,
          error: 'JotForm API key not configured. Please add JOTFORM_API_KEY to your .env file or configure it in Settings.'
        });
      }
    }
    const baseUrl = 'https://hipaa-api.jotform.com';

    switch (action) {
      case 'getForms':
        try {
          const response = await fetch(`${baseUrl}/user/forms?apiKey=${apiKey}&limit=100&orderby=created_at`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`JotForm API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.responseCode === 200 && data.content) {
            const forms = data.content.map(form => ({
              id: form.id,
              title: form.title,
              status: form.status,
              url: form.url,
              count: form.count || 0,
              created_at: form.created_at,
              updated_at: form.updated_at
            }));

            res.json({
              success: true,
              forms: forms
            });
          } else {
            throw new Error(data.message || 'Failed to fetch forms');
          }
        } catch (error) {
          console.error('JotForm API error:', error);
          res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch forms from JotForm'
          });
        }
        break;

      case 'getForm':
        try {
          const { formId } = params;
          if (!formId) {
            return res.status(400).json({
              success: false,
              error: 'Form ID is required'
            });
          }

          const response = await fetch(`${baseUrl}/form/${formId}?apiKey=${apiKey}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`JotForm API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.responseCode === 200 && data.content) {
            res.json({
              success: true,
              form: data.content
            });
          } else {
            throw new Error(data.message || 'Failed to fetch form');
          }
        } catch (error) {
          console.error('JotForm API error:', error);
          res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch form from JotForm'
          });
        }
        break;

      case 'getSubmissions':
        try {
          const { formId, limit = 20, offset = 0 } = params;
          if (!formId) {
            return res.status(400).json({
              success: false,
              error: 'Form ID is required'
            });
          }

          const response = await fetch(`${baseUrl}/form/${formId}/submissions?apiKey=${apiKey}&limit=${limit}&offset=${offset}&orderby=created_at`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`JotForm API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.responseCode === 200 && data.content) {
            res.json({
              success: true,
              submissions: data.content,
              total: data.content.length
            });
          } else {
            throw new Error(data.message || 'Failed to fetch submissions');
          }
        } catch (error) {
          console.error('JotForm API error:', error);
          res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch submissions from JotForm'
          });
        }
        break;

      case 'sendSignatureRequest':
        try {
          const { formId, recipients, title, message } = params;
          if (!formId) {
            return res.status(400).json({
              success: false,
              error: 'Form ID is required'
            });
          }

          // Get form details first
          const formResponse = await fetch(`${baseUrl}/form/${formId}?apiKey=${apiKey}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (!formResponse.ok) {
            throw new Error(`JotForm API error: ${formResponse.status}`);
          }

          const formData = await formResponse.json();
          
          if (formData.responseCode === 200 && formData.content) {
            const form = formData.content;
            
            // JotForm doesn't have native signature requests, so we return the form URL for sharing
            // In a real implementation, you might integrate with an email service to send the form
            res.json({
              success: true,
              formUrl: form.url,
              formId: formId,
              formTitle: form.title,
              message: 'Form URL generated successfully. Recipients can fill out the form at the provided URL.'
            });
          } else {
            throw new Error(formData.message || 'Failed to get form details');
          }
        } catch (error) {
          console.error('JotForm API error:', error);
          res.status(500).json({
            success: false,
            error: error.message || 'Failed to process signature request'
          });
        }
        break;

      default:
        res.status(400).json({
          success: false,
          error: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Resend Email API endpoints  
router.post('/resend', async (req, res) => {
  try {
    const { action, ...params } = req.body;
    
    // Get Resend API key from configuration or environment (for development)
    let apiKey;
    
    try {
      const resendConfigs = await configModel.findAll({ 
        key: 'resend_api_key' 
      });
      const resendConfig = resendConfigs.length > 0 ? resendConfigs[0] : null;
      apiKey = resendConfig?.value;
    } catch (dbError) {
      console.warn('Database connection failed for Resend config, using environment fallback:', dbError.message);
    }
    
    // Fallback to environment variable
    if (!apiKey) {
      apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey || apiKey === 'your_resend_api_key') {
        return res.status(400).json({
          success: false,
          error: 'Resend API key not configured. Please add RESEND_API_KEY to your .env file or configure it in Settings.'
        });
      }
    }
    const baseUrl = 'https://api.resend.com';

    switch (action) {
      case 'sendEmail':
        try {
          const { to, subject, html, text, from } = params;
          
          if (!to || !subject || (!html && !text)) {
            return res.status(400).json({
              success: false,
              error: 'Missing required fields: to, subject, and content (html or text)'
            });
          }

          // Get default from email from configuration
          const fromEmailConfigs = await configModel.findAll({ 
            key: 'resend_from_email' 
          });
          const fromNameConfigs = await configModel.findAll({ 
            key: 'resend_from_name' 
          });
          const fromEmailConfig = fromEmailConfigs.length > 0 ? fromEmailConfigs[0] : null;
          const fromNameConfig = fromNameConfigs.length > 0 ? fromNameConfigs[0] : null;

          const defaultFromEmail = fromEmailConfig?.value || 'noreply@yourdomain.com';
          const defaultFromName = fromNameConfig?.value || 'OneCare Desk';
          const fromAddress = from || `${defaultFromName} <${defaultFromEmail}>`;

          const emailData = {
            from: fromAddress,
            to: Array.isArray(to) ? to : [to],
            subject,
            ...(html && { html }),
            ...(text && { text })
          };

          const response = await fetch(`${baseUrl}/emails`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Resend API error: ${response.status}`);
          }

          const data = await response.json();
          
          res.json({
            success: true,
            data: data
          });
        } catch (error) {
          console.error('Resend API error:', error);
          res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email via Resend'
          });
        }
        break;

      default:
        res.status(400).json({
          success: false,
          error: 'Invalid action specified'
        });
    }
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;