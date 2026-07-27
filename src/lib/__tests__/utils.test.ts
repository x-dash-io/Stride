import { describe, it, expect } from 'vitest'
import { cn, formatPrice, formatPhoneNumber } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('merges tailwind classes', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })
})

describe('formatPrice', () => {
  it('formats number as KES', () => {
    const result = formatPrice(1500)
    expect(result).toContain('1,500')
  })

  it('handles string input', () => {
    const result = formatPrice('2500')
    expect(result).toContain('2,500')
  })

  it('formats zero', () => {
    const result = formatPrice(0)
    expect(result).toContain('0')
  })
})

describe('formatPhoneNumber', () => {
  it('formats 0-prefixed number', () => {
    expect(formatPhoneNumber('0712345678')).toBe('254712345678')
  })

  it('formats number already with 254', () => {
    expect(formatPhoneNumber('254712345678')).toBe('254712345678')
  })

  it('handles international format', () => {
    expect(formatPhoneNumber('+254712345678')).toBe('254712345678')
  })
})
