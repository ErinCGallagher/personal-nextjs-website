import Image from "next/image";
import SocialLinks from "@/app/components/social-links";
import { RecentPosts } from "@/app/components/recent-posts";
import { ScrollArrow } from "@/app/components/scroll-arrow";
import { About } from "@/app/components/about";
import { Favourites } from "@/app/components/favourites";
import { Experience } from "@/app/components/experience";

export default function Home() {
  return (
    <div className="font-sans bg-background">
      {/* Hero section */}
      <header className="relative h-[90vh] md:h-screen w-full overflow-hidden flex items-center justify-center">
        <Image
          src="/hero-erin.jpg"
          alt="Hero — Erin standing in front of a landscape"
          height={7000}
          width={4284}
          className="absolute inset-0 object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0" />
        <div className="relative z-10 flex items-center justify-center md:justify-start px-4 sm:px-6 w-full max-w-7xl mx-auto">
          <div className="max-w-3xl text-center md:text-left">
            <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl xl:text-[70px]">
              Erin Gallagher
            </h1>
            <p className="mt-4 text-xl sm:text-2xl lg:text-3xl text-white">
              Software Engineer • Musical Theatre Enthusiast
            </p>
            <div className="mt-8">
              <SocialLinks
                size={32}
                gap="gap-4 sm:gap-6"
                className="text-white"
                justify="justify-center md:justify-start"
              />
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <ScrollArrow />
      </header>

      <div className="px-4 sm:px-6 py-16">
        <main className="flex max-w-4xl mx-auto px-16 pb-16 flex-col items-center justify-between bg-white text-foreground rounded-lg">
          <About />
          <Favourites />
          <RecentPosts />
          <Experience />
        </main>
      </div>
    </div>
  );
}
