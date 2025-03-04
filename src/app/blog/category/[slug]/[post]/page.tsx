import { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { getBlogPost, getRelatedPosts } from '@/modules/blog/service'
import { Markdown } from '@/components/Markdown'
import Image from 'next/image'

interface PostPageProps {
  params: Promise<{
    slug: string
    post: string
  }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { post: postId } = await params
  const post = await getBlogPost(postId)
  if (!post) return {}

  return {
    title: `${post.title} | Blog | Canadian Financial Tools`,
    description: post.excerpt || undefined,
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { post: postId } = await params
  const post = await getBlogPost(postId)
  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-xl text-muted-foreground mb-8">
            We couldn&apos;t find the blog post you&apos;re looking for.
          </p>
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

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId, 3)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="mb-6">
            {post.category && (
              <Link
                href={`/blog/category/${post.category.slug}`}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {post.category.name}
              </Link>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>}
          <div className="flex items-center justify-center text-sm text-muted-foreground space-x-4">
            <div className="flex items-center">
              <Image
                src={post.author.avatarUrl || '/images/default-avatar.png'}
                alt={post.author.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-2" />
              <time dateTime={post.publishedAt?.toISOString()}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
              </time>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="mb-12">
            <Image
              src={post.featuredImage}
              alt={post.title}
              width={1200}
              height={384}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-blockquote:text-foreground prose-figure:text-foreground prose-figcaption:text-foreground prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-foreground prose-pre:text-foreground mx-auto">
          <Markdown>{post.content}</Markdown>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((relatedPost) => (
              <article
                key={relatedPost.id}
                className="bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <Link
                    href={`/blog/category/${relatedPost.category?.slug}/${relatedPost.slug}`}
                    className="block mb-3 hover:text-primary"
                  >
                    <h3 className="text-xl font-semibold line-clamp-2">{relatedPost.title}</h3>
                  </Link>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{relatedPost.excerpt}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <time dateTime={relatedPost.publishedAt?.toISOString()}>
                      {relatedPost.publishedAt ? new Date(relatedPost.publishedAt).toLocaleDateString() : 'Draft'}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
