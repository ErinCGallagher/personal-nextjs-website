import { ReactNode, Children, ReactElement, isValidElement } from 'react';

interface ImageGridProps {
  children: ReactNode;
}

export function ImageGrid({ children }: ImageGridProps) {
  const childArray = Children.toArray(children);

  // Flatten children - MDX might wrap images in <p> tags
  const flattenedChildren: ReactNode[] = [];
  childArray.forEach((child) => {
    if (isValidElement(child)) {
      const element = child as ReactElement;
      // If it's a paragraph with children, extract the children
      if (element.type === 'p' && element.props.children) {
        const pChildren = Children.toArray(element.props.children);
        flattenedChildren.push(...pChildren);
      } else {
        flattenedChildren.push(child);
      }
    }
  });

  // Filter out text nodes and only keep valid React elements (images)
  const images = flattenedChildren.filter((child) => {
    return isValidElement(child) && typeof child !== 'string';
  });

  return (
    <div className="grid grid-cols-3 gap-4 my-6">
      <div className="col-span-2">
        {images[0]}
      </div>
      <div className="col-span-1 flex items-center">
        {images[1]}
      </div>
      <div className="col-span-1 flex items-center">
        {images[2]}
      </div>
      <div className="col-span-2">
        {images[3]}
      </div>
    </div>
  );
}
