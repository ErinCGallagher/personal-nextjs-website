import SocialLinks from "./social-links"

export default function Footer() {
  return (
    <footer className="w-full bg-white/60 backdrop-blur-sm border-t border-gray-200 dark:bg-black/60 dark:border-white/5 mt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-center">
        <SocialLinks
          size={24}
          gap="gap-8"
          className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        />
      </div>
    </footer>
  )
}
