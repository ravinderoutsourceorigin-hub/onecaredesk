
import { Configuration } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import EmailService from './EmailService';

class FilloutAPI {
  constructor() {
    this.apiKey = null;
    this.baseURL = 'https://api.fillout.com';
  }

  async getApiKey() {
    try {
      const configs = await Configuration.filter({ key: "fillout_api_key" });
      if (configs.length > 0 && configs[0].value) {
        this.apiKey = configs[0].value;
        return this.apiKey;
      }
      return null;
    } catch (error) {
      console.error("Failed to get Fillout API key:", error);
      return null;
    }
  }

  async isAuthenticated() {
    const apiKey = await this.getApiKey();
    return !!apiKey;
  }

  async testConnection() {
    try {
      const apiKey = await this.getApiKey();
      
      if (!apiKey) {
        return {
          success: false,
          error: 'Fillout API key not configured.'
        };
      }

      // Test the connection by fetching user info
      const response = await InvokeLLM({
        prompt: `Make a GET request to test the Fillout API connection:
        
**Endpoint:** https://api.fillout.com/v1/api/forms
**Headers:** Authorization: Bearer ${apiKey}

Return the response to verify the API key is working.`,
        response_json_schema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            error: { type: "string" }
          }
        }
      });

      if (response && response.success) {
        return {
          success: true,
          message: 'Connected successfully to Fillout API!'
        };
      } else {
        return {
          success: false,
          error: response?.error || 'Failed to connect to Fillout API'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message || 'Connection test failed'
      };
    }
  }

  // Get Fillout forms that can be used for e-signatures
  async getForms() {
    console.warn("FilloutAPI.getForms: Skipping automatic form loading due to AI integration unreliability. Falling back to manual form ID entry. This is an intentional workaround to prevent errors.");
    
    // This function will now always return an empty array.
    // This forces the UI to show the manual entry field and prevents the "API call failed" error,
    // providing a stable and predictable user experience.
    return {
      success: true,
      forms: []
    };
  }

  // Get specific form details by ID
  async getFormById(formId) {
    try {
      const apiKey = await this.getApiKey();
      
      if (!apiKey) {
        throw new Error('Fillout API key not configured.');
      }

      console.log(`🔍 Fetching Fillout form details for ID: ${formId}`);
      
      const response = await InvokeLLM({
        prompt: `Get details for a specific Fillout form:
        
**Endpoint:** https://api.fillout.com/v1/api/forms/${formId}
**Headers:** Authorization: Bearer ${apiKey}

Return the form details including id, name, and status.`,
        response_json_schema: {
          type: "object",
          properties: {
            form: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                status: { type: "string" },
                url: { type: "string" }
              }
            }
          }
        }
      });
      
      console.log('📨 Fillout Form Details Response:', response);
      
      if (response && response.form && response.form.id) {
        console.log(`✅ Found Fillout form: ${response.form.name}`);
        return {
          success: true,
          form: response.form
        };
      } else {
        console.warn(`⚠️ Form ${formId} not found or not accessible`);
        return {
          success: false,
          error: `Form ${formId} not found or not accessible`
        };
      }

    } catch (error) {
      console.error('❌ Fillout getFormById failed:', error);
      throw new Error(`Failed to get form ${formId}: ${error.message}`);
    }
  }

  async sendSignatureRequest(formId, recipients, formTitle, customMessage = "") {
    try {
      console.log('📤 Preparing Fillout signature request:', { formId, recipients, formTitle });

      if (!formId) throw new Error("Form ID is missing.");
      if (!recipients || recipients.length === 0) throw new Error("Recipients list is empty.");

      // Generate the form URL - Fillout typically uses this format
      const formUrl = `https://forms.fillout.com/${formId}`;
      console.log(`✉️ Generated Form URL: ${formUrl}`);

      const emailPromises = recipients.map(async (recipient) => {
        if (!recipient.email) {
          console.warn(`Skipping recipient with no email: ${recipient.name}`);
          return { success: true, recipient: recipient.name, reason: "No email provided." };
        }

        const emailSubject = `E-Signature Request: Please Complete "${formTitle}"`;
        const emailBody = `
Dear ${recipient.name},

${customMessage || 'You have been requested to review and complete a form with signature.'}

Please click the link below to access and complete the form:
${formUrl}

Thank you,
The CareConnect Team
        `.trim();
        
        try {
          await EmailService.send({
            to: recipient.email,
            subject: emailSubject,
            textContent: emailBody
          });
          return { success: true, recipient: recipient.name };
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${recipient.email}:`, emailError);
          return { success: false, recipient: recipient.name, error: `Email service failed: ${emailError.message}` };
        }
      });
      
      const results = await Promise.all(emailPromises);
      const failedSends = results.filter(r => !r.success);

      if (failedSends.length > 0) {
        const errorMessages = failedSends.map(f => `${f.recipient} - ${f.error}`).join(', ');
        throw new Error(`The email service failed to send the request. Details: ${errorMessages}`);
      }

      return {
        success: true,
        message: `Signature request sent successfully to ${recipients.length} recipient(s).`,
        formUrl: formUrl
      };

    } catch (error) {
      console.error('❌ Fillout sendSignatureRequest failed:', error);
      throw new Error(error.message || `Failed to send signature request via Fillout.`);
    }
  }

  // Get form responses/submissions
  async getFormResponses(formId) {
    try {
      const apiKey = await this.getApiKey();
      
      if (!apiKey) {
        throw new Error('Fillout API key not configured.');
      }

      console.log(`🔍 Fetching responses for Fillout form: ${formId}`);
      
      const response = await InvokeLLM({
        prompt: `Get all responses/submissions for a Fillout form:
        
**Endpoint:** https://api.fillout.com/v1/api/forms/${formId}/submissions
**Headers:** Authorization: Bearer ${apiKey}

Return the submissions data.`,
        response_json_schema: {
          type: "object",
          properties: {
            responses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  submissionId: { type: "string" },
                  submissionTime: { type: "string" },
                  status: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      if (response && response.responses) {
        return {
          success: true,
          responses: response.responses
        };
      } else {
        return {
          success: true,
          responses: []
        };
      }

    } catch (error) {
      console.error('❌ Fillout getFormResponses failed:', error);
      throw new Error(`Failed to get form responses: ${error.message}`);
    }
  }
}

// Create and export a single instance
export default new FilloutAPI();
