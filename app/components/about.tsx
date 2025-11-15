import Image from 'next/image';
import Link from 'next/link';

export function About() {
  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold text-black dark:text-white mb-8">
        About Me
      </h2>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative w-48 h-48 flex-shrink-0 mx-auto md:mx-0">
          <Image
            src="/erin.jpg"
            alt="Erin Gallagher"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center md:text-left">
            I'm a Staff Engineer who specializes in leading cross-platform teams. Most recently, I spent a year as the domain expert at Uber, where I defined the technical vision for video and launched its first use case. When I'm not debugging code, you'll find me hiking trails and probably talking about my latest camping adventure.
          </p>
          <div className="mt-4 text-center md:text-left">
            <Link
              href="https://www.youtube.com/@trailtalestravel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold underline"
            >
              Visit my YouTube channel →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
