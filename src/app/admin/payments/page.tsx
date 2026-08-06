import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Receipt, ChevronLeft, ChevronRight } from 'lucide-react'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { PaymentsFilter } from '@/components/admin/PaymentsFilter'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Payments | STRIDE',
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const params = await searchParams
  const search = params.search || ''
  const status = params.status || 'ALL'
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 25
  const skip = (page - 1) * perPage

  const where: any = search
    ? {
        OR: [
          { transactionId: { contains: search, mode: 'insensitive' } },
          { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
          { order: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {}

  if (status !== 'ALL') {
    where.status = status
  }

  const [rows, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      include: {
        order: { select: { id: true, orderNumber: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.paymentTransaction.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const statusOptions = ['ALL', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">{total} transaction{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <PaymentsFilter search={search} status={status} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Transaction ID</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Refund</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono">{row.transactionId || '—'}</td>
                  <td className="px-4 py-3">
                    {row.order ? (
                      <Link href={`/admin/orders/${row.order.id}`} className="hover:underline">
                        #{row.order.orderNumber}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{row.paymentMethod}</td>
                  <td className="px-4 py-3 font-medium">KES {Number(row.amount).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.status === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                      row.status === 'AUTHORIZED' ? 'bg-blue-100 text-blue-800' :
                      row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      row.status === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                      row.status === 'PARTIALLY_REFUNDED' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={row.isRefund ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {row.isRefund ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <a
            href={status !== 'ALL' ? `/admin/payments?status=${status}&page=${Math.max(1, page - 1)}` : `/admin/payments?page=${Math.max(1, page - 1)}`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </a>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <a
            href={status !== 'ALL' ? `/admin/payments?status=${status}&page=${Math.min(totalPages, page + 1)}` : `/admin/payments?page=${Math.min(totalPages, page + 1)}`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}