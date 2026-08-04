import type { ReactNode } from "react";

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}
