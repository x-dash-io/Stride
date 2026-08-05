import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Search, Users, ChevronLeft, ChevronRight, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { requireStaff } from '@/lib/authz'
import { ADMIN_ROLE } from '@/lib/roles'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin Users | STRIDE',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>
}) {
  await requireStaff({ roles: [ADMIN_ROLE] })

  const params = await searchParams
  const search = params.search || ''
  const role = params.role || 'ALL'
  const page = Math.max(1, Number(params.page) || 1)
  const perPage = 25
  const skip = (page - 1) * perPage

  const where: any = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  if (role !== 'ALL') {
    where.role = role
  }

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        failedLoginCount: true,
        lockoutUntil: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true, wishlists: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  const roleOptions = ['ALL', 'CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'STAFF']

  return (
    <div className="container-max py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-serif font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">{total} user{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <form method="get" className="mb-6 flex flex-wrap gap-4 max-w-4xl">
        <div className="relative flex-1 max-w-md">
          <Input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Select
          defaultValue={role}
          onValueChange={(value) => {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            params.set('role', value)
            params.set('page', '1')
            window.location.href = `/admin/users?${params.toString()}`
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Name / Email</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-center">Reviews</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{row.name || '—'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{row.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (row.role as string) === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      (row.role as string) === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                      (row.role as string) === 'STAFF' ? 'bg-amber-100 text-amber-800' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {row.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      row.lockoutUntil && new Date(row.lockoutUntil) > new Date() ? 'bg-red-100 text-red-800' :
                      row.failedLoginCount > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {row.lockoutUntil && new Date(row.lockoutUntil) > new Date() ? 'Locked' : row.failedLoginCount > 0 ? `Failed: ${row.failedLoginCount}` : 'OK'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{row._count.orders}</td>
                  <td className="px-4 py-3 text-center">{row._count.reviews}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.createdAt).toLocaleDateString()}
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
            href={`/admin/users?role=${role}&page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ''}`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </a>
          <span className="text-sm text-muted-foreground px-2">
            Page {page} of {totalPages}
          </span>
          <a
            href={`/admin/users?role=${role}&page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ''}`}
            className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}