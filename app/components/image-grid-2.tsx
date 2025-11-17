import { ReactNode, Children } from 'react';

interface ImageGrid2Props {
  children: ReactNode;
}

/**
 * ImageGrid2 - Displays 2 images side by side with equal width
 *
 * Expected image order:
 * - Image 1: Landscape (1/2 width)
 * - Image 2: Landscape (1/2 width)
 *
 * Layout:
 * [Image 1 (50%)] [Image 2 (50%)]
 */
export function ImageGrid2({ children }: ImageGrid2Props) {
  const images = Children.toArray(children);

  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      <div>{images[0]}</div>
      <div>{images[1]}</div>
    </div>
  );
}
