"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Video, FileText, Settings, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Зареждане...</div>;
  }

  // Check if it's the admin
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "lukezester@gmail.com";

  if (!user || !isAdmin) {
    redirect("/"); // Not an admin
  }

  const navItems = [
    { name: "Табло", href: "/admin", icon: LayoutDashboard },
    { name: "Курсове", href: "/admin/courses", icon: BookOpen },
    { name: "Файлове (R2)", href: "/admin/files", icon: FileText },
    { name: "Видеа (Stream)", href: "/admin/videos", icon: Video },
    { name: "Настройки", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F19]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-slate-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-500" />
            Admin Panel
          </h2>
          <p className="text-xs text-slate-400 mt-1">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-medium"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-white/10 bg-slate-900/50 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-white">Admin Panel</h2>
        </div>
        
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
