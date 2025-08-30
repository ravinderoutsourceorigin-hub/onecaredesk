
import { Configuration } from '@/api/entities';
import { sendEmail as sendEmailFunction } from '@/api/functions'; // Import the new backend function

class ResendAPI {
  constructor() {
    this.apiKey = null;
    this.fromEmail = null;
    this.fromName = null;
  }

  async getApiKey() {
    try {
      console.log('🔍 ResendAPI: Fetching API key from database...');
      const configs = await Configuration.filter({ key: "resend_api_key" });
      console.log('📋 ResendAPI: API key config result:', configs.length > 0 ? 'FOUND' : 'NOT FOUND');
      const apiKey = configs.length > 0 ? configs[0].value : null;
      console.log('🔑 ResendAPI: API key status:', apiKey ? `EXISTS (${apiKey.substring(0, 8)}...)` : 'MISSING');
      return apiKey;
    } catch (error) {
      console.error("❌ ResendAPI: Failed to get Resend API key:", error);
      return null;
    }
  }

  async getFromEmail() {
    try {
      console.log('🔍 ResendAPI: Fetching from email from database...');
      const configs = await Configuration.filter({ key: "resend_from_email" });
      console.log('📋 ResendAPI: From email config result:', configs.length > 0 ? 'FOUND' : 'NOT FOUND');
      const fromEmail = configs.length > 0 ? configs[0].value : null;
      console.log('📧 ResendAPI: From email status:', fromEmail ? `EXISTS (${fromEmail})` : 'MISSING');
      return fromEmail;
    } catch (error) {
      console.error("❌ ResendAPI: Failed to get Resend from email:", error);
      return null;
    }
  }

  async getFromName() {
    try {
      console.log('🔍 ResendAPI: Fetching from name from database...');
      const configs = await Configuration.filter({ key: "resend_from_name" });
      const fromName = configs.length > 0 ? configs[0].value || "CareConnect" : "CareConnect";
      console.log('👤 ResendAPI: From name:', fromName);
      return fromName;
    } catch (error) {
      console.error("❌ ResendAPI: Failed to get Resend from name:", error);
      return "CareConnect";
    }
  }

  async isAuthenticated() {
    console.log('🔐 ResendAPI: Checking authentication status...');
    const apiKey = await this.getApiKey();
    const fromEmail = await this.getFromEmail();
    const isAuth = !!(apiKey && fromEmail);
    console.log('✅ ResendAPI: Authentication result:', isAuth ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
    if (!isAuth) {
      console.log('❌ ResendAPI: Missing config - API Key:', !!apiKey, 'From Email:', !!fromEmail);
    }
    return isAuth;
  }

  async testConnection() {
    console.log('🧪 ResendAPI: Testing connection...');
    const isAuthenticated = await this.isAuthenticated();
    if (isAuthenticated) {
        return { success: true, message: "Resend configuration is present." };
    }
    return { success: false, error: "Resend API Key or From Email is not configured." };
  }

  async sendEmail({ to, subject, htmlContent, textContent }) {
    console.log('📤 ResendAPI: Relaying email request to backend function...');
    
    // This now calls our secure backend function instead of fetch()
    try {
        const { data, error } = await sendEmailFunction({
            to,
            subject,
            htmlContent,
            textContent
        });

        if (error) {
            console.error("❌ ResendAPI: Backend function returned an error:", error);
            // The `error` object from the backend function might contain an `error` property
            // or we default to a generic message.
            throw new Error(error.error || error.message || "Failed to send email via backend.");
        }

        console.log("✅ ResendAPI: Backend function processed email successfully:", data);
        // The backend function is expected to return an object like:
        // { success: true, message: "Email sent successfully...", provider: "Resend", messageId: "..." }
        // We return it directly.
        return data; 
    } catch (e) {
        console.error('❌ ResendAPI: Error calling backend email function:', e);
        throw new Error(`Failed to send email via Resend: ${e.message}`);
    }
  }
}

export default new ResendAPI();
