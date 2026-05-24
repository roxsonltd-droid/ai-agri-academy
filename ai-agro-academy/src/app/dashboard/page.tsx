"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, PlayCircle, Loader2, Sparkles } from "lucide-react";

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
      <div className="min-h-screen bg-[#F6F9FC] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#059669] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans text-[#0A2540]">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#0A2540]">Здравейте, {user?.full_name?.split(' ')[0] || 'Колега'}</h1>
          <p className="text-[#425466] text-lg">Добре дошли във вашия студентски портал.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* AI Advisor Card */}
          <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-[#0A2540] to-[#1a365d] text-white border-none shadow-md">
            <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BrainCircuit className="h-8 w-8 text-[#00D4FF]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Проф. АгроМайнд е на линия</h2>
                  <p className="text-slate-300">Вашият личен AI агроном ви очаква за консултация.</p>
                </div>
              </div>
              <Link href="/faculty/agromind">
                <Button className="bg-[#059669] hover:bg-[#047857] text-white border-none shadow-sm h-12 px-6">
                  Свържи се сега
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Lab Simulator Card */}
          <Card className="col-span-1 md:col-span-3 bg-white border border-[#E6EBF1] shadow-sm hover:shadow-md hover-lift transition-all">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                <div className="h-14 w-14 bg-[#F0FDF4] rounded-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A2540] mb-1">Интерактивна Лаборатория</h2>
                  <p className="text-[#425466] text-sm">Симулатор за почвен анализ и взимане на решения за засаждане.</p>
                </div>
              </div>
              <Link href="/labs">
                <Button variant="outline" className="border-[#059669] text-[#059669] hover:bg-[#F0FDF4] h-11 px-6 font-semibold">
                  Отвори Симулатора
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Course Creator Card */}
          <Card className="col-span-1 md:col-span-3 bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#059669]/20 shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-5 mb-4 sm:mb-0 w-full sm:w-1/2">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Sparkles className="h-7 w-7 text-[#059669]" />
                </div>
                <div className="w-full">
                  <h2 className="text-xl font-bold text-[#0A2540] mb-1">AI Създател на Курсове</h2>
                  <p className="text-[#425466] text-sm mb-3">Въведи тема и изкуственият интелект ще ти генерира персонализиран курс.</p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                    <input 
                      type="text" 
                      placeholder="Напиши тема (напр. Оранжерии, Дронове, Пчели)..." 
                      className="flex-1 h-14 px-5 rounded-xl border-2 border-[#059669]/30 bg-white shadow-inner text-lg font-medium focus:outline-none focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition-all placeholder:text-[#94A3B8]"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateCourse()}
                    />
                    <Button 
                      onClick={handleGenerateCourse}
                      disabled={isGenerating || !newTopic.trim()}
                      className="bg-[#059669] hover:bg-[#047857] text-white h-14 px-8 text-lg rounded-xl shadow-md transition-all whitespace-nowrap"
                    >
                      {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : "Генерирай"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses */}
          <div className="col-span-1 md:col-span-3">
            <h2 className="text-xl font-bold mb-4">Моите Курсове</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {courses.map((course) => (
                <Card key={course.id} className="border-[#E6EBF1] shadow-sm hover:shadow-md hover-lift transition-all">
                  <div className="h-32 bg-[#F6F9FC] border-b border-[#E6EBF1] flex items-center justify-center">
                     <BookOpen className="h-12 w-12 text-[#94A3B8]" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-[#E6EBF1] rounded-full h-2 mb-4">
                      <div className="bg-[#059669] h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-sm text-[#425466] mb-4">0% Завършен</p>
                    <Link href={`/courses/${course.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Продължи
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-[#E6EBF1] shadow-sm border-dashed bg-[#F6F9FC] flex flex-col items-center justify-center text-center p-6 h-full min-h-[300px]">
                <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-[#059669]">
                  +
                </div>
                <h3 className="font-semibold text-[#0A2540] mb-2">Запиши нов курс</h3>
                <p className="text-sm text-[#425466]">Разгледайте каталога с всички налични обучения.</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

