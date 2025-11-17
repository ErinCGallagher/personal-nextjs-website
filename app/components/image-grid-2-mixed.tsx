import { ReactNode, Children } from 'react';

interface ImageGrid2MixedProps {
  children: ReactNode;
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
 */
export function ImageGrid2Mixed({ children }: ImageGrid2MixedProps) {
  const images = Children.toArray(children);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="md:col-span-2">{images[0]}</div>
      <div className="md:col-span-1 md:flex md:items-center">{images[1]}</div>
    </div>
  );
}
