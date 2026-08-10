import nodemailer from 'nodemailer';

const gmailUser = process.env.GMAIL_USER || 'glitch.hackathon.official@gmail.com';
const gmailPass = process.env.GMAIL_APP_PASSWORD || '';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!gmailPass || gmailPass.includes('abcd')) {
    console.log(`[Email Mock Dispatch] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }
  try {
    const text = htmlToPlainText(html);
    const info = await transporter.sendMail({
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
    });
    console.log(`[Email Sent] MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`[Email Error] Failed to send to ${to}:`, error);
    return { success: false, error: error.message };
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

        <div style="text-align: center; margin-top: 25px;">
          <a href="${appUrl}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Register Your Team Now</a>
        </div>
        ${EMAIL_FOOTER}
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
  const subject = 'Registration Successful – GLITCH - 1.0';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Hello ${leaderName},</h2>
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
}: {
  leaderEmail: string;
  leaderName: string;
  teamName: string;
  teamId: string;
}) {
  const subject = `Registration Approved: Team ${teamId} – GLITCH - 1.0`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #059669; font-size: 22px; margin-top: 0;">Congratulations ${leaderName}!</h2>
        <p>We are excited to inform you that your registration for team <strong>"${teamName}"</strong> has been <strong>APPROVED</strong> for GLITCH - 1.0!</p>
        
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #047857; font-weight: 700;">Assigned Team ID</span>
          <h1 style="font-size: 36px; color: #065f46; margin: 5px 0 0 0; font-weight: 900;">${teamId}</h1>
        </div>

        <p>Please keep this Team ID handy for all event check-ins, problem statement selections, and queries.</p>
        
        <div style="text-align: center; margin-top: 25px;">
          <a href="${appUrl}/login" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Access Team Dashboard</a>
        </div>
        ${EMAIL_FOOTER}
      </div>
    </div>
  `;
  return sendEmail({ to: leaderEmail, subject, html });
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
  const subject = `Update Regarding Your Registration – GLITCH - 1.0`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #dc2626; font-size: 20px; margin-top: 0;">Registration Status Update</h2>
        <p>Dear ${leaderName},</p>
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
  const subject = `Problem Statement Selected: ${psNumber} – Team ${teamId} (GLITCH - 1.0)`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      ${EMAIL_HEADER}
      <div style="padding: 30px; color: #1f2937; line-height: 1.6;">
        <h2 style="color: #4f46e5; font-size: 20px; margin-top: 0;">Problem Statement Selection Confirmed</h2>
        <p>Hello ${leaderName},</p>
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
