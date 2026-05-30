"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  BrainCircuit, 
  BookOpen, 
  PlayCircle, 
  Loader2, 
  Sparkles, 
  Tractor, 
  ShieldCheck, 
  CloudRain, 
  LineChart, 
  Award,
  ChevronRight,
  FlaskConical
} from "lucide-react";

type MeUser = {
  id?: string | number;
  email?: string;
  full_name?: string;
};

type CourseSummary = {
  id: string | number;
  title: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTopic, setNewTopic] = useState("");

  useEffect(() => {
    const fetchUserAndCourses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/auth/me`,  {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error("Invalid token");
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch courses
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/courses/`);
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
        }

        // Fetch local certificates
        try {
          const certs = JSON.parse(localStorage.getItem("agro_certificates") || "[]");
          setCertificates(certs);
        } catch(e) {}

      } catch {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndCourses();
  }, []);

  const handleGenerateCourse = async () => {
    if (!newTopic.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/courses/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: newTopic })
      });
      if (response.ok) {
        const newCourse = await response.json();
        setCourses([...courses, newCourse]);
        setNewTopic("");
      }
    } catch (error) {
      console.error("Error generating course:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 pt-20">
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1 text-white">
              Здравейте, {user?.full_name?.split(" ")[0] || "Колега"}
            </h1>
            <p className="text-slate-400">Добре дошли във вашия команден център.</p>
          </div>
          <Link href="/farm">
            <Button variant="outline" className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-white">
              <Tractor className="w-4 h-4 mr-2 text-emerald-400" />
              Моето Стопанство
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (Courses & Lab) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* AI Generator & Banner */}
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-2xl p-6 md:p-8">
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <BrainCircuit className="w-64 h-64 -mt-10 -mr-10" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Създай ново обучение</h2>
                </div>
                <p className="text-slate-400 mb-6 max-w-lg">
                  Въведете тема и AI Ректорът ще генерира персонален курс със съдържание, изпити и материали.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <input
                    type="text"
                    placeholder="Напр. Отглеждане на слънчоглед, Дронове..."
                    className="flex-1 h-12 px-5 rounded-xl border border-slate-700 bg-slate-900 shadow-inner text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateCourse()}
                  />
                  <Button
                    onClick={handleGenerateCourse}
                    disabled={isGenerating || !newTopic.trim()}
                    className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Генерирай Курс"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Courses Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-400" /> Моите Курсове
                </h2>
                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {courses.length} активни
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-600 transition-colors group">
                    <h3 className="font-bold text-white mb-3 text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2 h-12">
                      {course.title}
                    </h3>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4">
                      <div className="bg-primary h-1.5 rounded-full w-0 transition-all" />
                    </div>
                    <Link href={`/courses/${course.id}`} className="block">
                      <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white justify-between">
                        Продължи <ChevronRight className="w-4 h-4 text-slate-500" />
                      </Button>
                    </Link>
                  </div>
                ))}
                
                {courses.length === 0 && (
                  <div className="col-span-1 sm:col-span-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
                    <p className="text-slate-500">Все още нямате записани курсове.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Sidebar Area (Agents, Certificates, Quick Links) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Fast Action Banners */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/faculty/agromind" className="block">
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors text-center cursor-pointer">
                  <BrainCircuit className="w-6 h-6 text-primary mx-auto mb-2" />
                  <span className="text-xs font-bold text-white uppercase block">Ректорат</span>
                </div>
              </Link>
              <Link href="/labs/vision" className="block">
                <div className="p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors text-center cursor-pointer">
                  <FlaskConical className="w-6 h-6 text-accent mx-auto mb-2" />
                  <span className="text-xs font-bold text-white uppercase block">AI Лаборатория</span>
                </div>
              </Link>
            </div>

            {/* My Agents Widget */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center text-sm">
                  <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> 
                  Активни Агенти
                </h3>
                <Link href="/agents" className="text-xs text-primary hover:underline">
                  Mission Control
                </Link>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
                  <div className="flex items-center gap-3">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">Време</span>
                  </div>
                  <span className="flex items-center text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                    Внимание
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950">
                  <div className="flex items-center gap-3">
                    <LineChart className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-300">Пазари</span>
                  </div>
                  <span className="flex items-center text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                    Мониторинг
                  </span>
                </div>
              </div>
            </div>

            {/* My Certificates Widget */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center text-sm">
                  <Award className="w-4 h-4 mr-2 text-amber-400" /> 
                  Дипломи и Сертификати
                </h3>
              </div>
              <div className="p-4">
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <Link key={cert.id} href={`/certificate?course=${encodeURIComponent(cert.courseName)}`} className="block">
                        <div className="flex items-center p-3 rounded-lg border border-slate-800 bg-slate-950 hover:border-amber-500/50 transition-colors group">
                          <Award className="w-8 h-8 text-amber-500 mr-3 group-hover:scale-110 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{cert.courseName}</p>
                            <p className="text-xs text-slate-500">{new Date(cert.date).toLocaleDateString("bg-BG")} • #{cert.id}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Все още нямате завършени курсове.
                    </p>
                    <Link href="/certificate">
                      <Button variant="outline" size="sm" className="border-slate-700 text-xs w-full">
                        Разгледай демо диплома
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            
          </div>

        </div>
      </main>
    </div>
  );
}
