import { ReactNode, Children } from 'react';

interface ImageGrid4Props {
  children: ReactNode;
}

/**
 * ImageGrid4 - Displays 4 images in an alternating asymmetric layout
 * Note: On mobile it stacks the images vertically
 *
 * Expected image order:
 * - Image 1: Landscape (2/3 width)
 * - Image 2: Portrait (1/3 width, vertically centered)
 * - Image 3: Portrait (1/3 width, vertically centered)
 * - Image 4: Landscape (2/3 width)
 *
 * Layout:
 * Row 1: [Landscape (2/3)] [Portrait (1/3)]
 * Row 2: [Portrait (1/3)] [Landscape (2/3)]
 */
export function ImageGrid4({ children }: ImageGrid4Props) {
  const images = Children.toArray(children);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="md:col-span-2">{images[0]}</div>
      <div className="md:col-span-1 md:flex md:items-center">{images[1]}</div>
      <div className="md:col-span-1 md:flex md:items-center">{images[2]}</div>
      <div className="md:col-span-2">{images[3]}</div>
    </div>
  );
}
