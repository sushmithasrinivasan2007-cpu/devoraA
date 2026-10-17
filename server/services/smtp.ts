/**
 * Server-side SMTP Email Gateway Service
 * Handles official SMTP email dispatch via Nodemailer with graceful fallback and audit logging.
 */

import nodemailer, { type Transporter } from 'nodemailer';

export interface EmailDispatchResult {
  status: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED';
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  trigger_event: string;
  message: string;
  html?: string;
  simulated: boolean;
  delivery_time: string;
  response_details?: any;
}

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass || user.includes('your_email') || pass.includes('your_app_password')) {
    return null;
  }

  if (host === 'smtp.gmail.com' || host.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Verify SMTP connection status
 */
export async function verifySMTPConnection(): Promise<{ configured: boolean; connected: boolean; message: string }> {
  const client = getTransporter();
  if (!client) {
    return {
      configured: false,
      connected: false,
      message: 'SMTP credentials not configured in environment (.env). Running in simulated email dispatch mode.'
    };
  }

  try {
    await client.verify();
    return {
      configured: true,
      connected: true,
      message: `SMTP Connected successfully to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: `SMTP Connection failed: ${err.message}`
    };
  }
}

/**
 * Dispatches an email via SMTP or records simulated dispatch in development/demo mode
 */
export async function dispatchEmail(
  recipientEmail: string,
  subject: string,
  content: string,
  options: {
    recipientName?: string;
    triggerEvent?: string;
    htmlContent?: string;
  } = {}
): Promise<EmailDispatchResult> {
  const fromName = process.env.SMTP_FROM_NAME?.trim() || 'Devora AI Campus Operations';
  const userEmail = process.env.SMTP_USER?.trim() || '';
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || userEmail;
  const triggerEvent = options.triggerEvent || 'General Campus Notification';
  const recipientName = options.recipientName || '';
  const now = new Date().toISOString();

  const formattedHtml = options.htmlContent || `
    <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #FFF8EC; border: 1px solid #E8DDCA; border-radius: 12px; color: #2B2020;">
      <div style="border-bottom: 2px solid #6B1E2B; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #6B1E2B; margin: 0; font-size: 20px; font-weight: 700;">DEVORA AI — Campus Operations</h2>
        <span style="font-size: 12px; color: #756565; text-transform: uppercase; letter-spacing: 1px;">${triggerEvent}</span>
      </div>
      <div style="background-color: #FFFFFF; padding: 20px; border-radius: 8px; border: 1px solid rgba(107,30,43,0.1); margin-bottom: 20px;">
        ${recipientName ? `<p style="font-size: 15px; line-height: 1.6; color: #2B2020; margin: 0 0 12px 0;">Hello <strong>${recipientName}</strong>,</p>` : ''}
        <p style="font-size: 14px; line-height: 1.6; color: #3D2D2D; margin: 0;">${content}</p>
      </div>
      <div style="text-align: center; font-size: 12px; color: #756565; border-top: 1px solid #E8DDCA; padding-top: 16px;">
        <p style="margin: 0;">Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;

  const client = getTransporter();

  // If no SMTP configured, log simulated dispatch
  if (!client) {
    console.log(`[SMTP SIMULATED] To: ${recipientEmail} | Subject: "${subject}" | Event: ${triggerEvent}`);
    return {
      status: 'SIMULATED',
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      trigger_event: triggerEvent,
      message: content,
      html: formattedHtml,
      simulated: true,
      delivery_time: now,
      response_details: {
        note: 'SMTP credentials not configured in environment. Event recorded in local simulation mode.'
      }
    };
  }

  try {
    const info = await client.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: recipientName ? `"${recipientName}" <${recipientEmail}>` : recipientEmail,
      replyTo: fromEmail,
      subject: subject,
      text: content,
      html: formattedHtml,
      headers: {
        'X-Mailer': 'Devora Campus Mailer',
        'X-Priority': '3'
      }
    });

    const isAccepted = Array.isArray(info.accepted) && info.accepted.length > 0;
    const isRejected = Array.isArray(info.rejected) && info.rejected.length > 0;

    if (!isAccepted || isRejected) {
      console.warn(`[SMTP REJECTED] Recipient rejected: ${recipientEmail}`, info.rejected);
      return {
        status: 'FAILED',
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        subject,
        trigger_event: triggerEvent,
        message: content,
        html: formattedHtml,
        simulated: false,
        delivery_time: now,
        response_details: {
          accepted: info.accepted,
          rejected: info.rejected,
          response: info.response,
          error: 'Recipient address was rejected by the mail server.'
        }
      };
    }

    console.log(`[SMTP DELIVERED] To ${recipientEmail} (MessageId: ${info.messageId}, Response: ${info.response})`);
    return {
      status: 'DELIVERED',
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      trigger_event: triggerEvent,
      message: content,
      html: formattedHtml,
      simulated: false,
      delivery_time: now,
      response_details: {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted
      }
    };
  } catch (err: any) {
    console.error(`[SMTP DISPATCH FAILED] Error sending to ${recipientEmail}: ${err.message}`);
    return {
      status: 'FAILED',
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      subject,
      trigger_event: triggerEvent,
      message: content,
      html: formattedHtml,
      simulated: false,
      delivery_time: now,
      response_details: {
        error: err.message,
        note: `Mail delivery failed: ${err.message}`
      }
    };
  }
}
