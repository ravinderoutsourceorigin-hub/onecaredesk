import axios from 'axios';

// BoldSign Official URLs - Updated based on documentation
const BOLDSIGN_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.boldsign.com/v1' 
  : 'https://api.boldsign.com/v1';  // BoldSign uses same URL for production and sandbox

const API_KEY = process.env.BOLDSIGN_API_KEY;

class BoldSignService {
  constructor() {
    console.log('🔧 BoldSign Service initialized with:');
    console.log('   Base URL:', BOLDSIGN_BASE_URL);
    console.log('   API Key (first 10 chars):', API_KEY?.substring(0, 10) + '...');
    
    this.client = axios.create({
      baseURL: BOLDSIGN_BASE_URL,
      headers: {
        'X-API-KEY': API_KEY,  // Try uppercase X-API-KEY
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  // Get all templates
  async getTemplates() {
    try {
      console.log('🔍 Fetching BoldSign templates...');
      console.log('   Making request to:', `${BOLDSIGN_BASE_URL}/template/list`);
      
      // Get all documents/templates
      const response = await this.client.get('/template/list');
      console.log('✅ BoldSign templates response:', response.data);
      
      // All documents can potentially be used for signature requests
      // Don't filter - let frontend handle the logic
      const templates = response.data.result || [];
      
      console.log('📋 Templates found:', templates.length);
      console.log('🔍 Templates details:', templates.map(t => ({
        id: t.documentId,
        name: t.templateName || t.messageTitle,
        status: t.status,
        isTemplate: t.isTemplate
      })));
      
      return {
        success: true,
        templates: templates
      };
    } catch (error) {
      console.error('❌ BoldSign getTemplates error details:');
      console.error('   Status:', error.response?.status);
      console.error('   Status Text:', error.response?.statusText);
      console.error('   URL:', error.config?.url);
      console.error('   Headers:', error.config?.headers);
      console.error('   Response Data:', error.response?.data);
      console.error('   Full Error:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Send signature request
  async sendSignatureRequest(params) {
    try {
      console.log('📤 Sending BoldSign signature request:', params);
      
      const { templateId, title, message, signers } = params;
      
      // BoldSign API expects Roles array with specific format (based on working log)
      // Template has 2 predefined roles: Patient and Nurse_Practitioner
      const boldSignRoles = [];
      
      // Add Patient role (first signer or default)
      if (signers.length > 0) {
        boldSignRoles.push({
          RoleIndex: 1,
          SignerName: signers[0].name,
          SignerEmail: signers[0].email,
          SignerRole: "Patient",
          Locale: "EN"
        });
      }
      
      // Add Nurse_Practitioner role (second signer or dummy)
      if (signers.length > 1) {
        boldSignRoles.push({
          RoleIndex: 2,
          SignerName: signers[1].name,
          SignerEmail: signers[1].email,
          SignerRole: "Nurse_Practitioner",
          Locale: "EN"
        });
      } else {
        // If only one signer provided, use dummy for Nurse_Practitioner role
        boldSignRoles.push({
          RoleIndex: 2,
          SignerName: "Staff Member",
          SignerEmail: "staff@onecaredesk.com", // Use a default staff email
          SignerRole: "Nurse_Practitioner",
          Locale: "EN"
        });
      }

      // Correct BoldSign API format (based on successful API log)
      const requestData = {
        Title: title,
        Message: message,
        Roles: boldSignRoles
      };

      console.log('🔍 Final request data being sent to BoldSign:', JSON.stringify(requestData, null, 2));

      let response;
      try {
        // Method 1: Try template send (original approach)
        console.log('🌐 Making POST request to:', `${BOLDSIGN_BASE_URL}/template/send?templateId=${templateId}`);
        response = await this.client.post(`/template/send?templateId=${templateId}`, requestData);
        console.log('✅ BoldSign template send response:', response.data);
      } catch (templateError) {
        console.log('⚠️ Template send failed, trying document upload approach...');
        console.log('Template error:', templateError.response?.data);
        
        // Method 2: Since this is a completed document, try document-based sending
        try {
          console.log('🌐 Making POST request to:', `${BOLDSIGN_BASE_URL}/document/send`);
          
          // For document-based sending, we need to upload/use file content
          // This is a fallback - in real scenario, you'd need the actual PDF file
          const documentRequestData = {
            Files: [], // Would need actual file here
            Title: title,
            Message: message,
            Signers: boldSignRoles.map(role => ({
              Name: role.SignerName,
              EmailAddress: role.SignerEmail,
              SignerRole: role.SignerRole,
              SignerOrder: role.RoleIndex
            }))
          };
          
          response = await this.client.post('/document/send', documentRequestData);
          console.log('✅ BoldSign document send response:', response.data);
        } catch (documentError) {
          console.log('⚠️ Document send also failed:', documentError.response?.data);
          
          // Method 3: Provide clear error message
          throw new Error(`This appears to be a completed document (ID: ${templateId}), not a reusable template. Please create a proper template in BoldSign dashboard for sending new signature requests.`);
        }
      }

      return {
        success: true,
        documentId: response.data.documentId,
        signingLinks: response.data.signingLinks,
        message: 'Signature request sent successfully'
      };
    } catch (error) {
      console.error('❌ BoldSign sendSignatureRequest error:', error.response?.data || error.message);
      
      // Provide helpful error message
      const errorMsg = error.response?.data?.error || error.message;
      return {
        success: false,
        error: `BoldSign Error: ${errorMsg}`
      };
    }
  }

  // Get document status
  async getDocumentStatus(documentId) {
    try {
      console.log(`🔍 Getting document status for: ${documentId}`);
      const response = await this.client.get(`/document/${documentId}`);
      console.log('✅ Document status response:', response.data);
      
      return {
        success: true,
        document: response.data
      };
    } catch (error) {
      console.error('❌ BoldSign getDocumentStatus error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // List documents
  async listDocuments(page = 1, pageSize = 10) {
    try {
      console.log(`🔍 Listing documents (page: ${page}, size: ${pageSize})`);
      const response = await this.client.get('/document/list', {
        params: { page, pageSize }
      });
      console.log('✅ Documents list response:', response.data);
      
      return {
        success: true,
        documents: response.data.result || [],
        totalCount: response.data.totalCount || 0
      };
    } catch (error) {
      console.error('❌ BoldSign listDocuments error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

export default new BoldSignService();
