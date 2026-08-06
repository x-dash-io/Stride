'use client'

import { DataTable } from '@/components/admin/DataTable'

interface LowStockProduct {
  id: string
  sku: string
  size: string
  colour: string
  product: { name: string }
  inventory: Array<{ quantityOnHand: number }>
}

export function LowStockTable({ data }: { data: LowStockProduct[] }) {
  const columns = [
    { key: 'product', header: 'Product', render: (row: LowStockProduct) => (
      <div>
        <p className="font-semibold text-sm text-foreground truncate max-w-xs">{row.product.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-medium">Size: {row.size} • Color: {row.colour}</p>
      </div>
    ), sortable: true },
    { key: 'sku', header: 'SKU', render: (row: LowStockProduct) => (
      <span className="text-[11px] text-muted-foreground font-mono">{row.sku}</span>
    ), width: '120px' },
    { key: 'quantity', header: 'Qty Left', render: (row: LowStockProduct) => (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive dark:text-destructive-foreground border border-destructive/20 whitespace-nowrap">
        {row.inventory.reduce((sum, inv) => sum + inv.quantityOnHand, 0)} left
      </span>
    ), align: 'center' as const, width: '100px' },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(row) => row.id}
      searchable={true}
      searchPlaceholder="Search products..."
      sortable={true}
      pageSize={5}
      showPagination={true}
      showColumnToggle={true}
      showExport={true}
      emptyMessage="All products well stocked"
      stickyHeader={true}
    />
  )
}