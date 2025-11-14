import Link from "next/link";
import { SiGithub, SiYoutube, SiLinkedin } from "react-icons/si";

interface SocialLinksProps {
  size?: number;
  gap?: string;
  className?: string;
}

export default function SocialLinks({
  size = 24,
  gap = "gap-6",
  className = "",
}: SocialLinksProps) {
  return (
    <div className={`flex items-center justify-center ${gap} ${className}`}>
      <Link
        href="https://github.com/ErinCGallagher"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:opacity-80"
        aria-label="GitHub"
      >
        <SiGithub size={size} />
      </Link>
      <Link
        href="https://www.youtube.com/@trailtalestravel/featured"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:opacity-80"
        aria-label="YouTube"
      >
        <SiYoutube size={size} />
      </Link>
      <Link
        href="https://www.linkedin.com/in/eringallagher3/"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:opacity-80"
        aria-label="LinkedIn"
      >
        <SiLinkedin size={size} />
      </Link>
    </div>
  );
}
