"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Sparkles, Wand2 } from "lucide-react";

export default function CreateCoursePage() {
  const [mode, setMode] = useState<"manual" | "ai">("ai");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { getToken } = useAuth();

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description })
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/courses/${data.id}`);
      } else {
        alert("Failed to create course");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      // AI generation endpoint creates the full course and returns the Course details
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic: aiTopic })
      });
      
      if (res.ok) {
        const data = await res.json();
        // Redirect to the newly generated course so the admin can review/edit it
        router.push(`/admin/courses/${data.id}`);
      } else {
        alert("Failed to generate course with AI");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during AI generation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/courses" 
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Създай нов курс</h1>
          <p className="text-slate-400 text-sm">Изберете как искате да създадете курса</p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-slate-900/50 border border-slate-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode("ai")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            mode === "ai" 
              ? "bg-emerald-500 text-white shadow-lg" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Генериране
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            mode === "manual" 
              ? "bg-slate-800 text-white shadow-lg" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Ръчно създаване
        </button>
      </div>

      {mode === "ai" ? (
        <form onSubmit={handleAiSubmit} className="bg-slate-900/50 border border-emerald-500/30 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-2">
            <label htmlFor="aiTopic" className="text-sm font-medium text-emerald-300 flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Тема на курса
            </label>
            <input
              id="aiTopic"
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="напр. Съвременно отглеждане на лавандула"
              className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all placeholder:text-slate-600"
              required
            />
            <p className="text-xs text-slate-400 mt-2">
              Професор АгроМайнд ще генерира заглавие, описание, 2 модула и 4 пълни урока с текст по тази тема.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !aiTopic.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Генериране... (отнема 10-15 сек.)
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Генерирай с AI
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-300">
              Заглавие на курса
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="напр. Основи на прецизното земеделие"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">
              Описание
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Кратко описание на това какво ще научат курсистите..."
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
              required
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim()}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Запази и продължи
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
