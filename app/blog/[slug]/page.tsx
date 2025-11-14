import { notFound } from 'next/navigation'
import { getBlogPosts } from '../utils'
import { CustomMDX } from '@/app/components/mdx'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <section className="pt-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="title font-semibold text-3xl tracking-tighter mb-4">
          {post.metadata.title}
        </h1>
        <div className="flex justify-between items-center mt-2 mb-8 text-sm">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {post.metadata.publishedAt}
          </p>
        </div>
        <article className="prose max-w-none">
          <CustomMDX source={post.content} />
        </article>
      </div>
    </section>
  )
}