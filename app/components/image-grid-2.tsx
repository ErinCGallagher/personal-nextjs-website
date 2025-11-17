import { ReactNode, Children } from 'react';

interface ImageGrid2Props {
  children: ReactNode;
}

export function ImageGrid2({ children }: ImageGrid2Props) {
  const images = Children.toArray(children);

  return (
    <div className="grid grid-cols-2 gap-4 my-6">
      <div>{images[0]}</div>
      <div>{images[1]}</div>
    </div>
  );
}
