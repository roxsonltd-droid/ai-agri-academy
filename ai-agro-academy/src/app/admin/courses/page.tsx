"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Clock, ChevronRight, PlayCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

type Course = {
  id: string;
  title: string;
  description: string;
  modules: any[];
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [getToken]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Моите Курсове</h1>
          <p className="text-slate-400 mt-1">Управлявайте вашето образователно съдържание</p>
        </div>
        <Link 
          href="/admin/courses/new" 
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
        >
          <Plus className="w-5 h-5" />
          Създай Курс
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Нямате създадени курсове</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Вашата академия е празна. Започнете като създадете първия си курс и добавите уроци към него.
          </p>
          <Link 
            href="/admin/courses/new" 
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Създай първи курс
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            const modulesCount = course.modules?.length || 0;
            const lessonsCount = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
            
            return (
              <div key={course.id} className="group relative bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] flex flex-col">
                <div className="aspect-video bg-slate-800 relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-700" />
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{modulesCount} Модула</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>{lessonsCount} Урока</span>
                    </div>
                  </div>
                </div>
                
                <Link href={`/admin/courses/${course.id}`} className="absolute inset-0 z-20">
                  <span className="sr-only">Редактирай {course.title}</span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
