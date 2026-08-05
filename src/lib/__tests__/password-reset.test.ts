import { describe, it, expect } from 'vitest'
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
  buildPasswordResetEmail,
} from '../password-reset'
import { forgotPasswordSchema, resetPasswordSchema } from '../validations'

describe('password reset tokens', () => {
  it('generates a 64-character hex token', () => {
    const token = generatePasswordResetToken()
    expect(token).toMatch(/^[a-f0-9]{64}$/)
  })

  it('generates unique tokens', () => {
    expect(generatePasswordResetToken()).not.toBe(generatePasswordResetToken())
  })

  it('hashes deterministically and never exposes the raw token', () => {
    const token = generatePasswordResetToken()
    const hash = hashPasswordResetToken(token)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).not.toBe(token)
    expect(hashPasswordResetToken(token)).toBe(hash)
    expect(hashPasswordResetToken('different')).not.toBe(hash)
  })

  it('builds a reset email containing the reset URL', () => {
    const html = buildPasswordResetEmail('https://example.com/auth/reset-password?token=abc')
    expect(html).toContain('https://example.com/auth/reset-password?token=abc')
    expect(html).toContain('Reset your Stride password')
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'test@example.com' }).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('accepts a valid token and strong password', () => {
    const result = resetPasswordSchema.safeParse({ token: 'abc123', password: 'Password123' })
    expect(result.success).toBe(true)
  })

  it('rejects a weak password', () => {
    expect(resetPasswordSchema.safeParse({ token: 'abc', password: 'password123' }).success).toBe(false)
    expect(resetPasswordSchema.safeParse({ token: 'abc', password: 'PASSWORD' }).success).toBe(false)
    expect(resetPasswordSchema.safeParse({ token: 'abc', password: 'short' }).success).toBe(false)
  })

  it('rejects a missing token', () => {
    expect(resetPasswordSchema.safeParse({ token: '', password: 'Password123' }).success).toBe(false)
  })
})
