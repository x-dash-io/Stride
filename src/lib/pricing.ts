export const TAX_RATE = 0.16
export const FREE_SHIPPING_THRESHOLD = 10000
export const STANDARD_SHIPPING = 500
export const EXPRESS_SHIPPING = 750

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE)
}

export function calculateShipping(subtotal: number, method: 'standard' | 'express' = 'standard'): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0
  return method === 'express' ? EXPRESS_SHIPPING : STANDARD_SHIPPING
}

export function calculateGrandTotal(subtotal: number, shipping: number, tax: number): number {
  return subtotal + shipping + tax
}
