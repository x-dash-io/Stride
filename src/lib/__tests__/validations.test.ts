import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, shippingAddressSchema } from '../validations'

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
  })

  it('rejects weak passwords without mixed case and digits', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short passwords', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Pass1',
      confirmPassword: 'Pass1',
    })
    expect(result.success).toBe(false)
  })
})

describe('shippingAddressSchema', () => {
  it('accepts valid address', () => {
    const result = shippingAddressSchema.safeParse({
      firstName: 'Test',
      lastName: 'User',
      phone: '254712345678',
      addressLine1: '123 Test Street',
      city: 'Nairobi',
      state: 'Nairobi',
      postalCode: '00100',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing required fields', () => {
    const result = shippingAddressSchema.safeParse({
      firstName: 'Test',
    })
    expect(result.success).toBe(false)
  })
})
