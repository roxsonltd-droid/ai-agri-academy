"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, PlayCircle, CheckCircle, FileText, MessageSquare, Download } from "lucide-react";

import { useParams } from "next/navigation";

type Lesson = {
  id: string | number;
  title: string;
  duration?: number;
  order?: number;
  completed?: boolean;
};

type Module = {
  id: string | number;
  title: string;
  lessons: Lesson[];
};

type CoursePayload = {
  title: string;
  modules: Module[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://agro-academy-backend.onrender.com";

export default function CoursePlayerPage() {
  const params = useParams();
  const [courseData, setCourseData] = useState<CoursePayload | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/courses/${params.courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourseData(data);
          if (data.modules && data.modules.length > 0 && data.modules[0].lessons.length > 0) {
            setActiveLesson(data.modules[0].lessons[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch course", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [params.courseId]);

  if (isLoading || !courseData || !activeLesson) {
    return (
      <div className="min-h-screen bg-app-surface flex items-center justify-center">
        <div className="text-app-primary animate-pulse font-semibold">Зареждане на курса...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-surface font-sans text-app-ink flex flex-col pt-20">
      {/* Top Header */}
      <div className="bg-app-card border-b border-app-border h-14 flex items-center px-4 lg:px-8 shadow-sm flex-shrink-0 z-10">
        <Link
          href="/dashboard"
          className="flex items-center text-app-ink-muted hover:text-app-ink transition-colors text-sm font-medium mr-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад към портала
        </Link>
        <div className="h-4 w-px bg-app-border mx-4 hidden sm:block" />
        <h1 className="text-[15px] font-semibold truncate text-app-ink hidden sm:block">{courseData.title}</h1>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Video & Tabs */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Reading Header */}
          <div className="w-full bg-gradient-to-r from-app-ink to-app-navy-mid relative flex flex-col justify-center px-8 py-12 border-b border-app-border">
            <div className="flex items-center space-x-3 mb-4">
              <span className="bg-app-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Урок {activeLesson.order || 1}
              </span>
              <span className="text-slate-300 text-sm flex items-center">
                <FileText className="h-4 w-4 mr-1.5" />
                Време за четене: ~{activeLesson.duration} мин
              </span>
            </div>
            <h2 className="text-white font-bold text-3xl md:text-4xl mb-4 leading-tight max-w-3xl">{activeLesson.title}</h2>
            <p className="text-slate-300 text-lg max-w-2xl">
              Прочетете внимателно материала по-долу. Ако имате въпроси, винаги можете да се консултирате с Проф. АгроМайнд в
              секцията за дискусии.
            </p>
          </div>

          {/* Content Area Below Video */}
          <div className="max-w-5xl w-full mx-auto p-6 lg:p-8">
            <h2 className="text-2xl font-bold mb-6">{activeLesson.title}</h2>

            {/* Tabs Navigation */}
            <div className="flex space-x-6 border-b border-app-border mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "description" ? "text-app-primary border-b-2 border-app-primary" : "text-app-ink-muted hover:text-app-ink"}`}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Описание
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("materials")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "materials" ? "text-app-primary border-b-2 border-app-primary" : "text-app-ink-muted hover:text-app-ink"}`}
              >
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Материали
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "ai" ? "text-app-primary border-b-2 border-app-primary" : "text-app-ink-muted hover:text-app-ink"}`}
              >
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Дискусия с AI
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="prose prose-sm prose-slate max-w-none text-app-ink-muted">
              {activeTab === "description" && (
                <div>
                  <div className="bg-app-card border border-app-border p-6 sm:p-8 rounded-xl shadow-sm">
                    <p className="text-[17px] leading-relaxed mb-6">
                      Добре дошли в този урок. Тук ще разгледаме в детайли как точно работят основните концепции, свързани с{" "}
                      <strong>{activeLesson.title}</strong>. Ще се фокусираме върху практическите ползи и избягването на често
                      срещани грешки в процеса на имплементация.
                    </p>
                    <h3 className="text-app-ink text-xl font-bold mt-8 mb-4">Основни цели на урока:</h3>
                    <ul className="list-none space-y-3 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-app-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>Да разберем фундаменталните принципи на технологията.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-app-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>Да приложим наученото в реална земеделска среда.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-app-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span>Да анализираме данните ефективно за по-добри добиви.</span>
                      </li>
                    </ul>
                    <div className="bg-app-success-bg border-l-4 border-app-primary p-5 rounded-r-lg">
                      <h4 className="text-app-primary font-bold mb-2">Бележка от Професора</h4>
                      <p className="text-sm italic text-app-ink-muted">
                        &ldquo;Успехът в модерното земеделие не идва от сляпото следване на технологиите, а от тяхното правилно и
                        осмислено прилагане спрямо спецификата на вашата почва и култури.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "materials" && (
                <div className="flex flex-col space-y-3">
                  <div className="p-4 border border-app-border rounded-lg bg-app-card flex items-center justify-between hover:border-app-primary cursor-pointer transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-app-primary mr-3" />
                      <div>
                        <p className="text-[15px] font-medium text-app-ink">Презентация - Урок 3.pdf</p>
                        <p className="text-xs text-app-placeholder">PDF Документ • 2.4 MB</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-app-ink-muted" />
                  </div>
                </div>
              )}
              {activeTab === "ai" && (
                <div className="bg-app-ink p-6 rounded-xl text-white">
                  <h3 className="text-lg font-semibold mb-2">Нещо не ви е ясно?</h3>
                  <p className="text-slate-300 mb-4 text-sm">
                    Проф. АгроМайнд е на ваше разположение, за да отговори на всички въпроси свързани с този урок.
                  </p>
                  <Link href="/faculty/agromind">
                    <button
                      type="button"
                      className="bg-app-primary hover:bg-app-primary-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Попитай Професора
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum Sidebar */}
        <div className="w-full lg:w-96 bg-app-card border-l border-app-border flex-shrink-0 flex flex-col h-[calc(100vh-8.5rem)]">
          <div className="p-4 border-b border-app-border bg-app-surface">
            <h3 className="font-semibold text-app-ink">Съдържание на курса</h3>
            <p className="text-xs text-app-ink-muted mt-1">2 от 5 урока завършени</p>
            <div className="w-full bg-app-border rounded-full h-1.5 mt-3">
              <div className="bg-app-primary h-1.5 rounded-full" style={{ width: "40%" }} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {courseData.modules.map((module) => (
              <div key={module.id} className="border-b border-app-border last:border-b-0">
                <div className="px-4 py-3 bg-app-card">
                  <h4 className="text-sm font-bold text-app-ink">{module.title}</h4>
                </div>
                <div>
                  {module.lessons.map((lesson) => (
                    <button
                      type="button"
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left px-4 py-3 flex items-start transition-colors ${
                        activeLesson.id === lesson.id
                          ? "bg-app-success-bg border-l-2 border-app-primary"
                          : "hover:bg-app-surface border-l-2 border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 mr-3 flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="h-4 w-4 text-app-primary" />
                        ) : (
                          <PlayCircle
                            className={`h-4 w-4 ${activeLesson.id === lesson.id ? "text-app-primary" : "text-app-placeholder"}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium leading-tight ${activeLesson.id === lesson.id ? "text-app-primary" : "text-app-ink-muted"}`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-app-placeholder mt-1">{lesson.duration}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
