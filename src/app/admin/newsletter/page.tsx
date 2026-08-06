import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Mail, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'
import { NewsletterFilter } from '@/components/admin/NewsletterFilter'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Newsletter | STRIDE',
}

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; subscribed?: string; page?: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const params = await searchParams
  const search = params.search || ''
  const subscribed = params.subscribed || 'ALL'
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 25
  const skip = (page - 1) * perPage

  const where: any = search
    ? { email: { contains: search, mode: 'insensitive' } }
    : {}

  if (subscribed === 'ACTIVE') where.subscribed = true
  if (subscribed === 'UNSUBSCRIBED') where.subscribed = false

  const [rows, total] = await Promise.all([
    prisma.newsletterSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.newsletterSubscription.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const totalSubscribed = await prisma.newsletterSubscription.count({ where: { subscribed: true } })

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            {total} total • {totalSubscribed} active
          </p>
        </div>
      </div>

      <NewsletterFilter search={search} subscribed={subscribed} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Subscribed</th>
                <th className="px-4 py-3">Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-mono">{row.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.subscribed ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'
                    }`}>
                      {row.subscribed ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}
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
            href={`/admin/newsletter?subscribed=${subscribed}&page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ''}`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </a>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <a
            href={`/admin/newsletter?subscribed=${subscribed}&page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ''}`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}