import nodemailer from 'nodemailer';
import dns from 'dns';

// Prefer IPv4 to avoid ENETUNREACH issues on networks without IPv6 SMTP routing
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore if not supported in environment
}

const gmailUser = process.env.GMAIL_USER || 'glitch.hackathon.official@gmail.com';
const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
const resendApiKey = process.env.RESEND_API_KEY || '';
const getAppUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (envUrl && envUrl.trim().length > 0) {
    let formatted = envUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    return formatted.replace(/\/$/, '');
  }
  return 'https://glitchmsc.vercel.app';
};

const appUrl = getAppUrl();

const createGmailTransporter = (port: number, secure: boolean) =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port,
    secure,
    family: 4, // Force IPv4 routing for mobile carrier compatibility
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  } as any);

const transporter465 = createGmailTransporter(465, true);
const transporter587 = createGmailTransporter(587, false);

const EMAIL_HEADER = `
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; tracking-wide: 1px;">GLITCH - 1.0</h1>
    <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px; font-weight: 500;">24hrs National Level Hackathon</p>
  </div>
`;

const EMAIL_FOOTER = `
  <div style="margin-top: 25px; background: #eef2ff; border: 1.5px dashed #6366f1; border-radius: 10px; padding: 16px; text-align: center;">
    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #312e81;">
      📞 For any query, contact: <a href="tel:9342992454" style="color: #4f46e5; font-weight: 800; text-decoration: none; background: #ffffff; padding: 4px 10px; border-radius: 6px; border: 1px solid #c7d2fe; display: inline-block; margin-left: 4px;">9342992454</a>
    </p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #4338ca;">
      Support Email: <a href="mailto:${gmailUser}" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">${gmailUser}</a>
    </p>
  </div>
  <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
    <p style="margin: 4px 0;">© 2026 GLITCH - 1.0 Organizing Committee. All rights reserved.</p>
  </div>
`;

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

async function sendViaResend({ to, subject, html }: { to: string; subject: string; html: string }) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `GLITCH 1.0 <${fromEmail}>`,
      to: [to],
      subject,
      html,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return { success: true, messageId: data.id };
}

import { dataService } from '@/lib/dataService';

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Option 1: Try Resend API over HTTPS if RESEND_API_KEY is configured
  if (resendApiKey) {
    try {
      console.log(`[Resend Dispatch] To: ${to} | Subject: ${subject}`);
      const resendRes = await sendViaResend({ to, subject, html });
      await dataService.createEmailLog({ recipient: to, subject, status: 'SENT' }).catch(() => { });
      return resendRes;
    } catch (err: any) {
      console.warn(`[Resend Warning] Resend API failed for ${to}: ${err.message}. Falling back to Gmail SMTP...`);
    }
  }

  // Option 2: Fallback to mock mode if password missing or test value
  if (!gmailPass || gmailPass.includes('abcd')) {
    console.log(`[Email Mock Dispatch] To: ${to} | Subject: ${subject}`);
    await dataService.createEmailLog({ recipient: to, subject, status: 'SENT (MOCK)' }).catch(() => { });
    return { success: true, mock: true };
  }

  // Option 3: Nodemailer SMTP with automatic Port 465 (SSL) -> Port 587 (STARTTLS) fallback
  const text = htmlToPlainText(html);
  const mailOptions = {
    from: `"GLITCH 1.0 Team" <${gmailUser}>`,
    replyTo: `"GLITCH 1.0 Support" <${gmailUser}>`,
    to,
    subject,
    text,
    html,
    headers: {
      'X-Mailer': 'GLITCH-Hackathon-Mailer/1.0',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
    },
  };

  try {
    const info = await transporter465.sendMail(mailOptions);
    console.log(`[Email Sent Port 465] MessageId: ${info.messageId} to ${to}`);
    await dataService.createEmailLog({ recipient: to, subject, status: 'SENT' }).catch(() => { });
    return { success: true, messageId: info.messageId };
  } catch (error465: any) {
    console.warn(`[SMTP 465 Failed] ${error465.message}. Retrying via Port 587 STARTTLS...`);
    try {
      const info587 = await transporter587.sendMail(mailOptions);
      console.log(`[Email Sent Port 587] MessageId: ${info587.messageId} to ${to}`);
      await dataService.createEmailLog({ recipient: to, subject, status: 'SENT' }).catch(() => { });
      return { success: true, messageId: info587.messageId };
    } catch (error587: any) {
      const errorMsg = error587.message || 'Email delivery failed';
      console.error(`[Email Error] Failed to send via Port 465 and Port 587 to ${to}:`, errorMsg);
      await dataService.createEmailLog({ recipient: to, subject, status: 'FAILED', error: errorMsg }).catch(() => { });
      return { success: false, error: errorMsg };
    }
  }
}

export async function sendWelcomeSignupEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const subject = 'Welcome to GLITCH - 1.0 Hackathon Portal';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #111827; font-size: 22px; margin-top: 0;">Welcome ${name}!</h2>
        <p>Thank you for creating your Team Leader account for <strong>GLITCH - 1.0</strong>, A 24hrs National Level Hackathon.</p>
        <p>Your account has been registered successfully. You can now log into your portal to register your team, submit payment details, and select your Problem Statement when windows open.</p>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600; color: #374151;">Account Info:</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">Registered Email: <strong>${email}</strong></p>
        </div>
        ${ EMAIL_FOOTER }
  </div>
    </div>
      `;
  return sendEmail({ to: email, subject, html });
}

export async function sendRegistrationSubmittedEmail({
  leaderEmail,
  leaderName,
  teamName,
}: {
  leaderEmail: string;
  leaderName: string;
  teamName: string;
}) {
  const subject = `Registration Successful – Team "${teamName}" – GLITCH - 1.0`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Hello ${leaderName} & Team "${teamName}",</h2>
        <p>Thank you for registering team <strong>"${teamName}"</strong> for <strong>GLITCH - 1.0</strong>, A 24hrs National Level Hackathon.</p>
        <p>Your registration has been submitted successfully and your application is currently <strong>under admin review</strong>.</p>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 600; color: #374151;">Status: Pending Approval</p>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #6b7280;">Our admin team is verifying your payment screenshot and transaction UTR details. You will receive a confirmation email once verified.</p>
        </div>
        
        <p>You can check your status anytime by logging into your account dashboard.</p>
        <div style="text-align: center; margin-top: 25px;">
          <a href="${appUrl}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Go to Leader Dashboard</a>
        </div>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `;
  return sendEmail({ to: leaderEmail, subject, html });
}

export async function sendApprovalEmail({
  leaderEmail,
  leaderName,
  teamName,
  teamId,
  qrCodeUrl,
  barcodeUrl,
  members,
}: {
  leaderEmail: string;
  leaderName: string;
  teamName: string;
  teamId: string;
  qrCodeUrl?: string | null;
  barcodeUrl?: string | null;
  members?: Array<{ name: string; email: string; phone: string; college: string; department: string }>;
}) {
  const subject = `Registration Approved: Team "${teamName}" (${teamId}) – GLITCH - 1.0 Pass & QR Code`;
  
  const membersHtml = members && members.length > 0
    ? `
    <div style="margin: 20px 0; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
      <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Registered Team Members (${members.length})</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid #d1d5db; color: #4b5563;">
            <th style="padding: 6px 0;">Name</th>
            <th style="padding: 6px 0;">Department</th>
          </tr>
        </thead>
        <tbody>
          ${members.map((m) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 6px 0; font-weight: 600; color: #111827;">${m.name}</td>
              <td style="padding: 6px 0; color: #6b7280;">${m.department || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    `
    : '';

  const qrSectionHtml = (qrCodeUrl || barcodeUrl)
    ? `
    <div style="background-color: #ffffff; border: 2px dashed #4f46e5; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
      <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #4338ca; font-weight: 800; display: block; margin-bottom: 10px;">Official Team Scanning Pass</span>
      
      ${qrCodeUrl ? `<img src="${qrCodeUrl}" alt="Team QR Code" style="width: 180px; height: 180px; margin: 0 auto; display: block; border-radius: 8px; border: 1px solid #e2e8f0; padding: 5px; background: #ffffff;" />` : ''}
      ${barcodeUrl ? `<img src="${barcodeUrl}" alt="Team Barcode" style="width: 260px; height: auto; margin: 15px auto 0 auto; display: block;" />` : ''}

      <p style="margin: 12px 0 0 0; font-weight: 800; font-size: 18px; color: #1e1b4b; letter-spacing: 1px;">Team ID: ${teamId}</p>
      <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #4338ca;">Team Name: ${teamName}</p>
    </div>
    `
    : '';

  const instructionsHtml = `
    <div style="background-color: #eef2ff; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #3730a3; line-height: 1.5;">
      <p style="margin: 0; font-weight: 700;">📌 Attendance Scanning Instructions:</p>
      <ul style="margin: 6px 0 0 0; padding-left: 18px;">
        <li>Present this QR Code / Barcode (on your phone screen or printed copy) at the registration counter.</li>
        <li>Your team pass will be scanned for <strong>Venue Check-In</strong>, <strong>Breakfast</strong>, <strong>Lunch</strong>, <strong>Refreshments</strong>, and <strong>Check-Out</strong>.</li>
        <li>Attendance is tracked individually per member at the scanning gate. Ensure all present members are with the team during scan.</li>
      </ul>
    </div>
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 22px; margin-top: 0;">Congratulations Team "${teamName}"!</h2>
        <p>Hello <strong>${leaderName}</strong> & Team Members,</p>
        <p>We are excited to inform you that your registration for team <strong>"${teamName}"</strong> has been <strong>APPROVED</strong> for <strong>GLITCH - 1.0</strong>!</p>

        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 18px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #047857; font-weight: 700;">Assigned Team ID</span>
          <h1 style="font-size: 36px; color: #065f46; margin: 5px 0 0 0; font-weight: 900;">${teamId}</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #047857;">Team: ${teamName}</p>
        </div>

        ${qrSectionHtml}
        ${membersHtml}
        ${instructionsHtml}

        <div style="text-align: center; margin-top: 25px;">
          <a href="${appUrl}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Access Team Dashboard</a>
        </div>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `;

  // Build unique recipient list for leader and all team members
  const memberEmails = (members || []).map((m) => m.email?.trim()).filter((e) => e && e.includes('@'));
  const allRecipients = Array.from(new Set([leaderEmail.trim(), ...memberEmails]));

  // Send to all team recipients
  const results = await Promise.all(
    allRecipients.map((recipient) => sendEmail({ to: recipient, subject, html }))
  );

  const primaryResult = results[0] || { success: true };
  return primaryResult;
}

export async function sendRejectionEmail({
  leaderEmail,
  leaderName,
  teamName,
  rejectionReason,
}: {
  leaderEmail: string;
  leaderName: string;
  teamName: string;
  rejectionReason: string;
}) {
  const subject = `Update Regarding Registration – Team "${teamName}" (GLITCH - 1.0)`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #dc2626; font-size: 20px; margin-top: 0;">Registration Status Update</h2>
        <p>Dear ${leaderName} & Team <strong>"${teamName}"</strong>,</p>
        <p>We regret to inform you that your registration for team <strong>"${teamName}"</strong> could not be approved at this time.</p>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: 700; color: #991b1b;">Reason for Rejection:</p>
          <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">${rejectionReason}</p>
        </div>

        <p>If you believe this was an error or would like to re-submit valid payment details, please reach out to our support team.</p>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `;
  return sendEmail({ to: leaderEmail, subject, html });
}

export async function sendPasswordResetEmail({
  email,
  resetToken,
}: {
  email: string;
  resetToken: string;
}) {
  const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
  const subject = `Password Reset Request – GLITCH - 1.0`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Reset Your Password</h2>
        <p>We received a request to reset your password for GLITCH - 1.0 hackathon portal.</p>
        <p>Click the button below to choose a new password. This link is valid for 1 hour.</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">If you did not request a password reset, you can safely ignore this email.</p>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendPsSelectionEmail({
  leaderEmail,
  leaderName,
  teamName,
  teamId,
  psNumber,
  psTitle,
  driveLink,
}: {
  leaderEmail: string;
  leaderName: string;
  teamName: string;
  teamId: string;
  psNumber: string;
  psTitle: string;
  driveLink: string;
}) {
  const subject = `Problem Statement Selected: ${psNumber} – Team "${teamName}" (${teamId}) (GLITCH - 1.0)`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #4f46e5; font-size: 20px; margin-top: 0;">Problem Statement Selection Confirmed</h2>
        <p>Hello ${leaderName} & Team <strong>"${teamName}"</strong>,</p>
        <p>Team <strong>"${teamName}"</strong> (ID: <strong>${teamId}</strong>) has successfully selected your Problem Statement for GLITCH - 1.0.</p>
        
        <div style="background-color: #e0e7ff; border: 1px solid #c7d2fe; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 12px; font-weight: 700; color: #3730a3; text-transform: uppercase;">Selected PS Number</p>
          <h3 style="margin: 4px 0 8px 0; color: #1e1b4b; font-size: 18px;">${psNumber}: ${psTitle}</h3>
          <a href="${driveLink}" target="_blank" style="color: #4338ca; font-weight: 600; text-decoration: underline; word-break: break-all;">Open Problem Statement Drive Resource</a>
        </div>

        <p style="font-size: 13px; color: #4b5563;">Note: As per GLITCH - 1.0 rules, your Problem Statement choice is permanently locked and cannot be edited or changed.</p>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `;
  return sendEmail({ to: leaderEmail, subject, html });
}
