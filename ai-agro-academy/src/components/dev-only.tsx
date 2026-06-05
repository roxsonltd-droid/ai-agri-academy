// src/components/dev-only.tsx

import { ReactNode } from "react";

export function DevOnly({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "development") {
    return <>{children}</>;
  }
  return null;
}
