"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, UploadCloud, ChevronLeft, Loader2, TrendingUp, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { API_BASE } from "@/lib/api";
import ReactMarkdown from "react-markdown";

export default function DataAnalysisPage() {
  const [dataInput, setDataInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!dataInput.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const prompt = `Моля, анализирай следните земеделски данни (добив, метеорология или разходи) и дай кратко заключение за тенденциите и препоръки:\n\n${dataInput}`;
      
      const res = await fetch(`${API_BASE}/api/v1/agents/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) {
        throw new Error("Грешка при комуникация с AI Агента за анализ на данни.");
      }
      
      const data = await res.json();
      setResult(data.reply);
    } catch (err: any) {
      setError(err.message || "Грешка при анализа на данните.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setDataInput(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
        <div className="ai-mesh-blob top-1/4 left-10 w-[55%] h-[45%] bg-gradient-to-tr from-emerald-500/20 to-teal-500/10" />
        <div className="ai-mesh-blob bottom-10 right-0 w-[40%] h-[40%] bg-gradient-to-bl from-cyan-500/10 to-transparent" />
      </div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Добив и Данни</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-subtle border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TableProperties className="h-5 w-5 text-emerald-400" />
                Входни Данни
              </CardTitle>
              <CardDescription>
                Поставете CSV данни от вашата техника или качете файл, за да бъдат анализирани от AI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 px-4 py-6 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10">
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                <UploadCloud className="h-8 w-8 text-emerald-400 mb-2" />
                <span className="text-sm font-semibold text-foreground">Качи CSV файл</span>
              </label>

              <textarea
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                placeholder="Или поставете данните тук (напр. Месец, Добив(тона), Разходи(EUR)...)"
                className="w-full min-h-[200px] bg-card/50 border border-border/50 rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y font-mono text-sm"
              />

              <Button
                onClick={handleAnalyze}
                disabled={!dataInput.trim() || isAnalyzing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 text-md shadow-lg shadow-emerald-500/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI Анализира...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Анализирай данните
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-subtle border-border/60 h-full flex flex-col">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Анализ и Прогнози
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}
              
              {!result && !isAnalyzing && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-50">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-sm">Очаквам данни за анализ. Резултатите ще се появят тук.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <Loader2 className="h-12 w-12 text-emerald-400 animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Търсене на корелации и модели в данните...</p>
                </div>
              )}

              {result && !isAnalyzing && (
                <div className="prose prose-invert prose-emerald prose-sm max-w-none flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
