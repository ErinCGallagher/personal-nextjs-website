/**
 * Table of contents generated from a post's headings. Highlights the active
 * section as the user scrolls. Renders inline on desktop and as a collapsible
 * on mobile.
 */
"use client";

import { slugify } from "../mdx/mdx";
import { useState, useEffect, useRef, useMemo } from "react";

type Heading = {
  text: string;
  slug: string;
};

function extractHeadings(source: string): Heading[] {
  const headingRegex = /^## (.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(source)) !== null) {
    const text = match[1].trim();
    headings.push({ text, slug: slugify(text) });
  }

  return headings;
}

type TableOfContentsProps = {
  source: string;
  variant?: "sidebar" | "collapsible";
};

export function TableOfContents({
  source,
  variant = "sidebar",
}: TableOfContentsProps) {
  const headings = useMemo(() => extractHeadings(source), [source]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const entryMapRef = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  useEffect(() => {
    if (headings.length === 0) return;

    // Map from DOM element (heading wrapper div) → slug for lookup in callbacks.
    // We observe the wrapper div rather than the anchor itself because the anchor
    // has no height and may not trigger intersection reliably.
    const elementToSlug = new Map<Element, string>();

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const slug = elementToSlug.get(entry.target);
        if (slug) entryMapRef.current.set(slug, entry);
      });

      // Prefer the first heading visible in the top portion of the viewport
      const visible = headings.find(
        (h) => entryMapRef.current.get(h.slug)?.isIntersecting
      );
      if (visible) {
        setActiveSlug(visible.slug);
        return;
      }

      // Fall back to the last heading that has scrolled above the viewport
      const above = headings.filter((h) => {
        const entry = entryMapRef.current.get(h.slug);
        return entry && entry.boundingClientRect.top < 0;
      });
      if (above.length > 0) {
        setActiveSlug(above[above.length - 1].slug);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "0px 0px -85% 0px",
    });

    headings.forEach(({ slug }) => {
      const el = document.getElementById(slug)?.parentElement;
      if (el) {
        elementToSlug.set(el, slug);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const links = (
    <ul className="space-y-2">
      {headings.map((heading) => {
        const isActive = heading.slug === activeSlug;
        return (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              className={`text-base leading-snug block transition-all border-l-2 pl-2 ${
                isActive
                  ? "text-foreground font-medium translate-x-1 border-dark-grey"
                  : "text-dark-grey border-transparent hover:text-foreground hover:font-medium hover:translate-x-1"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "collapsible") {
    return (
      <details className="border-l-2 border-grey-blue pl-4 mb-6">
        <summary className="cursor-pointer text-lg font-semibold font-playfair text-dark-grey flex items-center gap-3 list-none [&::-webkit-details-marker]:hidden">
          Table of Contents
          {/* Outer span rotates on open; inner span bounces on mount — kept separate so transforms don't conflict */}
          <span className="toc-chevron-wrapper">
            <span className="toc-chevron-inner text-grey-blue text-2xl">▾</span>
          </span>
        </summary>
        <div className="mt-3">{links}</div>
      </details>
    );
  }

  return (
    <nav aria-label="Table of contents">
      <p className="text-2xl font-semibold font-playfair text-dark-grey mb-3">
        Table of Contents
      </p>
      {links}
    </nav>
  );
}
