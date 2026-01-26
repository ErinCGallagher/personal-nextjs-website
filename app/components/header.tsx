"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname() || "/"

  const links = [
    { href: "/", label: "Home" },
    { href: "/speaking", label: "Speaking" },
    // { href: "/blog", label: "Blog" },
    { href: "/game", label: "Game" },
  ]
  // Make header transparent and sit over the page on all routes
  const headerClass = "absolute top-0 left-0 w-full z-20"

  return (
    <header className={headerClass}>
      <nav className="w-full px-6 py-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href
            const linkBase =
              "px-3 py-2 rounded-md text-sm font-medium transition-colors text-white drop-shadow-md"

            const linkClass = active
              ? linkBase + " bg-white/10"
              : linkBase + " hover:bg-white/10"

            // Hide non-Home links on mobile
            const hideOnMobile = l.href !== "/" ? " hidden md:block" : ""
            
            return (
              <Link key={l.href} href={l.href} className={linkClass + hideOnMobile}>
                {l.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
