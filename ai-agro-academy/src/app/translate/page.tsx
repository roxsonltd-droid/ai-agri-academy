"use client";

import { useState } from "react";
import Link from "next/link";
import { Languages, ChevronLeft, ArrowRightLeft, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE } from "@/lib/api";

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState("Български");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setTargetText("");

    try {
      const prompt = `Преведи следния специализиран земеделски текст на ${targetLang}. Запази професионалния тон и терминологията.\n\nТекст за превод:\n${sourceText}`;
      
      const res = await fetch(`${API_BASE}/api/v1/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) {
        throw new Error("Възникна грешка при свързването с AI преводача.");
      }
      
      const data = await res.json();
      setTargetText(data.reply);
    } catch (err: any) {
      setError(err.message || "Грешка при превода.");
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = () => {
    if (!targetText) return;
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
        <div className="ai-mesh-blob top-0 right-10 w-[45%] h-[45%] bg-gradient-to-bl from-indigo-500/20 to-blue-500/10" />
      </div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Languages className="h-5 w-5 text-indigo-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Агро Преводач</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-5xl px-4 py-8 flex flex-col flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Source Text */}
          <Card className="glass-subtle border-border/60 flex flex-col h-full min-h-[400px]">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg text-foreground font-semibold flex items-center justify-between">
                <span>Оригинален текст</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Поставете текст на английски, немски, френски и др., за да го преведете..."
                className="w-full flex-1 bg-transparent border-none focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
              />
            </CardContent>
          </Card>

          {/* Controls & Target Text (Mobile flows differently) */}
          <div className="hidden lg:flex flex-col items-center justify-center -mx-3 z-10">
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="rounded-full w-14 h-14 bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 flex items-center justify-center"
            >
              {isTranslating ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <ArrowRightLeft className="w-6 h-6 text-white" />}
            </Button>
          </div>

          <Card className="glass-subtle border-border/60 flex flex-col h-full min-h-[400px]">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg text-foreground font-semibold flex items-center justify-between">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="bg-muted/50 border border-border/50 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Български">Към Български</option>
                  <option value="Английски">Към Английски</option>
                  <option value="Немски">Към Немски</option>
                  <option value="Испански">Към Испански</option>
                </select>

                <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!targetText} className="h-8">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Копирано" : "Копирай"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col relative bg-indigo-500/5">
               {error && (
                <div className="absolute top-4 left-4 right-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {isTranslating ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                   <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                   <p className="text-sm">Превеждане на терминологията...</p>
                </div>
              ) : (
                <div className="w-full flex-1 overflow-y-auto custom-scrollbar text-foreground">
                  {targetText ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{targetText}</p>
                  ) : (
                    <p className="text-muted-foreground opacity-50 text-center mt-20">Преводът ще се появи тук.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Translate Button */}
          <div className="lg:hidden mt-2">
            <Button
              onClick={handleTranslate}
              disabled={!sourceText.trim() || isTranslating}
              className="w-full h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20"
            >
              {isTranslating ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Превеждане...</>
              ) : (
                <><ArrowRightLeft className="w-5 h-5 mr-2" /> Преведи</>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
