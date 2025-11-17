import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getBlogPosts, formatDate } from '../utils'
import { CustomMDX } from '@/app/components/mdx'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <section className="pt-16">
      {post.metadata.image && (
        <div className="relative w-full h-[500px] mb-8">
          <div className="absolute inset-0">
            <Image
              src={post.metadata.image}
              alt={post.metadata.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-4xl mx-auto px-6 w-full text-center">
              <h1 className="title font-semibold text-5xl tracking-tighter text-white">
                {post.metadata.title}
              </h1>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-12">
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/erin.jpg"
              alt="Erin Gallagher"
              fill
              className="object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-neutral-900 dark:text-neutral-100">
              Written by <span className="font-medium">Erin Gallagher</span>
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Published on {formatDate(post.metadata.publishedAt)}
            </p>
          </div>
        </div>
        <article className="prose max-w-none">
          <CustomMDX source={post.content} />
        </article>
      </div>
    </section>
  )
}