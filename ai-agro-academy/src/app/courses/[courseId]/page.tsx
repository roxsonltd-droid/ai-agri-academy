"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, PlayCircle, CheckCircle, FileText, MessageSquare, Download, GraduationCap, Award } from "lucide-react";

import { useParams } from "next/navigation";

type Lesson = {
  id: string | number;
  title: string;
  duration?: string | number;
  order?: number;
  completed?: boolean;
  content?: string | null;
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
  
  // Quiz State
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

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
    <div className="h-screen bg-app-surface font-sans text-app-ink flex flex-col pt-20 overflow-hidden">
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
                  Дискусия
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quiz")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "quiz" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-app-ink-muted hover:text-emerald-500"}`}
              >
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Изпит
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="prose prose-sm prose-slate max-w-none text-app-ink-muted">
              {activeTab === "description" && (
                <div>
                  <div className="bg-app-card border border-app-border p-6 sm:p-8 rounded-xl shadow-sm">
                    {activeLesson.content && String(activeLesson.content).trim() ? (
                      <article className="prose prose-slate max-w-none prose-headings:text-app-ink prose-p:text-app-ink-muted prose-strong:text-app-ink prose-li:text-app-ink-muted prose-a:text-app-primary">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(activeLesson.content)}</ReactMarkdown>
                      </article>
                    ) : (
                      <p className="text-[17px] leading-relaxed text-app-ink-muted mb-6">
                        За урока <strong className="text-app-ink">&ldquo;{activeLesson.title}&rdquo;</strong> все още няма
                        публикуван учебен текст в базата. Администратор: пуснете{" "}
                        <code className="rounded bg-app-surface px-1.5 py-0.5 text-sm text-app-ink">alembic upgrade head</code> и
                        при празна база отново{" "}
                        <code className="rounded bg-app-surface px-1.5 py-0.5 text-sm text-app-ink">POST /api/v1/courses/seed</code>
                        , или генерирайте нов курс от таблото — уроците вече поддържат поле <strong>content</strong> (Markdown).
                      </p>
                    )}
                    <h3 className="text-app-ink text-xl font-bold mt-10 mb-4">Фокус на урока</h3>
                    <ul className="list-none space-y-3 mb-8">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-app-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-app-ink-muted">Ключови понятия и връзка с практиката в полето.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-app-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-app-ink-muted">Как да проверите дали препоръките важат за вашия парцел.</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-app-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-app-ink-muted">Следваща стъпка: материали и дискусия с AI при нужда.</span>
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
                  <button type="button" onClick={() => alert("Изтеглянето се подготвя от Силвия (Документи)...")} className="w-full text-left p-4 border border-app-border rounded-lg bg-app-card flex items-center justify-between hover:border-app-primary cursor-pointer transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-app-primary mr-3" />
                      <div>
                        <p className="text-[15px] font-medium text-app-ink">Презентация - Урок 3.pdf</p>
                        <p className="text-xs text-app-placeholder">PDF Документ • 2.4 MB</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-app-ink-muted" />
                  </button>
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
              {activeTab === "quiz" && (
                <div className="bg-app-card border border-app-border p-6 sm:p-8 rounded-xl shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mr-4">
                      <GraduationCap className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-app-ink">Проверка на знанията</h3>
                      <p className="text-sm text-app-ink-muted">AI Професорът проверява какво сте научили от урока.</p>
                    </div>
                  </div>

                  {quizScore === 100 ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
                      <Award className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-app-ink mb-2">Браво! Ти премина успешно.</h4>
                      <p className="text-app-ink-muted mb-6 max-w-md mx-auto">
                        Професорът е изключително доволен от твоите резултати. Ти доказа, че владееш материята!
                      </p>
                      <Link href={`/certificate?course=${encodeURIComponent(courseData.title)}`}>
                        <button className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center mx-auto transition-colors">
                          <Award className="w-5 h-5 mr-2" />
                          Вземи своя Сертификат
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-app-surface p-6 rounded-lg border border-app-border">
                        <p className="text-lg font-medium text-app-ink mb-4">
                          Кой е най-важният фактор за правилното приложение на новите технологии в земеделието?
                        </p>
                        <div className="space-y-3">
                          {[
                            "Покупката на най-скъпия софтуер на пазара.",
                            "Правилното и осмислено прилагане спрямо спецификата на почвата.",
                            "Сляпото следване на чужди практики без анализ.",
                            "Използването им само през пролетта."
                          ].map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => setQuizAnswer(option)}
                              className={`w-full text-left p-4 rounded-lg border transition-all ${
                                quizAnswer === option 
                                  ? "border-emerald-500 bg-emerald-500/5 shadow-sm" 
                                  : "border-app-border bg-app-card hover:border-emerald-300"
                              }`}
                            >
                              <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  quizAnswer === option ? "border-emerald-500" : "border-app-border"
                                }`}>
                                  {quizAnswer === option && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                                </div>
                                <span className="text-app-ink font-medium">{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {quizFeedback && (
                        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <p className="font-bold text-red-600 mb-1">Съвет от Професора:</p>
                          <p className="text-sm text-red-800">{quizFeedback}</p>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          if (quizAnswer === "Правилното и осмислено прилагане спрямо спецификата на почвата.") {
                            setQuizScore(100);
                            setQuizFeedback(null);
                          } else {
                            setQuizFeedback("Грешка! Върни се към текста. Ключът не е в скъпата техника, а в осмисленото ѝ приложение спрямо твоята специфична почва!");
                          }
                        }}
                        disabled={!quizAnswer}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors w-full sm:w-auto"
                      >
                        Провери отговора
                      </button>
                    </div>
                  )}
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
