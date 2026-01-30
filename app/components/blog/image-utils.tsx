import { ReactNode, Children, cloneElement, isValidElement, ReactElement } from "react";

export function addRoundedCornersToImages(children: ReactNode): ReactNode[] {
  return Children.toArray(children).map((child) => {
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown>;
      return cloneElement(child as ReactElement, {
        ...props,
        className: `rounded-lg ${props.className || ""}`,
      });
    }
    return child;
  });
}
