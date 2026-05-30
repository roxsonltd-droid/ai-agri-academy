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
        <div className="flex items-center gap-2">
          <AiAvatar size="sm" className="shrink-0" />
          <span className="text-xl font-bold tracking-tight text-white">
            Agro<span className="text-primary">Academy</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 absolute left-1/2 -translate-x-1/2">
          <Link href="/courses" className={navLink}>Курсове</Link>
          <Link href="/faculty/agromind" className={navLink}>AI Факултет</Link>
          <Link href="/labs" className={navLink}>Лаборатории</Link>
          <Link href="/knowledge" className={navLink}>База Знания</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex text-slate-300 hover:text-white text-sm font-medium">
            <span className="mr-2">🌐</span> Български
          </Button>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium">
                Моят профил
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium">
                Вход
              </Button>
            </Link>
          )}
          <Link href="/register">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-5 py-2 font-medium text-sm transition-all">
              Започни безплатно &rarr;
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Gradient Banner underneath */}
      <motion.div 
        className="w-full bg-gradient-to-r from-[#6366f1] via-[#3b82f6] to-[#06b6d4] py-3 px-4 flex items-center justify-center gap-4 shadow-md"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="text-white font-medium text-sm hidden sm:block">
          Всички Агро AI Инструменти. Една Платформа. Нулеви Усилия.
        </span>
        <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-slate-100 rounded-full font-bold px-4 h-8 text-xs">
          Опитай Академията Безплатно &rarr;
        </Button>
      </motion.div>
    </div>
  );
}
