"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, PlayCircle, Plus, Edit2, FileText, Settings, Trash2 } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  duration: string;
  video_id: string;
  completed: boolean;
  content: string;
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  modules: Module[];
};

export default function AdminCourseDetailsPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCourse(data);
        } else {
          router.push("/admin/courses");
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id, getToken, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) return null;

  const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link 
            href="/admin/courses" 
            className="mt-1 p-2 bg-slate-900/50 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white border border-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{course.title}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 mt-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                <BookOpen className="w-4 h-4" />
                {course.modules?.length || 0} Модула
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                <FileText className="w-4 h-4" />
                {totalLessons} Теми/Урока
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors border border-slate-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Учебно съдържание
          </h2>
          <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            <Plus className="w-4 h-4" /> Добави Модул
          </button>
        </div>

        {(!course.modules || course.modules.length === 0) ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Курсът е празен</h3>
            <p className="text-slate-400 text-sm mb-6">Добавете първия модул, за да започнете да изграждате структурата.</p>
            <button className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all">
              <Plus className="w-4 h-4" />
              Създай Модул
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {course.modules.map((module, mIdx) => (
              <div key={module.id} className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-800/50 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-semibold text-white">Модул {mIdx + 1}: {module.title}</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Добави урок">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Редактирай">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="Изтрий">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-slate-800/50">
                  {(!module.lessons || module.lessons.length === 0) ? (
                    <div className="px-5 py-6 text-center text-sm text-slate-500">
                      Няма добавени теми в този модул.
                    </div>
                  ) : (
                    module.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="px-5 py-4 flex items-center justify-between group hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-400 border border-slate-700">
                            {lIdx + 1}
                          </div>
                          <div>
                            <h4 className="text-slate-200 font-medium group-hover:text-emerald-400 transition-colors">{lesson.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {lesson.duration}
                              </span>
                              {lesson.video_id && (
                                <span className="flex items-center gap-1 text-blue-400/80">
                                  <PlayCircle className="w-3.5 h-3.5" />
                                  Видео
                                </span>
                              )}
                              {lesson.content && (
                                <span className="flex items-center gap-1 text-emerald-400/80">
                                  <FileText className="w-3.5 h-3.5" />
                                  Текст ({lesson.content.length} знака)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors border border-slate-700">
                            Редактирай
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
