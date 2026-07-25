import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

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