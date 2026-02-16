"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname() || "/";
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const isHomePage = pathname === "/";
  const isBlogPost = pathname.startsWith("/blog/") && pathname !== "/blog";

  useEffect(() => {
    const handleScroll = () => {
      // Hero is 90vh on mobile, 100vh on desktop for home page
      // 500px for blog post pages
      const heroHeight = isBlogPost ? 500 : window.innerHeight * 0.9;
      setScrolledPastHero(window.scrollY > heroHeight - 60);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBlogPost]);

  const useDarkText = (!isHomePage && !isBlogPost) || scrolledPastHero;

  const links = [
    { href: "/", label: "Home", mobile: true },
    { href: "/talks", label: "Talks", mobile: true },
    { href: "/blog", label: "Blog", mobile: true },
    { href: "/game", label: "Game", mobile: false },
  ];
  // Make header transparent and sit over the page on all routes
  const headerClass = "fixed top-0 left-0 w-full z-20";

  return (
    <header className={headerClass}>
      <nav className="w-full px-6 py-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href;
            const linkBase = useDarkText
              ? "px-3 py-2 rounded-md text-sm font-medium transition-colors text-zinc-900"
              : "px-3 py-2 rounded-md text-sm font-medium transition-colors text-white drop-shadow-md";

            const activeClass = useDarkText
              ? " bg-zinc-900/10"
              : " bg-white/10";
            const hoverClass = useDarkText
              ? " hover:bg-zinc-900/10"
              : " hover:bg-white/10";

            const linkClass = active
              ? linkBase + activeClass
              : linkBase + hoverClass;

            // Hide links on mobile if mobile is false
            const hideOnMobile = !l.mobile ? " hidden md:block" : "";

            return (
              <Link
                key={l.href}
                href={l.href}
                className={linkClass + hideOnMobile}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
