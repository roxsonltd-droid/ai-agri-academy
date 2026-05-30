"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImagePlus, Loader2, Target, ScanSearch, CheckCircle, BrainCircuit, Activity, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || "https://agro-academy-backend.onrender.com";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result;
      if (typeof s === "string") resolve(s);
      else reject(new Error("Грешка при четене на файла"));
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export default function DiagnosticLabPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [agentReply, setAgentReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File) => {
    setError(null);
    setAgentReply(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Моля, качете валидна снимка (JPEG, PNG, WebP).");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const runDiagnostics = async () => {
    if (!file) {
      setError("Първо качете снимка за анализ.");
      return;
    }
    setLoading(true);
    setIsScanning(true);
    setError(null);
    setAgentReply(null);

    try {
      const t = token();
      if (!t) {
        throw new Error("Трябва да сте влезли в профила си, за да използвате Диагностичната Лаборатория.");
      }
      const image_base64 = await readFileAsBase64(file);
      const res = await fetch(`${apiBase()}/api/v1/agents/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Моля, направи пълен диагностичен анализ на тази снимка. Има ли болести, вредители или дефицити? Какво лечение предписваш?",
          image_base64,
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { detail?: string }).detail || "Грешка при връзката със сървъра на Ректора.");
      }
      
      setAgentReply((data as { reply?: string }).reply ?? "Няма намерен отговор.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Възникна неочаквана грешка.");
    } finally {
      setLoading(false);
      setIsScanning(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-16">
      
      {/* Dynamic Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-5xl">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6">
          <div>
            <Link href="/labs" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-4 text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Към всички лаборатории
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <ScanSearch className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">AI Диагностична Лаборатория</h1>
            </div>
            <p className="text-slate-400">Качете снимка на вашето растение и оставете Ректора да анализира проблема чрез компютърно зрение.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse mr-3" />
            <span className="text-sm font-mono text-primary uppercase tracking-widest">Vision System: ONLINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* LEFT: Upload & Image Area */}
          <div className="lg:col-span-2 space-y-6">
            {!previewUrl ? (
              <div 
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed h-80 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
                  isDragging 
                    ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_30px_rgba(45,212,191,0.2)]" 
                    : "border-slate-700 bg-slate-900/50 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                <input type="file" accept="image/jpeg,image/png,image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={onPick} />
                <div className="flex flex-col items-center justify-center p-6 text-center pointer-events-none relative z-20">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                    <ImagePlus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Качете снимка</h3>
                  <p className="text-sm text-slate-400 mb-4">Плъзнете файл тук или кликнете за да изберете от устройството си.</p>
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">JPEG, PNG до 10MB</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-slate-700 bg-slate-900/80 overflow-hidden shadow-2xl group">
                <div className="absolute top-3 right-3 z-30">
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); setAgentReply(null); }}
                    className="bg-slate-900/80 hover:bg-red-500/80 text-white p-2 rounded-lg backdrop-blur-md transition-colors border border-slate-700"
                  >
                    X
                  </button>
                </div>
                
                {/* The Image */}
                <img src={previewUrl} alt="Качена снимка" className="w-full h-80 object-cover opacity-90 transition-opacity" />
                
                {/* Scanner Animation Effect */}
                {isScanning && (
                  <>
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10"></div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_20px_4px_rgba(45,212,191,0.8)] z-20 animate-[scan_2.5s_ease-in-out_infinite]" />
                  </>
                )}
                
                {/* Status Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 to-transparent z-20">
                  {isScanning ? (
                    <div className="flex items-center text-primary font-mono text-sm font-bold">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                      АНАЛИЗ В ПРОГРЕС...
                    </div>
                  ) : agentReply ? (
                    <div className="flex items-center text-emerald-400 font-mono text-sm font-bold">
                      <CheckCircle className="w-4 h-4 mr-2" /> 
                      АНАЛИЗЪТ Е ЗАВЪРШЕН
                    </div>
                  ) : (
                    <div className="flex items-center text-slate-300 font-mono text-sm">
                      <Target className="w-4 h-4 mr-2" /> 
                      ИЗОБРАЖЕНИЕТО Е ГОТОВО ЗА СКЕНИРАНЕ
                    </div>
                  )}
                </div>
                <style jsx>{`
                  @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
              </div>
            )}

            <Button 
              onClick={runDiagnostics} 
              disabled={!file || loading}
              className={`w-full h-14 rounded-xl text-lg font-bold shadow-lg transition-all relative overflow-hidden ${
                !file 
                  ? 'bg-slate-800 text-slate-500' 
                  : 'bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-slate-950 hover:scale-[1.02]'
              }`}
            >
              {loading && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-[pulse_1s_infinite]"></div>
              )}
              {loading ? (
                <span className="flex items-center z-10 relative">
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Обработка на данните...
                </span>
              ) : (
                <span className="flex items-center z-10 relative">
                  <ScanSearch className="w-5 h-5 mr-3" /> Стартирай AI Диагностика
                </span>
              )}
            </Button>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-400 text-sm flex items-start">
                <Target className="w-5 h-5 mr-3 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* RIGHT: Results / Report Area */}
          <div className="lg:col-span-3">
            {!agentReply ? (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-10 text-center min-h-[400px]">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 shadow-inner mb-6">
                  <Activity className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-500 mb-2">Очаква се изображение</h3>
                <p className="text-slate-600 max-w-sm">Тук ще се появи официалният рапорт и предписанието за лечение от Главния AI Ректор.</p>
              </div>
            ) : (
              <div className="relative h-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Report Header */}
                <div className="bg-slate-950/80 border-b border-slate-800 p-6 shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <BrainCircuit className="w-24 h-24" />
                  </div>
                  <div className="flex items-center mb-4 relative z-10">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/40 mr-4 shadow-[0_0_15px_rgba(45,212,191,0.15)]">
                      <Pill className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">Дигитален Рапорт</h2>
                      <p className="text-primary font-mono text-sm mt-1">Оторизирано от: AI Ректор АгроМайнд</p>
                    </div>
                  </div>
                  <div className="flex gap-4 relative z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400">
                      ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-slate-400">
                      ДАТА: {new Date().toLocaleDateString('bg-BG')}
                    </span>
                  </div>
                </div>
                
                {/* Report Body */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-900/50 custom-scrollbar">
                  <div className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-h3:text-white prose-p:text-slate-300 prose-a:text-primary prose-strong:text-emerald-400 prose-li:text-slate-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {agentReply}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* Footer Action */}
                <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end shrink-0">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 mr-3">
                    Запази в профила
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90 text-slate-950 font-bold shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                    Разпечатай Рецепта
                  </Button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Global Style for scrollbar in report */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 212, 191, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 212, 191, 0.6);
        }
      `}</style>
    </div>
  );
}
