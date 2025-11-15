"use client";

import { FaChevronDown } from "react-icons/fa6";

export function ScrollArrow() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToContent}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce cursor-pointer hover:opacity-80 transition-opacity"
      aria-label="Scroll to content"
    >
      <FaChevronDown className="text-white text-2xl" />
    </button>
  );
}
