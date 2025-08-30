
import { Configuration } from "@/api/entities";

class HelloSignAPI {
  constructor() {
    this.baseURL = "https://api.hellosign.com/v3";
    this.apiKey = null;
  }

  async getApiKey() {
    if (this.apiKey) return this.apiKey;
    
    try {
      const configs = await Configuration.filter({ key: "hellosign_api_key" });
      if (configs.length > 0 && configs[0].value) {
        this.apiKey = configs[0].value;
        return this.apiKey;
      }
    } catch (error) {
      console.error("Failed to get HelloSign API key:", error);
    }
    
    throw new Error("HelloSign API key not configured. Please add it in Settings.");
  }

  async makeRequest(endpoint, method = 'POST', formData = null) {
    const apiKey = await this.getApiKey();
    
    const headers = {
      'Authorization': `Basic ${btoa(apiKey + ':')}`
    };

    const config = {
      method,
      headers,
      mode: 'cors'
    };

    if (formData) {
      config.body = formData;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("HelloSign API error:", errorText);
        throw new Error(`HelloSign API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("HelloSign API request failed:", error);
      
      if (error.message === 'Failed to fetch') {
        throw new Error("Unable to connect to HelloSign API. Please check your internet connection.");
      }
      
      throw error;
    }
  }

  // Send signature request
  async sendSignatureRequest(signers, title, message = '', fileUrl = null, templateId = null) {
    try {
      const formData = new FormData();
      
      formData.append('title', title);
      if (message) {
        formData.append('message', message);
      }
      
      // Add signers
      signers.forEach((signer, index) => {
        formData.append(`signers[${index}][email_address]`, signer.email);
        formData.append(`signers[${index}][name]`, signer.name);
      });

      let endpoint;
      if (templateId) {
        // Use template
        endpoint = '/signature_request/send_with_template';
        formData.append('template_id', templateId);
      } else if (fileUrl) {
        // Upload file
        endpoint = '/signature_request/send';
        const fileResponse = await fetch(fileUrl);
        const fileBlob = await fileResponse.blob();
        formData.append('file[0]', fileBlob, 'document.pdf');
      } else {
        throw new Error("Either templateId or fileUrl must be provided");
      }

      const response = await this.makeRequest(endpoint, 'POST', formData);
      return response.signature_request;
    } catch (error) {
      console.error("Failed to send signature request:", error);
      throw error;
    }
  }

  // Get signature request status
  async getSignatureRequest(signatureRequestId) {
    try {
      return await this.makeRequest(`/signature_request/${signatureRequestId}`, 'GET');
    } catch (error) {
      console.error("Failed to get signature request:", error);
      throw error;
    }
  }

  // Create template from file
  async createTemplate(title, signers, fileUrl, description = '') {
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (description) {
        formData.append('message', description);
      }
      
      // Add signer roles
      signers.forEach((signer, index) => {
        formData.append(`signer_roles[${index}][name]`, signer.name || `Signer ${index + 1}`);
        formData.append(`signer_roles[${index}][order]`, index);
      });

      // Add file
      const fileResponse = await fetch(fileUrl);
      const fileBlob = await fileResponse.blob();
      formData.append('file[0]', fileBlob, 'template.pdf');

      const response = await this.makeRequest('/template/create_embedded_draft', 'POST', formData);
      return response.template;
    } catch (error) {
      console.error("Failed to create template:", error);
      throw error;
    }
  }

  // Verify account with API key
  async verifyAccount() {
    try {
      // This is a simple GET request to check authentication
      const response = await this.makeRequest('/account', 'GET');
      return response.account;
    } catch (error) {
      console.error("Failed to verify HelloSign account:", error);
      throw error;
    }
  }
}

export const helloSignAPI = new HelloSignAPI();
