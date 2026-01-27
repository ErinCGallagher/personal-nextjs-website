import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-50 backdrop-blur-sm dark:bg-black/60 pt-16">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-center">
        <SocialLinks
          size={24}
          gap="gap-8"
          className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        />
      </div>
    </footer>
  );
}
