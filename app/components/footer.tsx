import SocialLinks from "./social-links";

export default function Footer() {
  return (
    <footer className="w-full backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-center">
        <SocialLinks size={24} gap="gap-8" className="text-foreground hover:text-foreground/90" />
      </div>
    </footer>
  );
}
