import Image from "next/image";
import SocialLinks from "@/app/components/social-links";
import { RecentPosts } from "@/app/components/recent-posts";

export default function Home() {
  return (
    <div className="min-h-screen font-sans bg-zinc-50 dark:bg-black">
      {/* Hero section */}
      <header className="relative h-[52vh] min-h-[320px] w-full overflow-hidden">
        <Image
          src="/hero-macbook.jpg"
          alt="Hero — MacBook on desk"
          height={7000}
          width={4284}
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="max-w-3xl text-center">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Erin Gallagher
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Software Engineer • Musical Theatre Enthusiast
            </p>
            <div className="mt-8">
              <SocialLinks
                size={28}
                gap="gap-6"
                className="text-white"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="flex w-full max-w-3xl mx-auto flex-col items-center justify-between py-16 px-6 bg-white dark:bg-black">
        <RecentPosts />
      </main>
    </div>
  );
}
