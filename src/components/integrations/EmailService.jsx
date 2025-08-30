import resendAPI from './ResendAPI';

class EmailService {
  async send({ to, subject, htmlContent, textContent }) {
    console.log('📧 EmailService: Starting email send process...');
    console.log('📧 EmailService: Recipient:', to);
    console.log('📧 EmailService: Subject:', subject);

    try {
      console.log('🔍 EmailService: Checking if Resend is configured...');
      if (await resendAPI.isAuthenticated()) {
        console.log('✅ EmailService: Resend is configured, using Resend API');
        return await resendAPI.sendEmail({ to, subject, htmlContent, textContent });
      } else {
        console.log('❌ EmailService: Resend is not configured');
        throw new Error('Email service not configured. Please configure Resend in Settings to enable email functionality.');
      }
    } catch (error) {
      console.error('❌ EmailService: Error during send:', error);
      throw error;
    }
  }

  async isConfigured() {
    const result = await resendAPI.isAuthenticated();
    console.log('🔍 EmailService: Configuration check result:', result);
    return result;
  }

  getActiveProvider() {
    return 'resend';
  }
}

export default new EmailService();