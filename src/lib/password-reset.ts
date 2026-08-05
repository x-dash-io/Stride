import { createHash, randomBytes } from 'node:crypto'

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashPasswordResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function buildPasswordResetEmail(resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="margin-bottom: 16px;">Reset your Stride password</h2>
      <p style="line-height: 1.6;">We received a request to reset the password for your Stride account. Click the button below to choose a new password. This link expires in 30 minutes.</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
      </p>
      <p style="line-height: 1.6; color: #555555;">If you did not request this, you can safely ignore this email — your password will not be changed.</p>
      <p style="color: #777777; font-size: 12px; margin-top: 24px;">If the button does not work, copy and paste this link into your browser: ${resetUrl}</p>
    </div>
  `
}
