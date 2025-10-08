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

// Helper function to send signature request email
async function sendSignatureEmail(recipientEmail, recipientName, title, message, formUrl) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@onecaredesk.com';
    const fromName = process.env.RESEND_FROM_NAME || 'OneCare Desk';
    
    if (!resendApiKey || resendApiKey === 'your_resend_api_key') {
      console.warn('⚠️ Resend API key not configured, skipping email');
      return { success: false, error: 'API key not configured' };
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Signature Request</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6; 
            color: #1f2937; 
            background-color: #f3f4f6;
            padding: 20px;
          }
          .email-wrapper { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: white; 
            padding: 40px 30px; 
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .content { 
            padding: 40px 30px;
            background-color: #ffffff;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 24px;
            font-size: 15px;
            line-height: 1.7;
          }
          .document-info {
            background-color: #f9fafb;
            border-left: 4px solid #4f46e5;
            padding: 16px 20px;
            margin: 24px 0;
            border-radius: 6px;
          }
          .document-info strong {
            color: #111827;
            display: block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            color: #6b7280;
          }
          .document-title {
            font-size: 16px;
            color: #1f2937;
            font-weight: 600;
          }
          .cta-section {
            text-align: center;
            margin: 32px 0;
          }
          .button { 
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
            color: #ffffff !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
          }
          .link-section {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-top: 24px;
          }
          .link-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 8px;
            display: block;
          }
          .link-url {
            color: #4f46e5;
            word-break: break-all;
            font-size: 13px;
            text-decoration: none;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 32px 0;
          }
          .footer { 
            text-align: center;
            padding: 30px;
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            line-height: 1.6;
          }
          .footer-brand {
            color: #4f46e5;
            font-weight: 600;
            text-decoration: none;
          }
          .help-text {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 12px;
          }
          @media only screen and (max-width: 600px) {
            body { padding: 10px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 24px; }
            .content { padding: 30px 20px; }
            .button { padding: 12px 24px; font-size: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <h1>📝 Signature Request</h1>
            <p>Action required - Please review and sign</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${recipientName},</div>
            
            <div class="message">
              ${message || 'You have been requested to review and sign an important document. Please take a moment to complete this request at your earliest convenience.'}
            </div>
            
            <div class="document-info">
              <strong>📄 Document</strong>
              <div class="document-title">${title}</div>
            </div>
            
            <div class="cta-section">
              <a href="${formUrl}" class="button">
                ✍️ Open & Sign Document
              </a>
            </div>
            
            <div class="link-section">
              <span class="link-label">🔗 Or copy this link to your browser:</span>
              <a href="${formUrl}" class="link-url">${formUrl}</a>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              💡 <strong>Need help?</strong> Contact our support team if you have any questions.
            </p>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              This is an automated message from <a href="https://onecaredesk.com" class="footer-brand">OneCare Desk</a>
            </div>
            <div class="help-text">
              Please do not reply to this email. For assistance, contact your administrator.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [recipientEmail],
        subject: `Signature Request: ${title}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Resend API error:', errorData);
      return { success: false, error: errorData.message };
    }

    const data = await response.json();
    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

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
      form_url, // JotForm URL to include in email
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
      const emailResults = [];
      
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
              related_entity_id,
              form_url 
            })
          ]
        );
        signatures.push(result.rows[0]);
        
        // Send email notification with form URL
        if (form_url) {
          console.log(`📧 Sending email to ${recipient.email}...`);
          const emailResult = await sendSignatureEmail(
            recipient.email, 
            recipient.name, 
            title, 
            custom_message,
            form_url
          );
          emailResults.push({ 
            email: recipient.email, 
            sent: emailResult.success,
            error: emailResult.error 
          });
        }
      }
      
      res.status(201).json({ 
        signatures, 
        total: signatures.length,
        emailResults
      });
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
