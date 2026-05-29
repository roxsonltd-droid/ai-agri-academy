"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Beaker, CheckCircle2, AlertTriangle, XCircle, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type LabResult = {
  status: string;
  analysis: string;
  recommendation: string;
  expected_yield?: string;
  financial_outlook?: string;
};

export default function LabPage() {
  const [ph, setPh] = useState<number>(6.5);
  const [nitrogen, setNitrogen] = useState<string>("medium");
  const [phosphorus, setPhosphorus] = useState<string>("medium");
  const [potassium, setPotassium] = useState<string>("medium");
  const [targetCrop, setTargetCrop] = useState<string>("Царевица");
  const [weather, setWeather] = useState<string>("нормално");
  const [season, setSeason] = useState<string>("Пролет");
  const [budget, setBudget] = useState<number>(150);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LabResult | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/lab/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ph,
          nitrogen,
          phosphorus,
          potassium,
          target_crop: targetCrop,
          weather,
          season,
          budget
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        throw new Error("API Error");
      }
    } catch {
      setResult({
        status: "danger",
        analysis: "Възникна грешка при връзката с AI Лабораторията.",
        recommendation: "Моля, опитайте отново по-късно."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return {
          bg: "bg-app-success-bg",
          border: "border-app-primary",
          icon: <CheckCircle2 className="h-8 w-8 text-app-primary" />,
          titleText: "Отличен избор!",
          titleColor: "text-app-primary",
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-500",
          icon: <AlertTriangle className="h-8 w-8 text-amber-500" />,
          titleText: "Внимание",
          titleColor: "text-amber-600"
        };
      case "danger":
        return {
          bg: "bg-red-50",
          border: "border-red-500",
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          titleText: "Неподходящо",
          titleColor: "text-red-600"
        };
      default:
        return {
          bg: "bg-app-surface",
          border: "border-app-border",
          icon: <Beaker className="h-8 w-8 text-app-placeholder" />,
          titleText: "Резултат",
          titleColor: "text-app-ink",
        };
    }
  };

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground flex flex-col pt-20">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-25">
        <div className="ai-mesh h-full">
          <div className="ai-mesh-blob -top-10 left-0 w-[50%] h-[45%] bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="ai-mesh-blob bottom-0 right-10 w-[40%] h-[40%] bg-gradient-to-tl from-accent/15 to-transparent" />
        </div>
      </div>

      {/* Top Header */}
      <div className="glass-strong border-b border-border/50 h-14 flex items-center px-4 lg:px-8 shadow-sm flex-shrink-0 z-10 backdrop-blur-xl gap-3">
        <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium rounded-full px-2 py-1 hover:bg-muted/70 shrink-0">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад към портала
        </Link>
        <div className="h-4 w-px bg-border hidden sm:block shrink-0" />
        <h1 className="text-[15px] font-semibold text-foreground hidden sm:block truncate min-w-0 flex-1">
          AI Лаборатория: Почвен Симулатор
        </h1>
        <Link
          href="/labs/vision"
          className="text-sm font-semibold text-primary hover:underline shrink-0"
        >
          Roboflow CV →
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="glass-subtle rounded-2xl p-8 shadow-card border border-border/60 backdrop-blur-md">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 border border-primary/20">
                <Beaker className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Входни Данни</h2>
                <p className="text-muted-foreground text-sm mt-1">Въведете параметрите на полето</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Crop Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Желана култура за отглеждане</label>
                <select 
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border/80 bg-muted/50 backdrop-blur-sm focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all font-medium text-foreground"
                >
                  <option value="Царевица">Царевица</option>
                  <option value="Пшеница">Пшеница</option>
                  <option value="Слънчоглед">Слънчоглед</option>
                  <option value="Рапица">Рапица</option>
                  <option value="Люцерна">Люцерна</option>
                </select>
              </div>

              {/* pH Slider */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold">Киселинност (pH)</label>
                  <span className="text-primary font-bold text-lg">{ph}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="14" step="0.1" 
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-subtle-foreground mt-1 font-medium">
                  <span>Силно кисела (0)</span>
                  <span>Неутрална (7)</span>
                  <span>Силно алкална (14)</span>
                </div>
              </div>

              {/* NPK Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Азот (N)</label>
                  <select 
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-card/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="low">Ниско</option>
                    <option value="medium">Средно</option>
                    <option value="high">Високо</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Фосфор (P)</label>
                  <select 
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-card/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="low">Ниско</option>
                    <option value="medium">Средно</option>
                    <option value="high">Високо</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Калий (K)</label>
                  <select 
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-card/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="low">Ниско</option>
                    <option value="medium">Средно</option>
                    <option value="high">Високо</option>
                  </select>
                </div>
              </div>
              
              {/* Weather, Season, Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Сезон на засаждане</label>
                  <select 
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-card/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="Пролет">Пролет</option>
                    <option value="Лято">Лято</option>
                    <option value="Есен">Есен</option>
                    <option value="Зима">Зима</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Време / Валежи</label>
                  <select 
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border/80 bg-card/50 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  >
                    <option value="суша">☀️ Суша</option>
                    <option value="нормално">⛅ Нормално</option>
                    <option value="обилни валежи">🌧️ Обилни валежи</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-semibold">Бюджет (EUR/декар)</label>
                  <span className="text-foreground font-bold text-lg">{budget} €</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="500" step="10" 
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-foreground"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                variant="default"
                className="w-full h-14 mt-4 text-lg font-semibold rounded-xl shadow-md glow-primary"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Анализиране...
                  </>
                ) : (
                  "Анализирай Почвата"
                )}
              </Button>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="flex flex-col h-full">
            {!result && !isAnalyzing && (
              <div className="flex-1 border-2 border-dashed border-border/70 rounded-2xl flex flex-col items-center justify-center text-center p-8 glass-subtle backdrop-blur-md">
                <div className="h-20 w-20 bg-muted/60 rounded-full flex items-center justify-center mb-6 ring-1 ring-border/50">
                  <Beaker className="h-10 w-10 text-subtle-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Готови за симулация</h3>
                <p className="text-muted-foreground max-w-sm">
                  Настройте параметрите на почвата вляво и кликнете{" "}
                  <span className="font-semibold text-foreground">Анализирай</span>, за да получите експертна оценка от Проф.
                  АгроМайнд.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 border border-border/60 rounded-2xl flex flex-col items-center justify-center text-center p-8 glass backdrop-blur-md shadow-card">
                <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                <h3 className="text-xl font-bold text-foreground mb-2">Проф. АгроМайнд мисли...</h3>
                <p className="text-muted-foreground max-w-sm">Извършва се анализ на химичния състав и съвместимостта с културата.</p>
              </div>
            )}

            {result && !isAnalyzing && (() => {
              const config = getStatusConfig(result.status);
              return (
                <div className={`flex-1 border rounded-2xl p-8 shadow-sm transition-all duration-500 ease-in-out ${config.bg} ${config.border}`}>
                  <div className="flex items-center mb-6">
                    {config.icon}
                    <h3 className={`text-2xl font-bold ml-4 ${config.titleColor}`}>{config.titleText}</h3>
                  </div>
                  
                  <div className="glass-subtle rounded-xl p-5 mb-4 border border-border/50">
                    <h4 className="font-bold text-foreground mb-2 text-sm uppercase tracking-wider opacity-70">Агрономически Анализ</h4>
                    <p className="text-muted-foreground leading-relaxed">{result.analysis}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="glass-subtle rounded-xl p-5 border border-border/50 flex flex-col justify-center">
                      <h4 className="font-bold text-foreground mb-1 text-sm uppercase tracking-wider opacity-70">Очакван Добив</h4>
                      <div className="flex items-center mt-1">
                        {result.expected_yield === "Слаб" ? (
                          <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                        ) : (
                          <TrendingUp
                            className={`h-6 w-6 mr-2 ${result.expected_yield === "Висок" ? "text-primary" : "text-amber-500"}`}
                          />
                        )}
                        <span className="text-xl font-bold text-foreground">{result.expected_yield}</span>
                      </div>
                    </div>
                    <div className="glass-subtle rounded-xl p-5 border border-border/50 flex flex-col justify-center">
                      <h4 className="font-bold text-foreground mb-1 text-sm uppercase tracking-wider opacity-70">Финансова Прогноза</h4>
                      <p className="text-muted-foreground text-sm font-medium leading-tight">{result.financial_outlook}</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-5 shadow-inner bg-band text-band-foreground border-l-4 border-l-primary ring-1 ring-cyan-400/15">
                    <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-primary">Експертна Препоръка</h4>
                    <p className="leading-relaxed font-medium">{result.recommendation}</p>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}

