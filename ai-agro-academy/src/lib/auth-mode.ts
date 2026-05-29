export const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export const clerkEnforced =
  process.env.NEXT_PUBLIC_CLERK_ENFORCE === "true" && Boolean(clerkPublishableKey);
