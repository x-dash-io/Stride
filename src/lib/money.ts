export function toCents(value: number): number {
  return Math.round((Number(value) + Number.EPSILON) * 100)
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100
}

export function applyRateCents(baseCents: number, ratePct: number): number {
  return Math.round(baseCents * ratePct)
}
