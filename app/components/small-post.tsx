import Link from 'next/link';
import Image from 'next/image';
import { getTagColor } from '@/app/blog/utils';

type SmallPostProps = {
    slug: string;
    title: string;
    summary: string;
    image?: string;
    tags?: string[];
};

export function SmallPost({ slug, title, summary, image, tags }: SmallPostProps) {
    return (
        <Link href={`/blog/${slug}`}>
            <article className="group cursor-pointer">
                {image && (
                    <div className="relative w-full aspect-[16/9] rounded-md overflow-hidden">
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
                    <div className="flex flex-wrap gap-2 mb-1">
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

                <h3 className="text-sm font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                    {title}
                </h3>

                <p className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-400 line-clamp-1">
                    {summary}
                </p>
            </article>
        </Link>
    );
}
