import { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Building2, Calculator, CreditCard } from 'lucide-react'
import { getBlogPosts } from '@/modules/blog/service'
import Image from 'next/image'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    page?: string
  }>
}

// Map category slugs to icons
const categoryIcons = {
  'real-estate': Building2,
  investing: Calculator,
  'personal-finance': CreditCard,
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const { posts } = await getBlogPosts({ categorySlug: slug, limit: 1 })
  if (!posts.length || !posts[0].category) return {}

  const category = posts[0].category
  return {
    title: `${category.name} | Blog | Canadian Financial Tools`,
    description: category.description || undefined,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams

  const page = pageParam ? parseInt(pageParam) : 1
  const { posts, total } = await getBlogPosts({
    categorySlug: slug,
    page,
    limit: 9,
  })

  // If no posts found, show a friendly message
  if (!posts.length || !posts[0].category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Posts Found</h1>
          <p className="text-xl text-muted-foreground mb-8">We couldn&apos;t find any posts in this category.</p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Return to Blog
          </Link>
        </div>
      </div>
    )
  }

  const category = posts[0].category!
  const Icon = categoryIcons[slug as keyof typeof categoryIcons] || Building2

  const totalPages = Math.ceil(total / 9)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-4xl font-bold">{category.name}</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border"
          >
            {post.featuredImage && (
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={800}
                height={192}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <Link href={`/blog/category/${slug}/${post.slug}`} className="block mb-3 hover:text-primary">
                <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
              </Link>
              <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4 mr-2" />
                <time dateTime={post.publishedAt?.toISOString()}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                </time>
                <span className="mx-2">·</span>
                <span>{post.author.name}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/blog/category/${slug}?page=${pageNum}`}
              className={`px-4 py-2 rounded ${
                pageNum === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-card-foreground hover:bg-muted border border-border'
              }`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
