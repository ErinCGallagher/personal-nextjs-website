import { ReactNode } from "react";
import { addRoundedCornersToImages } from "./image-utils";

interface ImageSingleProps {
  children: ReactNode;
}

/**
 * ImageSingleVertical - Displays a single portrait image centered with constrained width
 */
export function ImageSingleVertical({ children }: ImageSingleProps) {
  const images = addRoundedCornersToImages(children);

  return (
    <div className="flex justify-center my-6">
      <div className="max-w-sm">{images[0]}</div>
    </div>
  );
}

/**
 * ImageSingleHorizontal - Displays a single landscape image centered with wider constrained width
 */
export function ImageSingleHorizontal({ children }: ImageSingleProps) {
  const images = addRoundedCornersToImages(children);

  return (
    <div className="flex justify-center my-6">
      <div className="max-w-2xl">{images[0]}</div>
    </div>
  );
}
