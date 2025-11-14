import { RecentPosts } from '@/app/components/recent-posts';

export default function Page() {
    return (
        <div className="pt-16">
            <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                   Blog
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Thoughts on software development, travel, and more.
                </p>
                
                <div className="mt-12">
                  <RecentPosts />
                </div>
            </div>
        </div>
    )
}