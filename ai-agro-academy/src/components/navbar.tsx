"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { clerkPublishableKey } from "@/lib/auth-mode";
import { easeCinematic, transitionCinematic } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AiAvatar } from "@/components/ai-avatar";

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    queueMicrotask(() => {
      setIsAuthenticated(Boolean(token));
    });
  }, []);

  const hiddenRoutes = ["/faculty/agromind", "/login", "/register", "/sign-in", "/sign-up"];
  if (hiddenRoutes.includes(pathname || "")) {
    return null;
  }

  const showClerkLink = Boolean(clerkPublishableKey);

  const navLink =
    "nav-link-futuristic text-sm font-semibold text-muted-foreground rounded-full px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 sm:px-5 sm:pt-5">
      <motion.nav
        layout
        className={cn(
          "pointer-events-auto w-full max-w-5xl rounded-full glass-float px-2 py-2 sm:px-3",
          "transition-shadow duration-slow ease-cinematic hover:shadow-[0_0_60px_-20px_rgb(45_212_191/0.2)]",
        )}
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion ? { duration: 0 } : { ...transitionCinematic, ease: easeCinematic }
        }
      >
        <div className="flex h-12 items-center justify-between gap-2 sm:h-14 sm:gap-4 md:px-1">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-transform duration-normal ease-spring hover:scale-[1.02]"
          >
            <AiAvatar size="sm" className="shrink-0 shadow-md" />
            <span className="truncate bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-base font-semibold tracking-tight text-transparent sm:text-lg">
              AI Agro
            </span>
          </Link>
          <div className="hidden min-w-0 items-center gap-0.5 md:flex">
            <Link href="/courses" className={navLink}>
              Курсове
            </Link>
            <Link href="/faculty/agromind" className={navLink}>
              AI Факултет
            </Link>
            <Link href="/labs" className={navLink}>
              Лаборатории
            </Link>
            <Link href="/labs/vision" className={navLink}>
              CV / Roboflow
            </Link>
            <Link href="/knowledge" className={navLink}>
              База знания
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {showClerkLink && (
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border/60 bg-card/40 text-xs backdrop-blur-sm transition-all duration-normal ease-cinematic hover:border-primary/40 hover:bg-primary/10 hover:text-primary sm:text-sm"
                >
                  Clerk
                </Button>
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="rounded-full px-4 shadow-md transition-transform duration-normal ease-spring hover:-translate-y-0.5 sm:px-5 glow-primary"
                  >
                    <User className="mr-1.5 h-4 w-4" />
                    <span className="hidden sm:inline">Моят профил</span>
                    <span className="sm:hidden">Профил</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "rounded-full px-2 text-xs font-semibold text-muted-foreground sm:px-3 sm:text-sm",
                    "transition-colors duration-normal hover:bg-destructive/15 hover:text-destructive",
                  )}
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }}
                >
                  Изход
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-xs font-semibold sm:text-sm"
                  >
                    Вход
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="neon"
                    size="sm"
                    className="rounded-full px-4 shadow-md transition-transform duration-normal ease-spring hover:-translate-y-0.5 sm:px-5"
                  >
                    Регистрация →
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
