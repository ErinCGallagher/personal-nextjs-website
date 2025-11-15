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
        <div className="relative z-10 flex items-center justify-center md:justify-start px-4 sm:px-6 w-full max-w-7xl mx-auto">
          <div className="max-w-3xl text-center md:text-left">
            <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl xl:text-[70px]">
              Erin Gallagher
            </h1>
            <p className="mt-4 text-xl sm:text-2xl lg:text-3xl text-white/90">
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

      <main className="flex w-full max-w-3xl mx-auto flex-col items-center justify-between py-16 px-4 sm:px-6 bg-white dark:bg-black">
        <About />
        <RecentPosts />
        <Experience />
      </main>
    </div>
  );
}
