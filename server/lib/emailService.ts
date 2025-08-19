import sgMail from '@sendgrid/mail';

// Initialize SendGrid only if API key is available and valid
let sendgridConfigured = false;

if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.') && !process.env.SENDGRID_API_KEY.includes('placeholder')) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sendgridConfigured = true;
  console.log('✅ SendGrid configured successfully');
} else if (process.env.SENDGRID_API_KEY) {
  console.warn('⚠️ SendGrid API key found but invalid format. Key should start with "SG." and not be a placeholder.');
} else {
  console.warn('⚠️ SendGrid API key not found. Email functionality will be disabled.');
}

export interface EmailTemplate {
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

export interface BookingConfirmationData {
  customerName: string;
  pnr: string;
  route: {
    from: string;
    to: string;
    departureDate: string;
  };
  passengers: Array<{
    title: string;
    firstName: string;
    lastName: string;
  }>;
  totalAmount: number;
  currency: string;
  bookingUrl: string;
}

export interface PaymentConfirmationData {
  customerName: string;
  pnr: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  bookingUrl: string;
}

export interface SupportTicketData {
  customerName: string;
  ticketId: string;
  subject: string;
  message: string;
  priority: string;
  supportUrl: string;
}

export class EmailService {
  private static readonly FROM_EMAIL = 'services@onboardticket.com';
  private static readonly FROM_NAME = 'OnboardTicket';

  /**
   * Check if SendGrid is configured
   */
  private static isSendGridConfigured(): boolean {
    return sendgridConfigured;
  }

  /**
   * Check if we're in demo mode (development with placeholder keys)
   */
  private static isDemoMode(): boolean {
    return process.env.NODE_ENV === 'development' &&
           (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.includes('placeholder'));
  }

  /**
   * Send a generic email
   */
  static async sendEmail(emailData: EmailTemplate): Promise<boolean> {
    // Demo mode - log email instead of sending
    if (this.isDemoMode()) {
      console.log('📧 [DEMO MODE] Email would be sent:', {
        to: emailData.to,
        from: emailData.from || this.FROM_EMAIL,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });
      console.log('📧 [DEMO MODE] To enable real emails, configure a valid SendGrid API key');
      return true; // Return true in demo mode to not break the flow
    }

    if (!this.isSendGridConfigured()) {
      console.warn('❌ SendGrid is not configured. Please set a valid SENDGRID_API_KEY environment variable.');
      return false;
    }

    try {
      const msg = {
        to: emailData.to,
        from: {
          email: emailData.from || this.FROM_EMAIL,
          name: this.FROM_NAME
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.dynamicTemplateData,
      };

      await sgMail.send(msg);
      console.log(`Email sent successfully to ${emailData.to}`);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(to: string, data: BookingConfirmationData): Promise<boolean> {
    const subject = `Booking Confirmation - ${data.pnr}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #505BFB; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .passenger-list { margin: 10px 0; }
          .passenger { padding: 5px 0; border-bottom: 1px solid #eee; }
          .cta-button { 
            display: inline-block; 
            background: #505BFB; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Thank you for choosing OnboardTicket!</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Your flight booking has been confirmed. Here are your booking details:</p>
            
            <div class="booking-details">
              <h3>Booking Reference: ${data.pnr}</h3>
              <p><strong>Route:</strong> ${data.route.from} → ${data.route.to}</p>
              <p><strong>Departure:</strong> ${new Date(data.route.departureDate).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ${data.currency} ${data.totalAmount}</p>
              
              <h4>Passengers:</h4>
              <div class="passenger-list">
                ${data.passengers.map(p => `
                  <div class="passenger">${p.title} ${p.firstName} ${p.lastName}</div>
                `).join('')}
              </div>
            </div>
            
            <p>Please complete your payment to confirm your booking.</p>
            
            <a href="${data.bookingUrl}" class="cta-button">View Booking Details</a>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The OnboardTicket Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 OnboardTicket. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(to: string, data: PaymentConfirmationData): Promise<boolean> {
    const subject = `Payment Confirmed - ${data.pnr}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .payment-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .success-icon { font-size: 48px; color: #28a745; text-align: center; margin: 20px 0; }
          .cta-button { 
            display: inline-block; 
            background: #28a745; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed!</h1>
            <p>Your booking is now confirmed</p>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Dear ${data.customerName},</p>
            <p>Great news! Your payment has been successfully processed and your booking is now confirmed.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <p><strong>Booking Reference:</strong> ${data.pnr}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Amount Paid:</strong> ${data.currency} ${data.amount}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Your e-ticket and boarding pass will be available in your account shortly.</p>
            
            <a href="${data.bookingUrl}" class="cta-button">View Your E-Ticket</a>
            
            <p>Have a great trip!</p>
            
            <p>Best regards,<br>The OnboardTicket Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 OnboardTicket. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Send support ticket confirmation email
   */
  static async sendSupportTicketConfirmation(to: string, data: SupportTicketData): Promise<boolean> {
    const subject = `Support Ticket Created - ${data.ticketId}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Support Ticket Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .ticket-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .priority-high { color: #dc3545; font-weight: bold; }
          .priority-medium { color: #ffc107; font-weight: bold; }
          .priority-low { color: #28a745; font-weight: bold; }
          .cta-button { 
            display: inline-block; 
            background: #17a2b8; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Support Ticket Created</h1>
            <p>We've received your request</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Thank you for contacting OnboardTicket support. We have received your request and created a support ticket for you.</p>
            
            <div class="ticket-details">
              <h3>Ticket Details</h3>
              <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Priority:</strong> <span class="priority-${data.priority.toLowerCase()}">${data.priority.toUpperCase()}</span></p>
              <p><strong>Created:</strong> ${new Date().toLocaleString()}</p>
              
              <h4>Your Message:</h4>
              <p style="background: #f8f9fa; padding: 10px; border-left: 3px solid #17a2b8;">${data.message}</p>
            </div>
            
            <p>Our support team will review your request and respond within 24 hours. You can track the status of your ticket using the link below.</p>
            
            <a href="${data.supportUrl}" class="cta-button">Track Your Ticket</a>
            
            <p>If you need immediate assistance, please call our 24/7 helpline.</p>
            
            <p>Best regards,<br>The OnboardTicket Support Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 OnboardTicket. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(to: string, resetToken: string, resetUrl: string): Promise<boolean> {
    const subject = 'Reset Your OnboardTicket Password';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #505BFB; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .reset-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: center; }
          .cta-button { 
            display: inline-block; 
            background: #505BFB; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
          }
          .token { 
            background: #f8f9fa; 
            padding: 10px; 
            border: 1px solid #dee2e6; 
            border-radius: 3px; 
            font-family: monospace; 
            font-size: 16px; 
            margin: 10px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your OnboardTicket account.</p>
            
            <div class="reset-box">
              <h3>Reset Your Password</h3>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="cta-button">Reset Password</a>
              
              <p>Or use this reset token:</p>
              <div class="token">${resetToken}</div>
            </div>
            
            <p class="warning">⚠️ This link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>For security reasons, if you continue to receive these emails, please contact our support team immediately.</p>
            
            <p>Best regards,<br>The OnboardTicket Security Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 OnboardTicket. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(to: string, customerName: string): Promise<boolean> {
    const subject = 'Welcome to OnboardTicket!';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to OnboardTicket</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #505BFB 0%, #424BC9 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .cta-button { 
            display: inline-block; 
            background: #505BFB; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
            font-weight: bold;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .icon { font-size: 24px; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to OnboardTicket!</h1>
            <p>Your journey to seamless flight booking starts here</p>
          </div>
          
          <div class="content">
            <p>Dear ${customerName},</p>
            <p>Thank you for joining OnboardTicket! We're excited to help you discover amazing destinations and book flights with ease.</p>
            
            <div class="feature-box">
              <h3><span class="icon">✈️</span>Easy Flight Search</h3>
              <p>Find the best flights from thousands of options worldwide with our intelligent search engine.</p>
            </div>
            
            <div class="feature-box">
              <h3><span class="icon">💳</span>Secure Payments</h3>
              <p>Pay safely with multiple payment options including cards, PayPal, and Stripe.</p>
            </div>
            
            <div class="feature-box">
              <h3><span class="icon">📱</span>Instant Confirmations</h3>
              <p>Get immediate booking confirmations and e-tickets delivered to your email.</p>
            </div>
            
            <div class="feature-box">
              <h3><span class="icon">🎧</span>24/7 Support</h3>
              <p>Our dedicated support team is always ready to assist you with any questions.</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'https://onboardticket.com'}" class="cta-button">Start Booking Flights</a>
            </p>
            
            <p>Ready to take off? Start exploring destinations and book your next adventure with OnboardTicket!</p>
            
            <p>Safe travels,<br>The OnboardTicket Team</p>
          </div>
          
          <div class="footer">
            <p>© 2024 OnboardTicket. All rights reserved.</p>
            <p>Follow us on social media for travel tips and exclusive offers!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }
}

export default EmailService;
