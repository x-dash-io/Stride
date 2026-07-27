'use client'

export function ClearFiltersButton() {
  return (
    <button
      onClick={() => { window.location.href = '/products' }}
      className="btn-primary"
    >
      Clear Filters
    </button>
  )
}
