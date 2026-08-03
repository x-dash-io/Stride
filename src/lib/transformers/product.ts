export function toDecimal(value: unknown): number | null {
  if (value == null) return null
  return Number(value)
}

export function mapProductVariant(variant: {
  basePrice: unknown
  salePrice: unknown
  weightKg: unknown
  inventory?: { quantityOnHand: number }[]
  images?: unknown[]
} & Record<string, unknown>) {
  return {
    ...variant,
    basePrice: toDecimal(variant.basePrice),
    salePrice: toDecimal(variant.salePrice),
    weightKg: toDecimal(variant.weightKg),
    availableStock: variant.inventory
      ? (variant.inventory as { quantityOnHand: number }[]).reduce((sum, inv) => sum + inv.quantityOnHand, 0)
      : 0,
  }
}

export function mapProduct(product: {
  basePrice: unknown
  salePrice: unknown
  costPrice: unknown
  weightKg: unknown
  variants?: unknown[]
  images?: unknown[]
} & Record<string, unknown>) {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    salePrice: toDecimal(product.salePrice),
    costPrice: toDecimal(product.costPrice),
    weightKg: toDecimal(product.weightKg),
    variants: product.variants
      ? (product.variants as any[]).map(mapProductVariant)
      : product.variants,
  }
}
