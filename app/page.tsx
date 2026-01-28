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
      <header className="relative h-[90vh] md:h-screen w-full overflow-hidden">
        <Image
          src="/hero-erin.jpg"
          alt="Hero — Erin standing in front of a landscape"
          height={7000}
          width={4284}
          className="absolute inset-0 object-cover object-bottom w-full h-full"
          priority
        />
        <div className="absolute inset-0" />
        <div className="relative z-10 h-full flex">
          {/* Left column - centered text */}
          <div className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6">
            <div className="text-center">
              <h1 className="text-[4.2rem] font-semibold text-white sm:text-[5.25rem] lg:text-[6.3rem] xl:text-[6.125rem]" style={{ lineHeight: '0.95' }}>
                <p>Erin</p>
                <p>Gallagher</p>
              </h1>
              <p className="mt-20 text-xl sm:text-2xl lg:text-3xl text-white">
                <div>Software Engineer &</div>
                <div>Musical Theatre Enthusiast</div>
              </p>
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
