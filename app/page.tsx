import Image from "next/image";
import SocialLinks from "@/app/components/social-links";
import { RecentPosts } from "@/app/components/recent-posts";
import { ScrollArrow } from "@/app/components/scroll-arrow";
import { About } from "@/app/components/about";
import { Experience } from "@/app/components/experience";

export default function Home() {
  return (
    <div className="font-sans bg-zinc-50 dark:bg-black">
      {/* Hero section */}
      <header className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <Image
          src="/hero-macbook.jpg"
          alt="Hero — MacBook on desk"
          height={7000}
          width={4284}
          className="absolute inset-0 object-cover w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-3xl text-center">
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              Erin Gallagher
            </h1>
            <p className="mt-4 text-base sm:text-lg lg:text-xl text-white/90">
              Software Engineer • Musical Theatre Enthusiast
            </p>
            <div className="mt-8">
              <SocialLinks
                size={24}
                gap="gap-4 sm:gap-6"
                className="text-white"
              />
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <ScrollArrow />
      </header>

      <main className="flex w-full max-w-3xl mx-auto flex-col items-center justify-between py-16 px-4 sm:px-6 bg-white dark:bg-black">
        <About />
        <RecentPosts />
        <Experience />
      </main>
    </div>
  );
}
