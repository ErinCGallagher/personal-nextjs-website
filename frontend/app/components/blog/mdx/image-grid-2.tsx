import { ReactNode } from "react";
import { addRoundedCornersToImages } from "./image-utils";

interface ImageGrid2Props {
  children: ReactNode;
  description1?: string;
  description2?: string;
}

/**
 * ImageGrid2 - Displays 2 images side by side with equal width
 * Note: On mobile it stacks the images vertically
 *
 * Expected image order:
 * - Image 1: Landscape (1/2 width)
 * - Image 2: Landscape (1/2 width)
 *
 * Layout:
 * [Image 1 (50%)] [Image 2 (50%)]
 *
 * Optional: description1 and description2 display italic captions below each image.
 */
export function ImageGrid2({ children, description1, description2 }: ImageGrid2Props) {
  const images = addRoundedCornersToImages(children);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <div>
        {images[0]}
        {description1 && <p className="image-description text-center italic !mt-2">{description1}</p>}
      </div>
      <div>
        {images[1]}
        {description2 && <p className="image-description text-center italic !mt-2">{description2}</p>}
      </div>
    </div>
  );
}
