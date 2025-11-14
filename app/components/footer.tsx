import Link from "next/link"
import { SiGithub, SiYoutube, SiLinkedin } from "react-icons/si"

export default function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-sm border-t border-gray-200 dark:bg-black/60 dark:border-white/5 mt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-center gap-8">
        <Link
          href="https://github.com/ErinCGallagher"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="GitHub"
        >
          <SiGithub size={24} />
        </Link>
        <Link
          href="https://www.youtube.com/@trailtalestravel/featured"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="YouTube"
        >
          <SiYoutube size={24} />
        </Link>
        <Link
          href="https://www.linkedin.com/in/eringallagher3/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
          aria-label="LinkedIn"
        >
          <SiLinkedin size={24} />
        </Link>
      </div>
    </footer>
  )
}
