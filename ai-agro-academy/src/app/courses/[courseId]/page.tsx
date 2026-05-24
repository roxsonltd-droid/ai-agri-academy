"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, PlayCircle, CheckCircle, FileText, MessageSquare, Download } from "lucide-react";

import { useParams } from "next/navigation";

export default function CoursePlayerPage() {
  const params = useParams();
  const [courseData, setCourseData] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("description");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`https://agro-academy-backend.onrender.com/api/v1/courses/${params.courseId}`);
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
      <div className="min-h-screen bg-[#F6F9FC] flex items-center justify-center">
        <div className="text-[#059669] animate-pulse font-semibold">Зареждане на курса...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans text-[#0A2540] flex flex-col pt-20">
      
      {/* Top Header */}
      <div className="bg-white border-b border-[#E6EBF1] h-14 flex items-center px-4 lg:px-8 shadow-sm flex-shrink-0 z-10">
        <Link href="/dashboard" className="flex items-center text-[#425466] hover:text-[#0A2540] transition-colors text-sm font-medium mr-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад към портала
        </Link>
        <div className="h-4 w-[1px] bg-[#E6EBF1] mx-4 hidden sm:block"></div>
        <h1 className="text-[15px] font-semibold truncate text-[#0A2540] hidden sm:block">
          {courseData.title}
        </h1>
      </div>

      {/* Main Player Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: Video & Tabs */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* AI Avatar Video Container Placeholder */}
          <div className="w-full bg-[#0A2540] aspect-video relative flex flex-col items-center justify-center border-b border-[#E6EBF1]">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#059669] to-[#00D4FF] flex items-center justify-center shadow-lg mb-4 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/><path d="M19 14v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="21" x2="12" y2="21.01"/></svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Проф. АгроМайнд (Виртуален Преподавател)</h3>
            <p className="text-slate-300 text-sm max-w-md text-center px-4">
              Това е запазено място за вашето реалистично AI видео. Копирайте сценария по-долу и го поставете в софтуера за аватари.
            </p>
          </div>

          {/* Content Area Below Video */}
          <div className="max-w-5xl w-full mx-auto p-6 lg:p-8">
            <h2 className="text-2xl font-bold mb-6">{activeLesson.title}</h2>
            
            {/* Tabs Navigation */}
            <div className="flex space-x-6 border-b border-[#E6EBF1] mb-6">
              <button 
                onClick={() => setActiveTab("description")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "description" ? "text-[#059669] border-b-2 border-[#059669]" : "text-[#425466] hover:text-[#0A2540]"}`}
              >
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Описание
                </div>
              </button>
              <button 
                onClick={() => setActiveTab("materials")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "materials" ? "text-[#059669] border-b-2 border-[#059669]" : "text-[#425466] hover:text-[#0A2540]"}`}
              >
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Материали
                </div>
              </button>
              <button 
                onClick={() => setActiveTab("ai")}
                className={`pb-3 text-sm font-semibold transition-colors ${activeTab === "ai" ? "text-[#059669] border-b-2 border-[#059669]" : "text-[#425466] hover:text-[#0A2540]"}`}
              >
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Дискусия с AI
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="prose prose-sm prose-slate max-w-none text-[#425466]">
              {activeTab === "description" && (
                <div>
                  <div className="bg-[#F0FDF4] border border-[#059669]/30 p-5 rounded-xl relative">
                    <div className="absolute top-3 right-3 bg-[#059669] text-white text-[10px] uppercase font-bold px-2 py-1 rounded">
                      Сценарий за Аватара
                    </div>
                    <h4 className="text-[#059669] font-bold mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-1.5" />
                      Текст за копиране:
                    </h4>
                    <p className="text-sm leading-relaxed text-[#0A2540] italic">
                      "Здравейте! Аз съм Проф. АгроМайнд и днес ще разгледаме темата: {activeLesson.title}. В рамките на следващите {activeLesson.duration} минути, ще научите най-важните концепции, предимствата на технологията и как да я приложите във Вашето собствено стопанство. Нека да започваме!"
                    </p>
                  </div>
                  
                  <p className="mt-6 text-sm">
                    <strong>Инструкции:</strong> Копирайте горния текст и го поставете в платформата за AI Инфлуенсъри (напр. Impresso, HeyGen, Synthesia), за да генерирате видеото за този урок.
                  </p>
                </div>
              )}
              {activeTab === "materials" && (
                <div className="flex flex-col space-y-3">
                  <div className="p-4 border border-[#E6EBF1] rounded-lg bg-white flex items-center justify-between hover:border-[#059669] cursor-pointer transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-[#059669] mr-3" />
                      <div>
                        <p className="text-[15px] font-medium text-[#0A2540]">Презентация - Урок 3.pdf</p>
                        <p className="text-xs text-[#94A3B8]">PDF Документ • 2.4 MB</p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-[#425466]" />
                  </div>
                </div>
              )}
              {activeTab === "ai" && (
                <div className="bg-[#0A2540] p-6 rounded-xl text-white">
                  <h3 className="text-lg font-semibold mb-2">Нещо не ви е ясно?</h3>
                  <p className="text-slate-300 mb-4 text-sm">Проф. АгроМайнд е на ваше разположение, за да отговори на всички въпроси свързани с този урок.</p>
                  <Link href="/faculty/agromind">
                    <button className="bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                      Попитай Професора
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Curriculum Sidebar */}
        <div className="w-full lg:w-96 bg-white border-l border-[#E6EBF1] flex-shrink-0 flex flex-col h-[calc(100vh-8.5rem)]">
          <div className="p-4 border-b border-[#E6EBF1] bg-[#F6F9FC]">
            <h3 className="font-semibold text-[#0A2540]">Съдържание на курса</h3>
            <p className="text-xs text-[#425466] mt-1">2 от 5 урока завършени</p>
            {/* Progress bar */}
            <div className="w-full bg-[#E6EBF1] rounded-full h-1.5 mt-3">
              <div className="bg-[#059669] h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {courseData.modules.map((module: any) => (
              <div key={module.id} className="border-b border-[#E6EBF1] last:border-b-0">
                <div className="px-4 py-3 bg-white">
                  <h4 className="text-sm font-bold text-[#0A2540]">{module.title}</h4>
                </div>
                <div>
                  {module.lessons.map((lesson: any) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left px-4 py-3 flex items-start transition-colors ${
                        activeLesson.id === lesson.id 
                          ? "bg-[#F0FDF4] border-l-2 border-[#059669]" 
                          : "hover:bg-[#F6F9FC] border-l-2 border-transparent"
                      }`}
                    >
                      <div className="mt-0.5 mr-3 flex-shrink-0">
                        {lesson.completed ? (
                          <CheckCircle className="h-4 w-4 text-[#059669]" />
                        ) : (
                          <PlayCircle className={`h-4 w-4 ${activeLesson.id === lesson.id ? "text-[#059669]" : "text-[#94A3B8]"}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-tight ${activeLesson.id === lesson.id ? "text-[#059669]" : "text-[#425466]"}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-1">{lesson.duration}</p>
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
