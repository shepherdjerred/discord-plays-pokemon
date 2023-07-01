import "twin.macro";
import { ReactNode } from "react";

export function Notifications({ children }: { children: ReactNode }) {
  return <div tw="fixed top-0 right-0 w-1/4 flex flex-col gap-3 m-4">{children}</div>;
}
