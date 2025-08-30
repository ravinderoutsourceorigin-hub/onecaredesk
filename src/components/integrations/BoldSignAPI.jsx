import { boldSignAPI as backendFunction } from '@/api/functions';

class BoldSignAPI {
  constructor() {
    // All API calls now go through the secure backend function
  }

  async testConnection() {
    try {
      const { data, status } = await backendFunction({ action: 'testConnection' });
      
      if (status === 200 && data.success) {
        return {
          success: true,
          message: data.message,
          templateCount: data.templateCount
        };
      } else {
        return {
          success: false,
          error: data.error || 'Connection test failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error.message}`
      };
    }
  }

  async isAuthenticated() {
    const result = await this.testConnection();
    return result.success;
  }

  async getTemplates() {
    try {
      console.log('🔍 Fetching BoldSign templates via backend function...');
      
      const { data, status } = await backendFunction({ action: 'getTemplates' });
      
      if (status === 200 && data.success) {
        console.log(`✅ Found ${data.templates.length} real BoldSign templates.`);
        return {
          success: true,
          templates: data.templates,
          totalCount: data.totalCount
        };
      } else {
        console.warn('Failed to load BoldSign templates:', data.error);
        return {
          success: false,
          error: data.error || 'Failed to fetch templates',
          templates: []
        };
      }
    } catch (error) {
      console.error('❌ BoldSign getTemplates failed:', error);
      return {
        success: false,
        error: `Failed to get templates: ${error.message}`,
        templates: []
      };
    }
  }

  async getTemplateDetails(templateId) {
    try {
      console.log(`🔍 Fetching details for BoldSign template: ${templateId}`);
      
      const { data, status } = await backendFunction({ 
        action: 'getTemplateDetails', 
        templateId 
      });
      
      if (status === 200 && data.success) {
        console.log(`✅ Found roles for template ${templateId}:`, data.roles);
        return {
          success: true,
          roles: data.roles
        };
      } else {
        throw new Error(data.error || 'Failed to get template details');
      }
    } catch (error) {
      console.error(`❌ BoldSign getTemplateDetails failed for template ${templateId}:`, error);
      throw new Error(`Failed to get details for template: ${error.message}`);
    }
  }

  async sendSignatureRequest(templateId, recipients, title, message = null) {
    try {
      console.log('🚀 BoldSign: Sending signature request via backend function...');
      
      // First get template roles
      const templateDetails = await this.getTemplateDetails(templateId);
      
      const { data, status } = await backendFunction({
        action: 'sendSignatureRequest',
        templateId,
        recipients,
        title,
        message,
        templateRoles: templateDetails.roles
      });
      
      if (status === 200 && data.success) {
        console.log('✅ BoldSign request sent successfully:', data);
        return {
          success: true,
          documentId: data.documentId,
          message: data.message,
          status: data.status
        };
      } else {
        throw new Error(data.error || 'Failed to send signature request');
      }
    } catch (error) {
      console.error('❌ BoldSign send signature request failed:', error);
      throw new Error(`Failed to send signature request: ${error.message}`);
    }
  }
}

// Create and export a singleton instance
const boldSignAPI = new BoldSignAPI();
export { boldSignAPI };
export default boldSignAPI;