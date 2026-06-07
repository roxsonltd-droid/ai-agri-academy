"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, Sprout, ChevronDown, User, FileText, Video, Bell, LogOut, Settings as SettingsIcon, X, Trash2, ShieldAlert, CloudRain, LineChart } from "lucide-react";
import { GlobalSearchBar } from "./global-search";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { easeCinematic, transitionCinematic } from "@/lib/motion";
import { AiAvatar } from "@/components/ai-avatar";

export type Notification = {
  id: string;
  type: "weather" | "market" | "system";
  message: string;
  date: string;
  read: boolean;
};

export default function Navbar() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  
  // Notifications State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    queueMicrotask(() => {
      setIsAuthenticated(Boolean(token));
      setIsPro(localStorage.getItem("agro_pro") === "true");
    });

    // Load notifications
    const loadNotifications = () => {
      try {
        const saved = localStorage.getItem("agro_notifications");
        if (saved) {
          setNotifications(JSON.parse(saved));
        }
      } catch (e) {}
    };

    loadNotifications();

    // Custom event listener for when another component adds a notification
    window.addEventListener("agro_notifications_updated", loadNotifications);
    
    const checkProStatus = () => setIsPro(localStorage.getItem("agro_pro") === "true");
    window.addEventListener("agro_pro_updated", checkProStatus);
    
    return () => {
      window.removeEventListener("agro_notifications_updated", loadNotifications);
      window.removeEventListener("agro_pro_updated", checkProStatus);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("agro_notifications", JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem("agro_notifications", "[]");
    setShowNotifications(false);
  };

  const hiddenRoutes = ["/faculty/agromind", "/login", "/register", "/sign-in", "/sign-up"];
  if (hiddenRoutes.includes(pathname || "")) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { name: "AI Command Center", href: "/dashboard", className: "text-emerald-400 font-bold" },
    { name: "FIELDLOT Пазар", href: "/marketplace", className: "text-amber-400 font-bold" },
    { name: "Финанси", href: "/finance" },
    { name: "Дигитален Паспорт", href: "/passport" },
    { name: "Метеорология", href: "/weather" },
    { name: "Сателити", href: "/satellite" },
    { name: "Курсове", href: "/courses" },
    { name: "AI Факултет", href: "/faculty/agromind" },
    { name: "Лаборатории", href: "/labs" },
    { name: "Агенти 24/7", href: "/agents" },
    { name: "Фондове & Чат", href: "/chat", className: "text-emerald-400 font-bold" },
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
{/* Left: Mobile Menu Toggle & Logo & Desktop Nav */}
        <div className="flex items-center gap-6 xl:gap-8 z-10 shrink-0">

          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-1 text-slate-300 hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <AiAvatar size="sm" className="shrink-0" />
                <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
                  Agro<span className="text-primary">Academy</span>
                </span>
              </Link>
              {isPro && (
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ml-1 shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  PRO
                </span>
              )}
            </div>
          </div>
          
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.slice(0, 6).map((link) => (
              <Link key={link.href} href={link.href} className={`${desktopNavLinkStyle} ${link.className || ''}`}>
                {link.name}
              </Link>
            ))}
            <div className="relative group">
              <button className={`${desktopNavLinkStyle} flex items-center`}>
                Още <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2 z-50">
                {navLinks.slice(6).map((link) => (
                  <Link key={link.href} href={link.href} className={`px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors ${link.className || ''}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden lg:flex xl:hidden items-center gap-1">
            {navLinks.slice(0, 4).map((link) => (
              <Link key={link.href} href={link.href} className={`${desktopNavLinkStyle} ${link.className || ''}`}>
                {link.name}
              </Link>
            ))}
            <div className="relative group">
              <button className={`${desktopNavLinkStyle} flex items-center`}>
                Още <ChevronDown className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2 z-50">
                {navLinks.slice(4).map((link) => (
                  <Link key={link.href} href={link.href} className={`px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors ${link.className || ''}`}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl mx-8">
          <div className="w-full">
            <GlobalSearchBar />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end flex-1 gap-2 sm:gap-4 z-10">
          <Button variant="ghost" className="hidden md:flex text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
            <span className="mr-2">🌐</span> <span>Български</span>
          </Button>

          {!isAuthenticated && (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-slate-300 hover:text-white text-sm font-medium px-2 sm:px-4">
                  Вход
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 sm:px-5 py-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap">
                  Започни безплатно
                </Button>
              </SignInButton>
            </>
          )}

          {isAuthenticated && (
            <>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10" 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) markAllAsRead();
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                )}
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-slate-700 bg-slate-950 flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm">Известия</h3>
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Нямате нови известия</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-800">
                          {notifications.slice().reverse().map((notif) => (
                            <div key={notif.id} className={`p-4 transition-colors hover:bg-slate-800/50 ${!notif.read ? 'bg-primary/5' : ''}`}>
                              <div className="flex gap-3">
                                <div className="shrink-0 mt-0.5">
                                  {notif.type === 'weather' && <CloudRain className="w-5 h-5 text-blue-400" />}
                                  {notif.type === 'market' && <LineChart className="w-5 h-5 text-emerald-400" />}
                                  {notif.type === 'system' && <ShieldAlert className="w-5 h-5 text-amber-400" />}
                                </div>
                                <div>
                                  <p className="text-sm text-slate-200 leading-snug">{notif.message}</p>
                                  <p className="text-xs text-slate-500 mt-1">{new Date(notif.date).toLocaleString('bg-BG')}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Link href="/admin/courses">
               <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-sm font-medium px-2 sm:px-4 border border-emerald-500/20 rounded-full">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Админ Панел</span>
               </Button>
            </Link>
            
            {/* New Buttons */}
            <Link href="/ads/create" className="ml-2">
                <Button variant="secondary" className="text-sm font-medium px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md">
                  Добави обява
                </Button>
              </Link>
              <Link href="/markets" className="ml-2">
                <Button variant="secondary" className="text-sm font-medium px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md">
                  Виж борсовите цени
                </Button>
              </Link>

            <UserButton appearance={{
              elements: {
                userButtonAvatarBox: "w-9 h-9 border border-white/10"
              }
            }} />
            </>
          )}
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
