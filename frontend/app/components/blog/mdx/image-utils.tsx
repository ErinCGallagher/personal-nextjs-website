/**
 * Shared utility for MDX image grid components. Applies rounded corners to
 * child image elements without requiring each grid to duplicate the logic.
 */
import { ReactNode, Children, cloneElement, isValidElement, ReactElement } from "react";

export function addRoundedCornersToImages(children: ReactNode): ReactNode[] {
  return Children.toArray(children).map((child) => {
    if (isValidElement(child)) {
      return cloneElement(child as ReactElement<any>, {
        className: `rounded-lg ${(child.props as any).className || ""}`,
      });
    }
    return child;
  });
}
