"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, MicOff, Play, Square, ChevronLeft, Volume2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE } from "@/lib/api";

export default function VoiceAssistantPage() {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Web Speech API for dictation
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "bg-BG";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setText((prev) => prev + transcript + " ");
            } else {
              currentTranscript += transcript;
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          if (event.error !== "no-speech") {
            setError(`Грешка при разпознаване на реч: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setError("Вашият браузър не поддържа гласово диктуване (Web Speech API). Опитайте с Google Chrome.");
      }
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    setError(null);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const playTTS = async () => {
    if (!text.trim()) {
      setError("Моля, въведете или издиктувайте текст, който да бъде прочетен.");
      return;
    }
    
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
        body: JSON.stringify({ text: text.trim() })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Грешка от сървъра");
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
      console.error(err);
      setError("Грешка при генериране на аудио (ElevenLabs може да не е конфигуриран).");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-30">
        <div className="ai-mesh-blob top-10 right-10 w-[45%] h-[45%] bg-gradient-to-bl from-pink-500/20 to-purple-500/10" />
      </div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Mic className="h-5 w-5 text-pink-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Гласов Асистент</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto p-4 py-8">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Card className="glass-subtle border-border/60">
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span>Вашите бележки (Текст)</span>
                {isListening && (
                  <span className="flex items-center text-xs text-pink-400 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-pink-500 mr-2" />
                    Записване...
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Издиктувайте или напишете текст тук (напр. 'Доклад от днес: Пшеницата в блок 4 има нужда от торене...')"
                className="w-full min-h-[250px] bg-card/50 border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/40 resize-y"
              />

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "outline"}
                  className={`rounded-full flex-1 ${isListening ? "animate-pulse" : "border-pink-500/30 text-pink-400 hover:bg-pink-500/10"}`}
                >
                  {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                  {isListening ? "Спри Диктуването" : "Старт Диктуване"}
                </Button>

                <Button
                  onClick={playTTS}
                  disabled={isLoadingAudio || !text.trim()}
                  className="rounded-full flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                >
                  {isLoadingAudio ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isPlaying ? (
                    <Square className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2 fill-current" />
                  )}
                  {isPlaying ? "Спри Аудиото" : "Прочети на глас"}
                </Button>
              </div>

              <div className="mt-4 flex justify-end">
                 <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Save className="w-4 h-4 mr-2" />
                    Запази бележката
                 </Button>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Диктуването използва Web Speech API на вашия браузър. Аудиото се генерира чрез <strong className="text-foreground">ElevenLabs AI</strong>.
          </p>
        </div>
      </main>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
