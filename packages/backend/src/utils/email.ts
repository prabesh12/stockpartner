import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (email: string, token: string, shopName: string) => {
  const verifyLink = `${getFrontendUrl()}/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'StockSathi <onboarding@resend.dev>', // Update this after domain verification
    to: email,
    subject: `Verify your shop: ${shopName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">Welcome to StockSathi!</h1>
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">
          Thank you for registering <strong>${shopName}</strong>. 
          To complete your setup and start managing your inventory, please verify your email address by clicking the button below:
        </p>
        <div style="margin: 32px 0;">
          <a href="${verifyLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          If the button doesn't work, copy and paste this link into your browser: <br/>
          <a href="${verifyLink}" style="color: #2563eb;">${verifyLink}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${getFrontendUrl()}/reset-password?token=${token}`;

  await resend.emails.send({
    from: 'StockSathi <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your StockSathi password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">Reset Password</h1>
        <p style="font-size: 16px; color: #374151; line-height: 1.5;">
          We received a request to reset your password. Click the button below to set a new password:
        </p>
        <div style="margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">
          The StockSathi Team
        </p>
      </div>
    `,
  });
};
