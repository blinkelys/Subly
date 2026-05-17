import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey || apiKey === 'your_resend_api_key_here') {
  console.warn('⚠️  RESEND_API_KEY not configured. Email features will be disabled.');
  console.warn('   Get your API key from: https://resend.com/api-keys');
  console.warn('   Then set RESEND_API_KEY in your .env file');
}

// Initialize Resend only if API key is available
const resend = apiKey && apiKey !== 'your_resend_api_key_here' ? new Resend(apiKey) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static from = 'Subly <onboarding@resend.dev>';

  static async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!resend) {
      console.warn('Email service disabled - skipping email send');
      return false;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: options.from || this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        console.error('Email send error:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  static generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static generateRecoveryToken(): string {
    return randomBytes(32).toString('hex');
  }

  static async sendVerificationEmail(email: string, username: string, code: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - Subly</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { display: inline-block; background: #667eea; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Subly!</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>
            <p>Thank you for registering with Subly! To complete your registration and start managing your subscriptions, please verify your email address.</p>

            <p>Enter this verification code in the app:</p>
            <div class="code">${code}</div>

            <p>This code will expire in 15 minutes for security reasons.</p>

            <p>If you didn't create an account with Subly, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Subly. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Subly',
      html,
    });
  }

  static async sendPasswordRecoveryEmail(email: string, username: string, token: string): Promise<boolean> {
    const recoveryUrl = `${process.env.HOST}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - Subly</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>
            <p>We received a request to reset your password for your Subly account. If you made this request, click the button below to reset your password.</p>

            <a href="${recoveryUrl}" class="button">Reset Password</a>

            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${recoveryUrl}">${recoveryUrl}</a></p>

            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </div>

            <p>For security reasons, we recommend choosing a strong password and enabling two-factor authentication when available.</p>
          </div>
          <div class="footer">
            <p>© 2026 Subly. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Subly',
      html,
    });
  }

  static async sendSubscriptionAlert(email: string, username: string, subscriptionName: string, alertType: 'ending' | 'renewal' | 'last_day', details?: any): Promise<boolean> {
    let subject = '';
    let alertMessage = '';
    let actionText = '';

    switch (alertType) {
      case 'ending':
        subject = `Subscription Ending Soon - ${subscriptionName}`;
        alertMessage = `Your subscription to ${subscriptionName} is ending on ${details.endDate}.`;
        actionText = 'Manage Subscription';
        break;
      case 'last_day':
        subject = `Final Day Alert - ${subscriptionName}`;
        alertMessage = `Today is the last day of your ${subscriptionName} subscription. It will end tomorrow.`;
        actionText = 'Take Action Now';
        break;
      case 'renewal':
        subject = `Subscription Renewed - ${subscriptionName}`;
        alertMessage = `Your subscription to ${subscriptionName} has been renewed and will continue.`;
        actionText = 'View Details';
        break;
    }

    const dashboardUrl = `${process.env.HOST}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject} - Subly</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .alert-box { background: #fff3cd; border-left: 4px solid #f39c12; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Subscription Alert</h1>
          </div>
          <div class="content">
            <h2>Hi ${username},</h2>

            <div class="alert-box">
              <strong>${alertMessage}</strong>
            </div>

            <p>Stay on top of your subscriptions with Subly's dashboard.</p>

            <a href="${dashboardUrl}" class="button">${actionText}</a>

            <p>You can manage all your subscriptions and set up additional alerts in your dashboard.</p>
          </div>
          <div class="footer">
            <p>© 2026 Subly. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}