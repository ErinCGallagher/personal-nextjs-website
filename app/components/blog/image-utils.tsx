import { ReactNode, Children, cloneElement, isValidElement } from "react";

export function addRoundedCornersToImages(children: ReactNode): ReactNode[] {
  return Children.toArray(children).map((child) => {
    if (isValidElement(child)) {
      return cloneElement(child, {
        ...child.props,
        className: `rounded-lg ${child.props.className || ""}`,
      } as any);
    }
    return child;
  });
}
