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
          bg: "bg-[#F0FDF4]",
          border: "border-[#059669]",
          icon: <CheckCircle2 className="h-8 w-8 text-[#059669]" />,
          titleText: "Отличен избор!",
          titleColor: "text-[#059669]"
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
          bg: "bg-[#F6F9FC]",
          border: "border-[#E6EBF1]",
          icon: <Beaker className="h-8 w-8 text-[#94A3B8]" />,
          titleText: "Резултат",
          titleColor: "text-[#0A2540]"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans text-[#0A2540] flex flex-col pt-20">
      
      {/* Top Header */}
      <div className="bg-white border-b border-[#E6EBF1] h-14 flex items-center px-4 lg:px-8 shadow-sm flex-shrink-0 z-10">
        <Link href="/dashboard" className="flex items-center text-[#425466] hover:text-[#0A2540] transition-colors text-sm font-medium mr-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад към портала
        </Link>
        <div className="h-4 w-[1px] bg-[#E6EBF1] mx-4 hidden sm:block"></div>
        <h1 className="text-[15px] font-semibold text-[#0A2540] hidden sm:block">
          AI Лаборатория: Почвен Симулатор
        </h1>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E6EBF1]">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 bg-[#F0FDF4] rounded-xl flex items-center justify-center mr-4">
                <Beaker className="h-6 w-6 text-[#059669]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Входни Данни</h2>
                <p className="text-[#425466] text-sm mt-1">Въведете параметрите на полето</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Crop Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2">Желана култура за отглеждане</label>
                <select 
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-[#E6EBF1] bg-[#F6F9FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#059669]/20 transition-all font-medium"
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
                  <span className="text-[#059669] font-bold text-lg">{ph}</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="14" step="0.1" 
                  value={ph}
                  onChange={(e) => setPh(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#E6EBF1] rounded-lg appearance-none cursor-pointer accent-[#059669]"
                />
                <div className="flex justify-between text-xs text-[#94A3B8] mt-1 font-medium">
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
                    className="w-full h-10 px-3 rounded-lg border border-[#E6EBF1] text-sm focus:outline-none focus:border-[#059669]"
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
                    className="w-full h-10 px-3 rounded-lg border border-[#E6EBF1] text-sm focus:outline-none focus:border-[#059669]"
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
                    className="w-full h-10 px-3 rounded-lg border border-[#E6EBF1] text-sm focus:outline-none focus:border-[#059669]"
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
                    className="w-full h-10 px-3 rounded-lg border border-[#E6EBF1] text-sm focus:outline-none focus:border-[#059669]"
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
                    className="w-full h-10 px-3 rounded-lg border border-[#E6EBF1] text-sm focus:outline-none focus:border-[#059669]"
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
                  <span className="text-[#0A2540] font-bold text-lg">{budget} €</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="500" step="10" 
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#E6EBF1] rounded-lg appearance-none cursor-pointer accent-[#0A2540]"
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full h-14 mt-4 bg-[#0A2540] hover:bg-[#1a365d] text-white text-lg font-semibold rounded-xl shadow-md transition-all flex items-center justify-center"
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
              <div className="flex-1 border-2 border-dashed border-[#E6EBF1] rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-white/50">
                <div className="h-20 w-20 bg-[#F6F9FC] rounded-full flex items-center justify-center mb-6">
                  <Beaker className="h-10 w-10 text-[#94A3B8]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A2540] mb-2">Готови за симулация</h3>
                <p className="text-[#425466] max-w-sm">Настройте параметрите на почвата вляво и кликнете <span className="font-semibold text-[#0A2540]">Анализирай</span>, за да получите експертна оценка от Проф. АгроМайнд.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 border border-[#E6EBF1] rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-white shadow-sm">
                <Loader2 className="h-16 w-16 text-[#059669] animate-spin mb-6" />
                <h3 className="text-xl font-bold text-[#0A2540] mb-2">Проф. АгроМайнд мисли...</h3>
                <p className="text-[#425466] max-w-sm">Извършва се анализ на химичния състав и съвместимостта с културата.</p>
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
                  
                  <div className="bg-white/80 rounded-xl p-5 mb-4 shadow-sm">
                    <h4 className="font-bold text-[#0A2540] mb-2 text-sm uppercase tracking-wider opacity-70">Агрономически Анализ</h4>
                    <p className="text-[#425466] leading-relaxed">{result.analysis}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/80 rounded-xl p-5 shadow-sm flex flex-col justify-center">
                      <h4 className="font-bold text-[#0A2540] mb-1 text-sm uppercase tracking-wider opacity-70">Очакван Добив</h4>
                      <div className="flex items-center mt-1">
                        {result.expected_yield === "Слаб" ? <TrendingDown className="h-6 w-6 text-red-500 mr-2" /> : <TrendingUp className={`h-6 w-6 mr-2 ${result.expected_yield === "Висок" ? "text-[#059669]" : "text-amber-500"}`} />}
                        <span className="text-xl font-bold text-[#0A2540]">{result.expected_yield}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 rounded-xl p-5 shadow-sm flex flex-col justify-center">
                      <h4 className="font-bold text-[#0A2540] mb-1 text-sm uppercase tracking-wider opacity-70">Финансова Прогноза</h4>
                      <p className="text-[#425466] text-sm font-medium leading-tight">{result.financial_outlook}</p>
                    </div>
                  </div>

                  <div className="bg-[#0A2540] text-white rounded-xl p-5 shadow-sm border-l-4 border-l-[#059669]">
                    <h4 className="font-bold mb-2 text-sm uppercase tracking-wider text-[#059669]">Експертна Препоръка</h4>
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

