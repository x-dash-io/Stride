'use client'

import { format } from 'date-fns'
import { formatPrice } from '@/lib/utils'
import { DataTable } from '@/components/admin/DataTable'

interface RecentOrder {
  id: string
  orderNumber: string
  user?: { name: string | null; email: string } | null
  createdAt: string | Date
  grandTotal: number
  status: string
}

export function RecentOrdersTable({ data }: { data: RecentOrder[] }) {
  const columns = [
    { key: 'orderNumber', header: 'Order #', render: (row: RecentOrder) => `#${row.orderNumber}`, sortable: true, width: '120px' },
    { key: 'customer', header: 'Customer', render: (row: RecentOrder) => row.user?.name || 'Guest', sortable: true },
    { key: 'date', header: 'Date', render: (row: RecentOrder) => format(new Date(row.createdAt), 'MMM d, yyyy'), sortable: true, width: '140px' },
    { key: 'amount', header: 'Amount', render: (row: RecentOrder) => formatPrice(Number(row.grandTotal)), sortable: true, align: 'right' as const, width: '140px' },
    { key: 'status', header: 'Status', render: (row: RecentOrder) => (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary dark:text-primary-foreground border border-primary/20 whitespace-nowrap">
        {row.status}
      </span>
    ), width: '140px' },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(row) => row.id}
      searchable={true}
      searchPlaceholder="Search orders..."
      sortable={true}
      defaultSort={{ key: 'date', direction: 'desc' }}
      pageSize={5}
      showPagination={true}
      showColumnToggle={true}
      showExport={true}
      emptyMessage="No orders yet"
      stickyHeader={true}
    />
  )
}