import { Metadata } from 'next'
import Link from 'next/link'
import { menu } from '@/lib/menu'
import { CalendarDays, Building2, Calculator, CreditCard } from 'lucide-react'
import { getFeaturedPosts, getCategories } from '@/modules/blog/service'

export const metadata: Metadata = {
  title: menu.blog.title + ' | Canadian Financial Tools',
  description: menu.blog.description,
}

// Map category slugs to icons
const categoryIcons = {
  'real-estate': Building2,
  investing: Calculator,
  'personal-finance': CreditCard,
}

export default async function BlogPage() {
  const [categories, featuredPosts] = await Promise.all([getCategories(), getFeaturedPosts(3)])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{menu.blog.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{menu.blog.description}</p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => {
          const Icon = categoryIcons[category.slug as keyof typeof categoryIcons] || Building2
          return (
            <Link
              key={category.id}
              href={`/blog/category/${category.slug}`}
              className="group block p-6 bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow border border-border"
            >
              <div className="flex items-center mb-4">
                <Icon className="h-6 w-6 text-primary group-hover:text-primary/80" />
                <h3 className="ml-3 text-lg font-semibold group-hover:text-primary">{category.name}</h3>
              </div>
              <p className="text-muted-foreground">{category.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Featured Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden border border-border"
            >
              <div className="p-6">
                <Link
                  href={`/blog/category/${post.category?.slug}/${post.slug}`}
                  className="block mb-3 hover:text-primary"
                >
                  <h3 className="text-xl font-semibold line-clamp-2">{post.title}</h3>
                </Link>
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <time dateTime={post.publishedAt?.toISOString()}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                  </time>
                  {post.category && (
                    <>
                      <span className="mx-2">·</span>
                      <Link
                        href={`/blog/category/${post.category.slug}`}
                        className="text-primary hover:text-primary/80"
                      >
                        {post.category.name}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
