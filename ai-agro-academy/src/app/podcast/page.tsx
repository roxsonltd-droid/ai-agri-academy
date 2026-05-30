"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Podcast, Play, Square, ChevronLeft, Loader2, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { API_BASE } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function PodcastPage() {
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setScript("");
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const prompt = `Напиши кратък (до 2 минути) аудио скрипт за агро подкаст на тема: "${topic}". Скриптът трябва да звучи като радио водещ (Проф. АгроМайнд). Започни директно с "Здравейте, фермери...". Не използвай сложни Markdown формати или емоджита, тъй като текстът ще бъде четен от TTS (Voice AI).`;
      
      const res = await fetch(`${API_BASE}/api/v1/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) throw new Error("Грешка при генериране на скрипта.");
      const data = await res.json();
      setScript(data.reply);
    } catch (err: any) {
      setError(err.message || "Възникна грешка.");
    } finally {
      setIsGenerating(false);
    }
  };

  const playPodcast = async () => {
    if (!script) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/v1/voice/tts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: script })
      });

      if (!res.ok) {
        throw new Error("Грешка при генериране на аудио. (ElevenLabs)");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
        };
      }
    } catch (err: any) {
      setError("Грешка при пускане на подкаста.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
        <div className="ai-mesh-blob top-0 left-0 w-[55%] h-[45%] bg-gradient-to-tr from-amber-500/20 to-orange-500/10" />
        <div className="ai-mesh-blob bottom-1/4 right-0 w-[40%] h-[40%] bg-gradient-to-bl from-purple-500/10 to-transparent" />
      </div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/20 rounded-xl">
              <Podcast className="h-5 w-5 text-amber-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Агро Подкаст</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-2xl px-4 py-8">
        <Card className="glass-subtle border-border/60 mb-6">
          <CardHeader>
            <CardTitle>Генерирай нов епизод</CardTitle>
            <CardDescription>
              Въведете тема (например: Актуални цени на зърното) и AI ще създаде аудио новини.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={generatePodcast} className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Тема на подкаста..."
                className="flex-1 bg-card/50 border border-border/50 rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <Button 
                type="submit" 
                disabled={!topic.trim() || isGenerating}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ListMusic className="w-4 h-4 mr-2" />}
                Създай
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {script && (
          <Card className="glass-subtle border-border/60 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <CardHeader className="border-b border-border/30 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-amber-400">Скрипт на Епизода</CardTitle>
                <Button 
                  onClick={playPodcast}
                  disabled={isLoadingAudio}
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isPlaying ? (
                    <Square className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2 fill-current" />
                  )}
                  {isPlaying ? "Спри" : "Слушай"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <ReactMarkdown>{script}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
