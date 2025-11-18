import Link from 'next/link';
import Image from 'next/image';
import { getTagColor, formatDate } from '@/app/blog/utils';

type FeaturedPostProps = {
    slug: string;
    title: string;
    summary: string;
    publishedAt: string;
    image?: string;
    tags?: string[];
};

export function FeaturedPost({ slug, title, summary, publishedAt, image, tags }: FeaturedPostProps) {
    return (
        <Link href={`/blog/${slug}`}>
            <article className="group cursor-pointer">
                {image && (
                    <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}

                <hr className="mt-6 mb-2 border-gray-200 dark:border-gray-700" />

                <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-wrap gap-2">
                        {tags && tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-block px-3 py-1 text-sm rounded text-white"
                                style={{ backgroundColor: getTagColor(tag) }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(publishedAt)}
                    </time>
                </div>

                <h2 className="text-2xl font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h2>

                <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400 line-clamp-2">
                    {summary}
                </p>
            </article>
        </Link>
    );
}
