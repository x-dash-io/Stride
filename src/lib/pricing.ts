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

export function calculateCartTotals(items: { unitPrice: number; quantity: number }[]): {
  subtotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  itemCount: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const taxTotal = calculateTax(subtotal)
  const shippingTotal = calculateShipping(subtotal)
  const grandTotal = calculateGrandTotal(subtotal, shippingTotal, taxTotal)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { subtotal, taxTotal, shippingTotal, grandTotal, itemCount }
}
