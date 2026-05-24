"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sprout, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);
  
  const hiddenRoutes = ["/faculty/agromind", "/login", "/register"];
  if (hiddenRoutes.includes(pathname || "")) {
    return null;
  }

  return (
    <nav className="absolute top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[#0A2540]">
            <path d="M12 22c4-4 4-10 0-14-4 4-4 10 0 14z" fill="currentColor" fillOpacity="0.1"/>
            <path d="M12 8c4-4 4-10 0-14-4 4-4 10 0 14z" transform="rotate(90 12 12)" />
          </svg>
          <span className="text-xl font-semibold tracking-tight text-[#0A2540]">AI Agro</span>
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link href="/courses" className="text-sm font-semibold text-[#425466] hover:text-[#0A2540] transition-colors">Курсове</Link>
          <Link href="/faculty" className="text-sm font-semibold text-[#425466] hover:text-[#0A2540] transition-colors">AI Факултет</Link>
          <Link href="/labs" className="text-sm font-semibold text-[#425466] hover:text-[#0A2540] transition-colors">Лаборатории</Link>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button className="bg-[#059669] hover:bg-[#047857] text-white rounded-full px-6 shadow-sm">
                  <User className="h-4 w-4 mr-2" />
                  Моят профил
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="text-sm font-semibold text-[#425466] hover:text-red-600 hover:bg-red-50 rounded-full px-4"
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
                <Button variant="ghost" className="text-sm font-semibold text-[#425466] hover:bg-[#F6F9FC]">Вход</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#0A2540] hover:bg-[#1a365d] text-white rounded-full px-6 shadow-sm">Регистрация &rarr;</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
