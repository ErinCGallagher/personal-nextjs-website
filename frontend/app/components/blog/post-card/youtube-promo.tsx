/**
 * Promotional banner for the Trail Tales YouTube channel, displayed on the
 * blog listing page alongside post cards.
 */
import Image from "next/image";
import Link from "next/link";

const CHANNEL_URL = "https://www.youtube.com/@trailtalestravel";
const SUBSCRIBER_COUNT = "1,994"; // Update this manually as needed
const FEATURED_VIDEO = {
  id: "SC_GlDGKX7U",
  title: "Most Popular Video",
  url: "https://youtu.be/SC_GlDGKX7U",
};

export function YouTubePromo() {
  return (
    <section className="mt-12">
      <h2 className="text-2xl !font-bold !tracking-normal text-foreground mb-6">
        Watch on YouTube
      </h2>
      <div className="p-6 rounded-lg bg-gray-100">
        <div className="flex flex-col md:flex-row gap-6">
          <Link
            href={FEATURED_VIDEO.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-full md:w-1/2 aspect-video rounded-lg overflow-hidden group"
          >
            <Image
              src={`https://img.youtube.com/vi/${FEATURED_VIDEO.id}/sddefault.jpg`}
              alt={FEATURED_VIDEO.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-[#8586A9] rounded-full flex items-center justify-center group-hover:bg-[#6e6f8a] transition-colors">
                <svg
                  className="w-8 h-8 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </Link>

          <div className="flex flex-col items-start justify-center w-full md:w-1/2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/icons/trail-tales-logo.png"
                alt="Trail Tales Travel"
                width={100}
                height={100}
                className="rounded-lg"
              />
              <div className="text-left">
                <h3 className="text-xl font-semibold text-foreground">
                  Trail Tales Travel
                </h3>
                <p className="text-m text-gray-500">
                  {SUBSCRIBER_COUNT} subscribers
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 text-left">
              Video guides for hiking trails, road trips, and outdoor adventures
              across Canada and beyond.
            </p>

            <Link
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#8586A9] hover:bg-[#6e6f8a] text-white font-medium rounded-full transition-colors"
            >
              Subscribe on YouTube
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
