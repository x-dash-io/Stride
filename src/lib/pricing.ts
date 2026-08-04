export const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE || '0.16')
export const FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || '10000')
export const STANDARD_SHIPPING = Number(process.env.NEXT_PUBLIC_STANDARD_SHIPPING || '500')
export const EXPRESS_SHIPPING = Number(process.env.NEXT_PUBLIC_EXPRESS_SHIPPING || '750')

// ---------------------------------------------------------------------------
// County-based shipping tiers for Kenya
// Tier 1 – Nairobi Metro         : base rate
// Tier 2 – Nearby counties       : +50%
// Tier 3 – Remote / North Kenya  : +100% (2× base)
// ---------------------------------------------------------------------------

/** Counties considered Nairobi Metro (same-day / next-day feasible). */
const TIER_1_COUNTIES = new Set([
  'nairobi',
  'kiambu',
  'machakos',
  'kajiado',
  'murang\'a',
])

/** Counties with moderate distance — elevated shipping cost. */
const TIER_2_COUNTIES = new Set([
  'mombasa',
  'kisumu',
  'nakuru',
  'eldoret',
  'uasin gishu',
  'nyeri',
  'meru',
  'kirinyaga',
  'nyandarua',
  'laikipia',
  'embu',
  'tharaka-nithi',
  'kitui',
  'makueni',
  'kilifi',
  'kwale',
  'taita-taveta',
  'busia',
  'kakamega',
  'vihiga',
  'bungoma',
  'trans nzoia',
  'west pokot',
  'nandi',
  'kericho',
  'bomet',
  'kisii',
  'nyamira',
  'siaya',
  'homa bay',
  'migori',
  'narok',
])

// All other counties default to Tier 3 (most expensive).

export type ShippingTier = 1 | 2 | 3

/**
 * Resolves which shipping tier a county belongs to.
 * The county string is normalised to lower-case before matching.
 */
export function getShippingTier(county?: string): ShippingTier {
  if (!county) return 2 // default to Tier 2 when county is unknown
  const normalised = county.trim().toLowerCase()
  if (TIER_1_COUNTIES.has(normalised)) return 1
  if (TIER_2_COUNTIES.has(normalised)) return 2
  return 3
}

/**
 * Returns the shipping cost for a given subtotal, method, and delivery county.
 *
 * - Orders above FREE_SHIPPING_THRESHOLD always ship free, regardless of tier.
 * - Tier 1 (Nairobi Metro): base standard / express rates.
 * - Tier 2 (Nearby counties): 1.5× multiplier.
 * - Tier 3 (Remote): 2× multiplier.
 */
export function calculateShipping(
  subtotal: number,
  method: 'standard' | 'express' = 'standard',
  county?: string
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0

  const baseRate = method === 'express' ? EXPRESS_SHIPPING : STANDARD_SHIPPING
  const tier = getShippingTier(county)

  const multipliers: Record<ShippingTier, number> = { 1: 1, 2: 1.5, 3: 2 }
  return Math.round(baseRate * multipliers[tier])
}

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE)
}

export function calculateGrandTotal(subtotal: number, shipping: number, tax: number): number {
  return subtotal + shipping + tax
}

export function calculateCartTotals(
  items: { unitPrice: number; quantity: number }[],
  method: 'standard' | 'express' = 'standard',
  county?: string
): {
  subtotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  itemCount: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const taxTotal = calculateTax(subtotal)
  const shippingTotal = calculateShipping(subtotal, method, county)
  const grandTotal = calculateGrandTotal(subtotal, shippingTotal, taxTotal)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return { subtotal, taxTotal, shippingTotal, grandTotal, itemCount }
}
