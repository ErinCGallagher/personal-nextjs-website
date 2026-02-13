import { slugify } from "./mdx";

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
  const headings = extractHeadings(source);

  if (headings.length === 0) {
    return null;
  }

  const links = (
    <ul className="space-y-2">
      {headings.map((heading) => (
        <li key={heading.slug}>
          <a
            href={`#${heading.slug}`}
            className="text-base text-dark-grey hover:text-foreground hover:font-medium hover:translate-x-1 transition-all leading-snug block"
          >
            {heading.text}
          </a>
        </li>
      ))}
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
