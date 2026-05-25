"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { clerkPublishableKey } from "@/lib/auth-mode";

export function AppProviders({ children }: { children: ReactNode }) {
  if (!clerkPublishableKey) {
    return <>{children}</>;
  }
  return <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>;
}
