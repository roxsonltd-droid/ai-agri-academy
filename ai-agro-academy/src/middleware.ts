import type { NextMiddleware } from "next/server";
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/knowledge(.*)",
]);

const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const enforce = process.env.NEXT_PUBLIC_CLERK_ENFORCE === "true";

const withClerk: NextMiddleware | null =
  pk && enforce
    ? clerkMiddleware(async (auth, req) => {
        if (isProtected(req)) {
          await auth.protect();
        }
      })
    : null;

const middleware: NextMiddleware = (req, ev) => {
  if (!withClerk) {
    return NextResponse.next();
  }
  return withClerk(req, ev);
};

export default middleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
