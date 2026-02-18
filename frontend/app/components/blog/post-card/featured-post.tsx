/**
 * Large post card used to highlight a featured post on the blog listing page.
 */
import Link from "next/link";
import Image from "next/image";
import { getTagColor, formatDate } from "@/app/blog/utils";

type FeaturedPostProps = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  image?: string;
  tags?: string[];
  readingTime?: number;
};

export function FeaturedPost({
  slug,
  title,
  summary,
  publishedAt,
  image,
  tags,
  readingTime,
}: FeaturedPostProps) {
  return (
    <Link href={`/blog/${slug}`} className="h-full">
      <article className="group cursor-pointer p-6 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors h-full flex flex-col">
        {image && (
          <div className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-lg overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <hr className="mt-6 md:mt-4 mb-2 border-gray-200" />

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 gap-2">
          <div className="flex flex-wrap gap-1">
            {tags &&
              tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-sm rounded text-white"
                  style={{ backgroundColor: getTagColor(tag) }}
                >
                  {tag}
                </span>
              ))}
          </div>
          <div className="text-sm text-gray-500 text-left md:text-right">
            <time>{formatDate(publishedAt)}</time>
            {readingTime && (
              <>
                <span className="md:hidden"> · {readingTime} min read</span>
                <p className="!my-0 hidden md:block">{readingTime} min read</p>
              </>
            )}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-grey transition-colors">
          {title}
        </h3>

        <p className="mt-2 text-gray-600 line-clamp-3 md:line-clamp-2">
          {summary}
        </p>
      </article>
    </Link>
  );
}
