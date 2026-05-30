"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe, ChevronLeft, TrendingUp, TrendingDown, ArrowRight, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { API_BASE } from "@/lib/api";
import ReactMarkdown from "react-markdown";

const mockMarkets = [
  { id: "wheat", name: "Пшеница (MATIF)", price: "235.50", currency: "EUR/t", change: "+2.1%", isUp: true },
  { id: "corn", name: "Царевица (MATIF)", price: "210.00", currency: "EUR/t", change: "-0.5%", isUp: false },
  { id: "sunflower", name: "Слънчоглед", price: "430.00", currency: "EUR/t", change: "+1.2%", isUp: true },
  { id: "rapeseed", name: "Рапица (MATIF)", price: "455.75", currency: "EUR/t", change: "-1.8%", isUp: false },
  { id: "urea", name: "Карбамид (Urea)", price: "340.00", currency: "USD/t", change: "+0.3%", isUp: true },
];

export default function MarketsPage() {
  const [insight, setInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMarketInsight = async () => {
    setIsGenerating(true);
    setInsight(null);

    try {
      const prompt = `Действай като борсов анализатор. Напиши кратък седмичен обзор на зърнените пазари (MATIF - пшеница, царевица, рапица) с насоченост към българския фермер. Какви са глобалните тенденции? (Не ползвай сложен формат, само параграфи).`;
      
      const res = await fetch(`${API_BASE}/api/v1/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) throw new Error("Грешка при генериране на обзора.");
      const data = await res.json();
      setInsight(data.reply);
    } catch (err: any) {
      setInsight("Възникна грешка при свързването с AI анализатора. Опитайте отново по-късно.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
        <div className="ai-mesh-blob top-0 left-0 w-[55%] h-[45%] bg-gradient-to-tr from-sky-500/20 to-blue-500/10" />
      </div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-500/20 rounded-xl">
              <Globe className="h-5 w-5 text-sky-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Глобални Пазари</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-5xl px-4 py-8">
        
        {/* Prices Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {mockMarkets.map(market => (
            <Card key={market.id} className="glass-subtle border-border/60 hover:border-sky-500/30 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center justify-center">
                <span className="text-sm text-muted-foreground mb-2 font-medium">{market.name}</span>
                <span className="text-2xl font-bold text-foreground">{market.price}</span>
                <span className="text-xs text-muted-foreground">{market.currency}</span>
                <div className={`mt-2 flex items-center text-sm font-bold ${market.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {market.isUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {market.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-subtle border-border/60 lg:col-span-2 flex flex-col">
            <CardHeader className="border-b border-border/30 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-sky-400 flex items-center gap-2">
                  <Landmark className="h-5 w-5" /> AI Борсов Анализатор
                </CardTitle>
                <CardDescription>Изготвяне на специализиран обзор на пазара.</CardDescription>
              </div>
              <Button onClick={generateMarketInsight} disabled={isGenerating} size="sm" className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Генерирай обзор
              </Button>
            </CardHeader>
            <CardContent className="pt-6 flex-1 bg-sky-500/5">
               {isGenerating && (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-10">
                   <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-4" />
                   <p className="text-sm">Анализиране на борсовите индекси...</p>
                </div>
              )}
              {!isGenerating && !insight && (
                <div className="flex flex-col items-center justify-center h-full opacity-50 py-10 text-center">
                   <Landmark className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                   <p className="text-sm max-w-sm">Кликнете бутона "Генерирай обзор", за да позволите на изкуствения интелект да обобщи ситуацията на глобалните пазари.</p>
                </div>
              )}
              {insight && !isGenerating && (
                 <div className="prose prose-invert prose-sky prose-sm max-w-none text-foreground leading-relaxed custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
                   <ReactMarkdown>{insight}</ReactMarkdown>
                 </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-subtle border-border/60">
            <CardHeader className="border-b border-border/30 pb-4">
              <CardTitle className="text-lg">Новини в реално време</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[
                { time: "10:45", text: "Фючърсите на пшеницата в Чикаго бележат лек ръст." },
                { time: "09:30", text: "Доклад на USDA: Очаква се по-висок добив на царевица в САЩ." },
                { time: "Вчера", text: "Сушата в Южна Америка продължава да притеснява търговците." },
                { time: "Вчера", text: "Цената на карбамида се стабилизира на европейските пазари." },
              ].map((news, i) => (
                <div key={i} className="flex flex-col border-b border-border/20 pb-3 last:border-0">
                  <span className="text-xs font-semibold text-sky-400 mb-1">{news.time}</span>
                  <p className="text-sm text-muted-foreground leading-snug">{news.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
