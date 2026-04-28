import { ReactNode } from "react";
import { addRoundedCornersToImages } from "./image-utils";

interface ImageSingleProps {
  children: ReactNode;
  description1?: string;
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
export function ImageSingleHorizontal({ children, description1 }: ImageSingleProps) {
  const images = addRoundedCornersToImages(children);

  return (
    <div className="flex justify-center my-6">
      <div className="max-w-2xl">
        {images[0]}
        {description1 && <p className="image-description text-center italic !mt-2">{description1}</p>}
      </div>
    </div>
  );
}
