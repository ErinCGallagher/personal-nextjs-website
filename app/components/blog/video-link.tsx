import Image from "next/image";
import Link from "next/link";

interface VideoLinkProps {
  url: string;
  title?: string;
}

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export function VideoLink({ url, title }: VideoLinkProps) {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return (
    <div className="my-6 p-4 rounded-lg bg-gray-100">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col sm:flex-row gap-4 items-center !no-underline hover:!no-underline"
      >
        <div className="relative w-full sm:w-64 aspect-video rounded-lg overflow-hidden group flex-shrink-0">
          <Image
            src={`https://img.youtube.com/vi/${videoId}/sddefault.jpg`}
            alt={title || "Watch video"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-[#8586A9] rounded-full flex items-center justify-center group-hover:bg-[#6e6f8a] transition-colors">
              <svg
                className="w-6 h-6 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex flex-col text-center sm:text-left">
          {title && (
            <span className="text-lg font-medium text-foreground">{title}</span>
          )}
          <span className="text-m text-[#8586A9]">Watch on YouTube →</span>
        </div>
      </Link>
    </div>
  );
}
