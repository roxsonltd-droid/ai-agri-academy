"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Sprout, TrendingUp, AlertTriangle, CheckCircle, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || "https://agro-academy-backend.onrender.com";

interface LabResponse {
  status: "success" | "warning" | "danger";
  analysis: string;
  recommendation: string;
  expected_yield: string;
  financial_outlook: string;
}

export default function LabsSoilPage() {
  const [ph, setPh] = useState<number>(6.5);
  const [nitrogen, setNitrogen] = useState<string>("medium");
  const [phosphorus, setPhosphorus] = useState<string>("medium");
  const [potassium, setPotassium] = useState<string>("medium");
  const [targetCrop, setTargetCrop] = useState<string>("Пшеница");
  const [weather, setWeather] = useState<string>("normal");
  const [season, setSeason] = useState<string>("spring");
  const [budget, setBudget] = useState<number>(50);

  const [result, setResult] = useState<LabResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${apiBase()}/api/v1/lab/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ph,
          nitrogen,
          phosphorus,
          potassium,
          target_crop: targetCrop,
          weather,
          season,
          budget,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || `HTTP ${res.status}`);
        return;
      }
      setResult(data as LabResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Мрежова грешка при връзка с бекенда");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "danger": return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default: return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "border-green-500/50 bg-green-500/10";
      case "danger": return "border-red-500/50 bg-red-500/10";
      default: return "border-yellow-500/50 bg-yellow-500/10";
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="ai-mesh">
          <div className="ai-mesh-blob -top-24 right-0 w-[55%] h-[45%] bg-gradient-to-bl from-green-500/20 to-emerald-400/10" />
          <div className="ai-mesh-blob bottom-0 left-0 w-[50%] h-[40%] bg-gradient-to-tr from-accent/15 to-transparent" />
        </div>
      </div>

      <header className="relative z-10 border-b border-border/50 glass-strong px-4 py-3">
        <div className="container mx-auto flex flex-wrap items-center gap-3">
          <Link
            href="/labs"
            className="inline-flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Лаборатории
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-sm font-semibold text-foreground sm:text-base flex items-center gap-2">
            <Leaf className="h-4 w-4 text-green-500" />
            Анализ на почвата
          </h1>
        </div>
      </header>

      <main className="relative z-10 container mx-auto flex-1 px-4 py-8 pt-6 max-w-5xl">
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Въведете агрономическите параметри на вашето поле. AI моделът ще анализира данните, ще съобрази времето и бюджета ви, и ще предложи конкретни препоръки и прогноза за добива.
        </p>

        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <Card className="glass-subtle border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sprout className="h-5 w-5 text-primary" />
                Параметри на полето
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Желана култура</label>
                  <input
                    type="text"
                    value={targetCrop}
                    onChange={(e) => setTargetCrop(e.target.value)}
                    className="w-full rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">pH на почвата</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={(e) => setPh(parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">NPK Баланс (Азот, Фосфор, Калий)</label>
                <div className="grid grid-cols-3 gap-3">
                  <select value={nitrogen} onChange={(e) => setNitrogen(e.target.value)} className="rounded-lg border border-border/80 bg-card/60 px-2 py-2 text-sm">
                    <option value="low">Нисък (N)</option>
                    <option value="medium">Среден (N)</option>
                    <option value="high">Висок (N)</option>
                  </select>
                  <select value={phosphorus} onChange={(e) => setPhosphorus(e.target.value)} className="rounded-lg border border-border/80 bg-card/60 px-2 py-2 text-sm">
                    <option value="low">Нисък (P)</option>
                    <option value="medium">Среден (P)</option>
                    <option value="high">Висок (P)</option>
                  </select>
                  <select value={potassium} onChange={(e) => setPotassium(e.target.value)} className="rounded-lg border border-border/80 bg-card/60 px-2 py-2 text-sm">
                    <option value="low">Нисък (K)</option>
                    <option value="medium">Среден (K)</option>
                    <option value="high">Висок (K)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Метеорологична прогноза</label>
                  <select value={weather} onChange={(e) => setWeather(e.target.value)} className="w-full rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-sm">
                    <option value="normal">Нормално / Балансирано</option>
                    <option value="drought">Суша / Липса на валежи</option>
                    <option value="heavy_rain">Обилни валежи</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Сезон</label>
                  <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-sm">
                    <option value="spring">Пролет</option>
                    <option value="summer">Лято</option>
                    <option value="autumn">Есен</option>
                    <option value="winter">Зима</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Бюджет за инвестиции (EUR/декар)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-border/80 bg-card/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>

              <Button 
                type="button" 
                variant="neon" 
                onClick={runAnalysis} 
                disabled={loading} 
                className="w-full rounded-full mt-4"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                Анализирай с AgroMind AI
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6 flex flex-col">
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!result && !error && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
                <Leaf className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <h3 className="text-sm font-semibold text-foreground">Няма резултати</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                  Попълнете параметрите вляво и стартирайте анализа, за да получите AI препоръка.
                </p>
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-4">
                <div className={`rounded-xl border px-5 py-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getStatusIcon(result.status)}</div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground mb-1 uppercase tracking-wide">Анализ на състоянието</h3>
                      <p className="text-sm text-foreground/90 leading-relaxed">{result.analysis}</p>
                    </div>
                  </div>
                </div>

                <Card className="glass-subtle border-border/60">
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Препоръка за действие</h4>
                      <p className="text-sm text-muted-foreground">{result.recommendation}</p>
                    </div>
                    <div className="h-px bg-border/50 w-full" />
                    <div>
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Очакван добив</h4>
                      <p className="text-sm font-medium text-foreground">{result.expected_yield}</p>
                    </div>
                    <div className="h-px bg-border/50 w-full" />
                    <div>
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Финансова перспектива</h4>
                      <p className="text-sm text-muted-foreground">{result.financial_outlook}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
