import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-max py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="mb-8 text-8xl">🔍</div>
      <h1 className="text-5xl font-serif font-bold mb-4">Page Not Found</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Sorry, we can&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
        <Link href="/products" className="btn-secondary">
          Browse Products
        </Link>
      </div>
    </div>
  )
}
