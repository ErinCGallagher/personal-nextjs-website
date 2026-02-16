import { Metadata } from "next";
import Image from "next/image";
import SocialLinks from "@/app/components/social-links";
import { RecentPosts } from "@/app/components/recent-posts";
import { ScrollArrow } from "@/app/components/scroll-arrow";
import { About } from "@/app/components/about";
import { Favourites } from "@/app/components/favourites";
import { Experience } from "@/app/components/experience";

export const metadata: Metadata = {
  title: "Erin Gallagher",
  description: "Software Engineer and outdoor enthusiast.",
  openGraph: {
    images: ["/icons/erin-logo.png"],
  },
  twitter: {
    images: ["/icons/erin-logo.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Erin Gallagher",
  url: "https://www.egallagher.com",
  jobTitle: "Software Engineer",
  sameAs: [
    "https://github.com/ErinCGallagher",
    "https://www.linkedin.com/in/eringallagher3/",
    "https://www.youtube.com/@trailtalestravel/featured",
  ],
};

export default function Home() {
  return (
    <div className="font-sans bg-background">
      {/* dangerouslySetInnerHTML is the only way to set inline script content in React.
          It is safe here because the content is hardcoded JSON, not user input. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Hero section */}
      <header className="relative h-[90vh] md:h-screen w-full overflow-hidden">
        <Image
          src="/erin-hero.jpg"
          alt="Hero — Erin standing in front of a landscape"
          height={4096}
          width={2730}
          className="absolute inset-0 object-cover object-bottom w-full h-full"
          priority
        />
        <div className="absolute inset-0" />
        <div className="relative z-10 h-full flex">
          {/* Left column - centered text */}
          <div className="w-full md:w-1/2 flex items-start md:items-center justify-center px-4 sm:px-6 pt-16 md:pt-0">
            <div className="text-center">
              <h1
                className="text-[4.2rem] font-semibold text-white sm:text-[5.25rem] lg:text-[6.3rem] xl:text-[6.125rem]"
                style={{ lineHeight: "0.95" }}
              >
                <p>Erin</p>
                <p>Gallagher</p>
              </h1>
              <div className="mt-8 md:mt-20 text-xl sm:text-2xl lg:text-3xl text-white">
                <p>Software Engineer &</p>
                <p>Musical Theatre Enthusiast</p>
              </div>
              <div className="mt-8">
                <SocialLinks
                  size={32}
                  gap="gap-4 sm:gap-6"
                  className="text-white"
                  justify="justify-center"
                />
              </div>
            </div>
          </div>
          {/* Right column - empty */}
          <div className="hidden md:block md:w-1/2"></div>
        </div>
        {/* Scroll indicator */}
        <ScrollArrow />
      </header>

      <div className="px-4 sm:px-6 py-16">
        <main className="flex max-w-4xl mx-auto px-8 md:px-16 pb-16 flex-col items-center justify-between bg-white text-foreground rounded-lg">
          <About />
          <Favourites />
          <RecentPosts />
          <Experience />
        </main>
      </div>
    </div>
  );
}
