import { Configuration } from '@/api/entities';

class SendGridAPI {
  constructor() {
    this.apiKey = null;
    this.fromEmail = null;
    this.fromName = null;
  }

  async getApiKey() {
    const configs = await Configuration.filter({ key: "sendgrid_api_key" });
    return configs.length > 0 ? configs[0].value : null;
  }

  async getFromEmail() {
    const configs = await Configuration.filter({ key: "sendgrid_from_email" });
    return configs.length > 0 ? configs[0].value : null;
  }

  async getFromName() {
    const configs = await Configuration.filter({ key: "sendgrid_from_name" });
    return configs.length > 0 ? configs[0].value || "CareConnect" : "CareConnect";
  }

  async isAuthenticated() {
    const apiKey = await this.getApiKey();
    const fromEmail = await this.getFromEmail();
    return !!(apiKey && fromEmail);
  }

  async testConnection() {
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
        return { success: false, error: "SendGrid API Key or From Email not configured in Settings." };
    }
    return { 
      success: false, 
      error: "SendGrid requires backend functions with external HTTP access. Currently not available in this environment." 
    };
  }

  async sendEmail({ to, subject, htmlContent, textContent }) {
    throw new Error('SendGrid integration is not available: External HTTP requests are blocked in this environment.');
  }
}

// Create and export a single instance
export default new SendGridAPI();