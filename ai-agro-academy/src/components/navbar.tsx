"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { clerkPublishableKey } from "@/lib/auth-mode";
import { easeCinematic, transitionCinematic } from "@/lib/motion";
import { AiAvatar } from "@/components/ai-avatar";

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    queueMicrotask(() => {
      setIsAuthenticated(Boolean(token));
    });
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const hiddenRoutes = ["/faculty/agromind", "/login", "/register", "/sign-in", "/sign-up"];
  if (hiddenRoutes.includes(pathname || "")) {
    return null;
  }

  const navLinks = [
    { name: "Курсове", href: "/courses" },
    { name: "AI Факултет", href: "/faculty/agromind" },
    { name: "Лаборатории", href: "/labs" },
    { name: "Агенти 24/7", href: "/agents" },
    { name: "База Знания", href: "/knowledge" },
    { name: "Спонсори", href: "/sponsors", className: "text-primary" },
  ];

  const desktopNavLinkStyle = "nav-link-futuristic text-sm font-medium text-slate-300 hover:text-white rounded-md px-3 py-2 transition-colors";
  const mobileNavLinkStyle = "block px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors";

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col">
      {/* Top Navbar */}
      <motion.nav
        className="w-full bg-[#0B0F19] border-b border-white/5 flex items-center px-4 md:px-8 py-4 justify-between relative z-50"
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { ...transitionCinematic, ease: easeCinematic }}
      >
        {/* Left: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          <button 
            className="lg:hidden p-1 text-slate-300 hover:text-white focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <AiAvatar size="sm" className="shrink-0" />
            <span className="text-xl font-bold tracking-tight text-white">
              Agro<span className="text-primary">Academy</span>
            </span>
          </Link>
        </div>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center justify-center flex-1 gap-4 z-0 px-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`${desktopNavLinkStyle} ${link.className || ''}`}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 z-10 shrink-0">
          <Button variant="ghost" className="hidden md:flex text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
            <span className="mr-2">🌐</span> <span>Български</span>
          </Button>
          
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
                <span className="hidden sm:inline">Моят профил</span>
                <span className="sm:hidden">Профил</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
                Вход
              </Button>
            </Link>
          )}
          
          <Link href="/register">
            <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 sm:px-5 py-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap">
              {isAuthenticated ? "Напред" : "Започни безплатно"}
            </Button>
          </Link>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-[#0B0F19] border-b border-white/10 shadow-2xl z-40 px-4 py-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex flex-col space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`${mobileNavLinkStyle} ${link.className || ''}`}>
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
              <Button variant="ghost" className="justify-start text-slate-300 hover:text-white hover:bg-white/5">
                <span className="mr-2">🌐</span> Български
              </Button>
              {!isAuthenticated && (
                <Link href="/login" className="w-full">
                  <Button variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5">
                    Вход
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
