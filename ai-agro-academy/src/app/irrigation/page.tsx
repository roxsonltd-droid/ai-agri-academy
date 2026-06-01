"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ChevronLeft, Droplets, Thermometer, Wind, RefreshCw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IrrigationPage() {
  const [moisture, setMoisture] = useState(42);
  const [temperature, setTemperature] = useState(26);
  const [pumpActive, setPumpActive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate changing sensor data
  useEffect(() => {
    const interval = setInterval(() => {
      if (pumpActive) {
        setMoisture(prev => Math.min(prev + 1, 100));
        setTemperature(prev => Math.max(prev - 0.2, 20));
      } else {
        setMoisture(prev => Math.max(prev - 0.5, 0));
        setTemperature(prev => Math.min(prev + 0.1, 35));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [pumpActive]);

  const refreshSensors = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const togglePump = () => {
    setPumpActive(!pumpActive);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
        <div className="ai-mesh-blob top-1/4 right-1/4 w-[40%] h-[40%] bg-gradient-to-tr from-yellow-500/20 to-orange-500/10" />
      </div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-5xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Смарт Напояване (IoT)</h1>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Мониторинг на Блок 1 (Царевица)</h2>
          <Button variant="outline" size="sm" onClick={refreshSensors} disabled={isRefreshing} className="border-border/50">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Синхронизиране
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Moisture Sensor */}
          <Card className="glass-subtle border-border/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Droplets className="w-16 h-16 text-blue-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Влажност на почвата</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className={`text-5xl font-bold ${moisture < 30 ? 'text-red-400' : 'text-blue-400'}`}>
                  {moisture.toFixed(0)}%
                </span>
              </div>
              <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${moisture < 30 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${moisture}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Temperature Sensor */}
          <Card className="glass-subtle border-border/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Thermometer className="w-16 h-16 text-orange-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Температура на почвата</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-orange-400">
                  {temperature.toFixed(1)}°C
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 mt-4 flex items-center">
                <span className="text-green-400 mr-1">Оптимална</span> за развитие
              </p>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="glass-subtle border-yellow-500/30 relative overflow-hidden bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-400 font-medium uppercase tracking-wider flex items-center">
                <Zap className="w-4 h-4 mr-2" /> Проф. АгроМайнд
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moisture < 35 && !pumpActive ? (
                <p className="text-foreground leading-relaxed">
                  Влажността на почвата пада под критичния минимум от 35%. Препоръчително е незабавно активиране на водната помпа.
                </p>
              ) : pumpActive ? (
                <p className="text-foreground leading-relaxed">
                  Помпата работи. Влажността се възстановява. Препоръчително изключване при достигане на 60%.
                </p>
              ) : (
                <p className="text-foreground leading-relaxed">
                  Показателите са в норма. Няма нужда от допълнително напояване през следващите 12 часа.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="glass-strong border border-border/60 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between shadow-card">
          <div>
            <h3 className="text-2xl font-bold mb-2">Главен Кран (Сектор А)</h3>
            <p className="text-muted-foreground">Управление на водната помпа</p>
          </div>
          <Button 
            onClick={togglePump}
            size="lg"
            className={`mt-4 sm:mt-0 rounded-full h-16 px-8 text-lg font-bold shadow-xl transition-all ${
              pumpActive 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 text-white'
            }`}
          >
            <Power className="w-6 h-6 mr-3" />
            {pumpActive ? 'ИЗКЛЮЧИ ПОМПАТА' : 'ВКЛЮЧИ ПОМПАТА'}
          </Button>
        </div>
      </main>
    </div>
  );
}
