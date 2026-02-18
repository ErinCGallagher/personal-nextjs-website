import { ReactNode } from "react";
import { addRoundedCornersToImages } from "./image-utils";

interface ImageGrid2MixedProps {
  children: ReactNode;
  description1?: string;
  description2?: string;
}

/**
 * ImageGrid2Mixed - Displays 2 images with landscape on left, portrait on right
 * Note: On mobile it stacks the images vertically
 *
 * Expected image order:
 * - Image 1: Landscape (2/3 width)
 * - Image 2: Portrait (1/3 width, vertically centered)
 *
 * Layout:
 * [Landscape (2/3)] [Portrait (1/3)]
 *
 * Optional: description1 and description2 display italic captions below each image.
 */
export function ImageGrid2Mixed({ children, description1, description2 }: ImageGrid2MixedProps) {
  const images = addRoundedCornersToImages(children);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="md:col-span-2">
        {images[0]}
        {description1 && <p className="image-description text-center italic !mt-2">{description1}</p>}
      </div>
      <div className="md:col-span-1 md:flex md:flex-col md:justify-center">
        {images[1]}
        {description2 && <p className="image-description text-center italic !mt-2">{description2}</p>}
      </div>
    </div>
  );
}
