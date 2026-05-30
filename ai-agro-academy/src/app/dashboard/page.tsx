"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, BookOpen, PlayCircle, Loader2, Sparkles } from "lucide-react";
import { easeOutExpo, listContainerVariants, listItemVariants, transitionSnappy } from "@/lib/motion";
import { Settings, Tractor } from "lucide-react";

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
  const reduceMotion = useReducedMotion();
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="ai-mesh">
          <div className="ai-mesh-blob -top-20 right-0 w-[60%] h-[50%] bg-gradient-to-bl from-primary/20 to-cyan-400/10" />
          <div className="ai-mesh-blob bottom-0 left-0 w-[50%] h-[45%] bg-gradient-to-tr from-accent/15 to-transparent" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 pt-36">
        <motion.div
          className="mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: transitionSnappy.duration, ease: easeOutExpo }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">
                Здравейте, {user?.full_name?.split(" ")[0] || "Колега"}
              </h1>
              <p className="text-muted-foreground text-lg">Добре дошли във вашия студентски портал.</p>
            </div>
            <Link href="/farm">
              <Button variant="outline" className="border-border/60 hover:bg-white/5 bg-card/50 backdrop-blur-sm">
                <Tractor className="w-4 h-4 mr-2 text-emerald-400" />
                Моето Стопанство
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={listContainerVariants}
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
        >
          <motion.div variants={listItemVariants} className="col-span-1 md:col-span-3">
          <Card className="h-full overflow-hidden border border-white/10 bg-gradient-to-br from-band via-band to-primary/35 text-band-foreground shadow-elevated ring-1 ring-white/10">
            <CardContent className="relative p-8 flex flex-col sm:flex-row items-center justify-between">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(5_150_105/0.35),transparent_55%)]" />
              <div className="relative flex items-center space-x-6 mb-4 sm:mb-0">
                <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md ring-1 ring-white/20">
                  <BrainCircuit className="h-8 w-8 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Проф. АгроМайнд е на линия</h2>
                  <p className="text-slate-300">Вашият личен AI агроном ви очаква за консултация.</p>
                </div>
              </div>
              <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Link href="/faculty/agromind">
                  <Button className="h-12 px-6 border-0 shadow-md glow-primary">Свържи се сега</Button>
                </Link>
                <Link href="/knowledge">
                  <Button
                    variant="outline"
                    className="h-12 px-6 border-white/35 bg-white/10 text-band-foreground backdrop-blur-sm hover:bg-white/20 hover:text-band-foreground"
                  >
                    Качи документи (RAG)
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div variants={listItemVariants} className="col-span-1 md:col-span-3">
          <Card className="h-full glass-subtle border-border/60 shadow-card hover:shadow-elevated hover-lift transition-all">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-primary"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4.5 3h15" />
                    <path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" />
                    <path d="M6 14h12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">Интерактивна Лаборатория</h2>
                  <p className="text-muted-foreground text-sm">Симулатор за почвен анализ и взимане на решения за засаждане.</p>
                </div>
              </div>
              <Link href="/labs">
                <Button variant="outline" className="h-11 px-6 font-semibold border-primary/40 text-primary hover:bg-primary/10">
                  Отвори Симулатора
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div variants={listItemVariants} className="col-span-1 md:col-span-3">
          <Card className="h-full glass border-primary/20 bg-gradient-to-r from-secondary/80 to-primary/5 shadow-card">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center space-x-5 mb-4 sm:mb-0 w-full sm:w-1/2">
                <div className="h-14 w-14 rounded-2xl bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm shrink-0 border border-border/60">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="w-full">
                  <h2 className="text-xl font-bold text-foreground mb-1">AI Създател на Курсове</h2>
                  <p className="text-muted-foreground text-sm mb-3">
                    Въведи тема и изкуственият интелект ще ти генерира персонализиран курс.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                    <input
                      type="text"
                      placeholder="Напиши тема (напр. Оранжерии, Дронове, Пчели)..."
                      className="flex-1 h-14 px-5 rounded-xl border-2 border-primary/25 bg-card/80 backdrop-blur-sm shadow-inner text-lg font-medium text-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all placeholder:text-subtle-foreground"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerateCourse()}
                    />
                    <Button
                      onClick={handleGenerateCourse}
                      disabled={isGenerating || !newTopic.trim()}
                      className="h-14 px-8 text-lg rounded-xl shadow-md transition-all whitespace-nowrap"
                    >
                      {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : "Генерирай"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </motion.div>

          <motion.div variants={listItemVariants} className="col-span-1 md:col-span-3">
            <h2 className="text-xl font-bold mb-4 text-foreground">Моите Курсове</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="h-full overflow-hidden border-border/60 bg-card/70 backdrop-blur-md shadow-card hover:shadow-elevated hover-lift transition-all hover:border-primary/25"
                >
                  <div className="h-32 bg-muted/60 border-b border-border/50 flex items-center justify-center backdrop-blur-sm">
                    <BookOpen className="h-12 w-12 text-subtle-foreground" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: "0%" }} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">0% Завършен</p>
                    <Link href={`/courses/${course.id}`} className="w-full">
                      <Button variant="outline" className="w-full border-border/80">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Продължи
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              <Card className="h-full border-dashed border-border/70 bg-muted/30 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 min-h-[300px] hover:border-primary/30 transition-colors">
                <div className="h-12 w-12 rounded-full bg-card shadow-sm flex items-center justify-center mb-4 text-primary ring-1 ring-border/60">
                  +
                </div>
                <h3 className="font-semibold text-foreground mb-2">Запиши нов курс</h3>
                <p className="text-sm text-muted-foreground">Разгледайте каталога с всички налични обучения.</p>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

