import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { NextRequest } from 'next/server'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | string, currency = 'KES'): string {
  const num = typeof amount === 'string' ? Number(amount) : amount
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.slice(1)
  if (!cleaned.startsWith('254')) cleaned = '254' + cleaned
  return cleaned
}

export function generateOrderNumber(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded && process.env.NODE_ENV === 'production') {
    const ips = forwarded.split(',').map(ip => ip.trim())
    return ips[ips.length - 1] || 'unknown'
  }
  return request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown'
}

/**
 * Sanitizes input to prevent SQL injection and remove emojis
 * - Strips SQL injection characters and keywords
 * - Removes emojis and non-printable unicode
 * - Trims whitespace
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  let sanitized = input
  
  // Remove emojis and other non-ASCII printable characters (keep basic Latin, numbers, punctuation)
  sanitized = sanitized.replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
  
  // Remove SQL injection patterns (case insensitive)
  const sqlPatterns = [
    /('|(\\'))/g,  // single quotes
    /(--)/g,       // SQL comments
    /(\/\*|\*\/)/g, // block comments
    /(;)/g,        // statement terminator
    /\b(union|select|insert|update|del\w+|drop|alter|create|exec|execute|xp_|sp_)\b/gi, // SQL keywords
    /\b(or|and)\b\s+\d+\s*=\s*\d+/gi, // tautology patterns like 1=1
  ]
  
  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized.trim()
}

/**
 * Sanitizes email input - allows only valid email characters
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return ''
  // Only allow alphanumeric, @, ., _, -, +
  return input.replace(/[^a-zA-Z0-9@._+-]/g, '').trim().toLowerCase()
}

/**
 * Sanitizes name input - allows letters, spaces, hyphens, apostrophes
 */
export function sanitizeName(input: string): string {
  if (typeof input !== 'string') return ''
  // Remove emojis and special characters, keep letters, spaces, hyphens, apostrophes
  let sanitized = input.replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
  sanitized = sanitized.replace(/[^a-zA-Z\s'-]/g, '')
  return sanitized.trim()
}

/**
 * Sanitizes phone number - only digits, +, spaces, dashes, parentheses
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^\d+\s\-()]/g, '').trim()
}

/**
 * Sanitizes address/text fields - allows alphanumeric, spaces, common punctuation
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return ''
  let sanitized = input.replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
  // Remove SQL injection patterns
  const sqlPatterns = [
    /('|(\\'))/g,
    /(--)/g,
    /(\/\*|\*\/)/g,
    /(;)/g,
    /\b(union|select|insert|update|delete|drop|alter|create|exec|execute|xp_|sp_)\b/gi,
    /\b(or|and)\b\s+\d+\s*=\s*\d+/gi,
  ]
  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }
  // Keep alphanumeric, spaces, and common punctuation
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,!?@#$%&*()_\-+=/\\:;'"{}[\]|<>]/g, '')
  return sanitized.trim()
}