import Link from 'next/link';
import { getBlogPosts } from '@/app/blog/utils';

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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-black dark:text-white">
          Recent Posts
        </h2>
        <Link
          href="/blog"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {recentPosts.length > 0 ? (
        <div className="grid gap-6 md:gap-8">
          {recentPosts.map((post) => (
            <article
              key={post.slug}
              className="group border-l-4 border-transparent hover:border-blue-600 dark:hover:border-blue-400 pl-4 py-2 transition-colors"
            >
              <Link href={`/blog/${post.slug}`}>
                <h3 className="text-lg font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.metadata.title}
                </h3>
              </Link>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {post.metadata.summary}
              </p>
              <time className="mt-3 block text-xs text-gray-500 dark:text-gray-500">
                {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </article>
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
