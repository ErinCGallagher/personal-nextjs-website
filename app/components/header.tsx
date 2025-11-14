"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname() || "/"

  const links = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/game", label: "Game" },
  ]

  return (
    <header className="w-full bg-white/60 backdrop-blur-sm border-b border-gray-200 dark:bg-black/60 dark:border-white/5">
      <nav className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">
            Erin Gallagher
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors " +
                  (active
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5")
                }
              >
                {l.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
