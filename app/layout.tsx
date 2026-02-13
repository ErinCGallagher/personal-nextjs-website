import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Erin Gallagher | Travel & Hiking Blog",
    template: "%s | Erin Gallagher",
  },
  description: "Trail guides, trip itineraries, and talks on tech and adventure.",
  metadataBase: new URL("https://www.egallagher.com"),
  openGraph: {
    type: "website",
    siteName: "Erin Gallagher",
    title: "Erin Gallagher | Travel & Hiking Blog",
    description: "Trail guides, trip itineraries, and talks on tech and adventure.",
    images: ["/icons/trail-tales-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Erin Gallagher | Travel & Hiking Blog",
    description: "Trail guides, trip itineraries, and talks on tech and adventure.",
    images: ["/icons/trail-tales-logo.png"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Erin Gallagher",
  url: "https://www.egallagher.com",
  description: "Trail guides, trip itineraries, and talks on tech and adventure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased`}
      >
        {/* dangerouslySetInnerHTML is the only way to set inline script content in React.
            It is safe here because the content is hardcoded JSON, not user input. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Header />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
