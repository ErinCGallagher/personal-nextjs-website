import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface RelatedPostProps {
  href: string;
  title: string;
  image?: string;
}

interface RelatedPostsProps {
  children: ReactNode;
}

export function RelatedPosts({ children }: RelatedPostsProps) {
  return (
    <div className="not-prose my-8 rounded-lg bg-gray-100 p-6">
      <span className="block mb-4 font-playfair text-xl font-bold text-gray-800">
        Related Posts
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function RelatedPost({ href, title, image }: RelatedPostProps) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors overflow-hidden group !no-underline hover:!no-underline"
    >
      {image && (
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-3 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground line-clamp-2">
          {title}
        </span>
        <span className="flex items-center text-xl text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0">
          ➜
        </span>
      </div>
    </Link>
  );
}
