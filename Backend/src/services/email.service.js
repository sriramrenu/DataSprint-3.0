import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.client = SibApiV3Sdk.ApiClient.instance;
        this.client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    }

    /**
     * Send a transactional email using Brevo
     * @param {Object} options - Email options
     * @param {string} options.to - Recipient email address
     * @param {string} options.subject - Email subject
     * @param {string} options.textContent - Plain text content
     * @param {string} [options.htmlContent] - HTML content (optional)
     * @returns {Promise} - Resolves when email is sent
     */
    async sendEmail({ to, subject, textContent, htmlContent }) {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = { email: "r.sriramrenu@gmail.com", name: "DATASPRINT" };
        sendSmtpEmail.to = [{ email: to }];
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.textContent = textContent;

        if (htmlContent) {
            sendSmtpEmail.htmlContent = htmlContent;
        }

        try {
            const data = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log('✅ Email sent successfully:', data.messageId);
            return data;
        } catch (error) {
            console.error('❌ Error sending email:', error);
            throw error;
        }
    }
}

const emailService = new EmailService();
export default emailService;
