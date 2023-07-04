import { ReactNode } from "react";
import "twin.macro";

export function Container({ children }: { children: ReactNode }) {
  return <div tw="mx-auto max-w-4xl sm:px-6 lg:px-8">{children}</div>;
}
