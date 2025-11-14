import { BlogPosts } from 'app/components/posts'
import Image from 'next/image';

export default function Page() {
  return (
  <>
    <section>
      <div className="mb-6">
        <div className="relative w-full h-56 sm:h-72 md:h-96 rounded-lg overflow-hidden mb-6">
          <Image
            src="/laptop-hero.jpg"
            width={7000}
            height={4284}
            className="hidden md:block"
            alt="mapbook laptop hero image background"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col justify-center items-start px-6 sm:px-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Erin Gallagher
            </h2>
            <p className="mt-1 text-sm sm:text-base opacity-90">
              Software Engineer | Musical Theatre Enthusiast
            </p>
          </div>
        </div>
      </div>
    </section>
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        My Portfolio
      </h1>
      <p className="mb-4">
        {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
      </p>
    </section>

    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Travel Blogs
      </h1>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  </>
  )
}
