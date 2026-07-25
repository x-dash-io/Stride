import Head from 'next/head'

interface MetaTagsProps {
  title: string
  description: string
  ogImage?: string
  ogType?: string
  canonical?: string
}

export function MetaTags({
  title,
  description,
  ogImage,
  ogType = 'website',
  canonical,
}: MetaTagsProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content={ogType} />
      {canonical && <link rel="canonical" href={canonical} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  )
}
