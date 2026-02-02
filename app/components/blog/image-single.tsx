import { ReactNode } from "react";
import { addRoundedCornersToImages } from "./image-utils";

interface ImageSingleProps {
  children: ReactNode;
}

/**
 * ImageSingle - Displays a single image centered with constrained width
 * Useful for smaller standalone images that shouldn't span full width
 */
export function ImageSingle({ children }: ImageSingleProps) {
  const images = addRoundedCornersToImages(children);

  return (
    <div className="flex justify-center my-6">
      <div className="max-w-sm">{images[0]}</div>
    </div>
  );
}
