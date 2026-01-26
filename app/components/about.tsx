import Image from 'next/image';
import Link from 'next/link';

export function About() {
  return (
    <section className="w-full py-12">
      <h2 className="text-2xl font-semibold text-black text-center md:text-left dark:text-white mb-8">
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
            I'm a Staff Engineer, most recently at Uber, where I was the domain expert for video and was a founding member of the Ads team. I defined the engineering vision and architecture for video at scale across Uber. I led the team building Uber's first major video product; a key innovation in a highly competitive market. As a technical leader, I specializes in architecting scalable systems and driving 0-to-1 initiatives. When I'm not debugging code, you'll find me hiking trails and probably talking about my latest camping adventure.
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
