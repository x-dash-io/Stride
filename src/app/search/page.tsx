import { redirect } from 'next/navigation'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  if (q && q.trim()) {
    redirect(`/products?q=${encodeURIComponent(q.trim())}`)
  }
  redirect('/products')
}

