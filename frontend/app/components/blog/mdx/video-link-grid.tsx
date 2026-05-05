import Image from "next/image";
import Link from "next/link";
import { extractYouTubeVideoId } from "./video-link";

interface VideoLinkGridProps {
  url1: string;
  url2: string;
  url3: string;
  url4: string;
  title1?: string;
  title2?: string;
  title3?: string;
  title4?: string;
}

const CHANNEL_URL = "https://www.youtube.com/@trailtalestravel";

function VideoThumbnail({ url, title }: { url: string; title?: string }) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="!no-underline hover:!no-underline group flex flex-col"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={`https://img.youtube.com/vi/${videoId}/sddefault.jpg`}
          alt={title || "Watch video"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-[#8586A9] rounded-full flex items-center justify-center group-hover:bg-[#6e6f8a] transition-colors">
            <svg
              className="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      {title && (
        <span className="block mt-2 pb-2 text-sm font-semibold text-foreground text-center leading-tight">
          {title}
        </span>
      )}
    </Link>
  );
}

export function VideoLinkGrid({
  url1,
  url2,
  url3,
  url4,
  title1,
  title2,
  title3,
  title4,
}: VideoLinkGridProps) {
  return (
    <div className="my-6 rounded-xl bg-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icons/trail-tales-logo.png"
            alt="Trail Tales"
            width={48}
            height={48}
            className="h-9 w-9 rounded-sm"
          />
          <span className="text-lg font-bold text-foreground">YouTube</span>
          <span className="hidden sm:inline text-gray-300">·</span>
          <span className="hidden sm:inline text-sm text-foreground">Watch on YouTube</span>
        </div>
        <Link
          href={CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#8586A9] hover:text-[#6e6f8a] !no-underline hover:!no-underline transition-colors"
        >
          View channel →
        </Link>
      </div>
      <div className="border-t border-gray-200" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5">
        <VideoThumbnail url={url1} title={title1} />
        <VideoThumbnail url={url2} title={title2} />
        <VideoThumbnail url={url3} title={title3} />
        <VideoThumbnail url={url4} title={title4} />
      </div>
    </div>
  );
}
