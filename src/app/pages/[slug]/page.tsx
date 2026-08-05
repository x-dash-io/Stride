import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCmsPage } from '@/lib/services/product.service'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface CmsPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getCmsPage(slug)
  return {
    title: page ? `${page.title} | STRIDE` : 'Page | STRIDE',
    description: page?.metaDescription ?? undefined,
  }
}

export default async function CmsPageDetail({ params }: CmsPageProps) {
  const { slug } = await params
  const page = await getCmsPage(slug)

  if (!page || !page.isPublished) {
    notFound()
  }

  return (
    <div className="container-max py-12 md:py-16">
      <article className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="heading-section">{page.title}</h1>
          {page.publishedAt && (
            <p className="text-sm text-muted-foreground mt-4">
              Published {format(new Date(page.publishedAt), 'MMMM d, yyyy')}
            </p>
          )}
        </header>

        <div
          className="prose prose-lg max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  )
}