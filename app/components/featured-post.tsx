import Link from 'next/link';
import Image from 'next/image';
import { getTagColor } from '@/app/blog/utils';

type FeaturedPostProps = {
    slug: string;
    title: string;
    summary: string;
    image?: string;
    tags?: string[];
};

export function FeaturedPost({ slug, title, summary, image, tags }: FeaturedPostProps) {
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

                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-1 text-xs font-medium rounded-full text-white"
                                style={{ backgroundColor: getTagColor(tag) }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <h2 className="text-2xl font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </h2>

                <p className="mt-2 mb-4 text-gray-600 dark:text-gray-400">
                    {summary}
                </p>
            </article>
        </Link>
    );
}
