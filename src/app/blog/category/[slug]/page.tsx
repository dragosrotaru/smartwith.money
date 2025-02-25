import { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays, Building2, Calculator, CreditCard } from 'lucide-react'
import { getBlogPosts } from '@/modules/blog/service'
import Image from 'next/image'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

// Map category slugs to icons
const categoryIcons = {
  'real-estate': Building2,
  investing: Calculator,
  'personal-finance': CreditCard,
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const slug = await Promise.resolve(params.slug)
  const { posts } = await getBlogPosts({ categorySlug: slug, limit: 1 })
  if (!posts.length || !posts[0].category) return {}

  const category = posts[0].category
  return {
    title: `${category.name} | Blog | Canadian Financial Tools`,
    description: category.description || undefined,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [slug, pageParam] = await Promise.all([Promise.resolve(params.slug), Promise.resolve(searchParams.page)])

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">No Posts Found</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            We couldn&apos;t find any posts in this category.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
          <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">{category.name}</h1>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{category.description}</p>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
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
              <Link
                href={`/blog/category/${slug}/${post.slug}`}
                className="block mb-3 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{post.title}</h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
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
