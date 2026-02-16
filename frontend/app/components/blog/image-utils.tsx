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
