import { ReactNode, Children } from 'react';

interface ImageGrid4Props {
  children: ReactNode;
}

export function ImageGrid4({ children }: ImageGrid4Props) {
  const images = Children.toArray(children);

  return (
    <div className="grid grid-cols-3 gap-4 my-6">
      <div className="col-span-2">{images[0]}</div>
      <div className="col-span-1 flex items-center">{images[1]}</div>
      <div className="col-span-1 flex items-center">{images[2]}</div>
      <div className="col-span-2">{images[3]}</div>
    </div>
  );
}
