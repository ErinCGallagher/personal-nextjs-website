import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts, formatDate } from '@/app/blog/utils';

export function RecentPosts() {
  const allPosts = getBlogPosts();
  
  // Sort by date (newest first) and get top 3
  const recentPosts = allPosts
    .sort((a, b) => {
      const dateA = new Date(a.metadata.publishedAt).getTime();
      const dateB = new Date(b.metadata.publishedAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-8">
        Recent Posts
      </h2>

      {recentPosts.length > 0 ? (
        <div className="grid gap-6 md:gap-8">
          {recentPosts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <article className="group border-l-4 border-transparent hover:border-blue-600 dark:hover:border-blue-400 pl-4 py-2 transition-colors cursor-pointer flex gap-4">
                {post.metadata.image && (
                  <div className="relative w-24 h-24 flex-shrink-0 border-2 border-white rounded-lg overflow-hidden">
                    <Image
                      src={post.metadata.image}
                      alt={post.metadata.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.metadata.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {post.metadata.summary}
                  </p>
                  <time className="mt-3 block text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(post.metadata.publishedAt)}
                  </time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No blog posts yet. Check back soon!
        </p>
      )}
    </section>
  );
}
