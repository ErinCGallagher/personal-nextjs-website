/**
 * Client component wrapper that adds image lightbox functionality to blog posts.
 * Wraps server-rendered MDX content and provides click handlers for images to open in a modal.
 */
"use client";

import { useState, useEffect, ReactNode } from "react";
import { ImageModal } from "./image-modal";

interface BlogContentProps {
  children: ReactNode;
}

export function BlogContent({ children }: BlogContentProps) {
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && target.closest("article")) {
        const img = target as HTMLImageElement;
        // Use getAttribute to get the relative path instead of the full URL
        const src = img.getAttribute("src") || img.src;
        setModalImage({ src, alt: img.alt });
      }
    };

    document.addEventListener("click", handleImageClick);
    return () => document.removeEventListener("click", handleImageClick);
  }, []);

  return (
    <>
      {children}
      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </>
  );
}
