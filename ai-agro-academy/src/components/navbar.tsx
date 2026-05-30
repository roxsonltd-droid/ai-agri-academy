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
    "nav-link-futuristic text-sm font-medium text-slate-300 hover:text-white rounded-md px-3 py-2 transition-colors";

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col">
      {/* Top Navbar */}
      <motion.nav
        className="w-full bg-[#0B0F19] border-b border-white/5 flex items-center px-4 md:px-8 py-4 justify-between"
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { ...transitionCinematic, ease: easeCinematic }}
      >
        {/* Left: Logo */}
        <div className="flex items-center gap-2 z-10 shrink-0">
          <AiAvatar size="sm" className="shrink-0" />
          <span className="text-xl font-bold tracking-tight text-white">
            Agro<span className="text-primary">Academy</span>
          </span>
        </div>

        {/* Center: Links (hidden on smaller screens to prevent overlap) */}
        <div className="hidden lg:flex items-center justify-center flex-1 gap-4 z-0 px-4">
          <Link href="/courses" className={navLink}>Курсове</Link>
          <Link href="/faculty/agromind" className={navLink}>AI Факултет</Link>
          <Link href="/labs" className={navLink}>Лаборатории</Link>
          <Link href="/knowledge" className={navLink}>База Знания</Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 z-10 shrink-0">
          <Button variant="ghost" className="hidden md:flex text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
            <span className="mr-2">🌐</span> <span className="hidden sm:inline">Български</span>
          </Button>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
                <span className="hidden sm:inline">Моят профил</span>
                <span className="sm:hidden">Профил</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
                Вход
              </Button>
            </Link>
          )}
          <Link href="/register">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 sm:px-5 py-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap">
              Започни безплатно &rarr;
            </Button>
          </Link>
        </div>
      </motion.nav>
    </div>
  );
}
