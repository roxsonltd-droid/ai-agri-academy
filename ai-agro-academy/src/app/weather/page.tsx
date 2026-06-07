"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CloudRain, Sun, Cloud, Wind, ThermometerSnowflake, Droplets, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WeatherIntelligence() {
  const [selectedDay, setSelectedDay] = useState(0);

  const forecast = [
    { day: "Днес", temp: "24°", icon: Sun, condition: "Слънчево", rain: "0%", wind: "12 км/ч" },
    { day: "Утре", temp: "22°", icon: Cloud, condition: "Облачно", rain: "10%", wind: "15 км/ч" },
    { day: "Сряда", temp: "18°", icon: CloudRain, condition: "Валежи", rain: "85%", wind: "22 км/ч" },
    { day: "Четвъртък", temp: "19°", icon: CloudRain, condition: "Слаби валежи", rain: "60%", wind: "18 км/ч" },
    { day: "Петък", temp: "21°", icon: Sun, condition: "Предимно слънчево", rain: "5%", wind: "10 км/ч" },
    { day: "Събота", temp: "25°", icon: Sun, condition: "Слънчево", rain: "0%", wind: "8 км/ч" },
    { day: "Неделя", temp: "26°", icon: Sun, condition: "Горещо", rain: "0%", wind: "5 км/ч" },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-16">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-5xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-4 text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад към началото
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <CloudRain className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Weather Intelligence</h1>
            </div>
            <p className="text-slate-400">Свързано с метеорологични радари в реално време.</p>
          </div>
        </div>

        {/* AI ALERT WIDGET */}
        <div className="bg-amber-950/30 border border-amber-500/50 rounded-2xl p-6 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <AlertTriangle className="w-32 h-32 text-amber-500" />
          </div>
          <div className="flex items-start">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-500/40 shrink-0 mr-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">AI Метео Предупреждение</h2>
              <p className="text-slate-300 mb-3">
                <strong className="text-amber-400">Внимание:</strong> Анализът на данните показва 85% вероятност за силни валежи в Сряда и Четвъртък. 
                <br className="mb-2" />
                След валежите влажността ще се повиши рязко, което увеличава риска от мана с 60%.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-md flex items-center">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 mr-2" /> Отложете пръскането
                </span>
                <span className="bg-slate-900 border border-slate-700 text-xs px-3 py-1.5 rounded-md flex items-center">
                  <ThermometerSnowflake className="w-3 h-3 text-cyan-400 mr-2" /> Температурата пада с 6°
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Day Forecast Grid */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8">
          {forecast.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                selectedDay === idx 
                  ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)] scale-105" 
                  : "bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-600"
              }`}
            >
              <span className="text-sm font-semibold text-slate-300 mb-3">{day.day}</span>
              <day.icon className={`w-8 h-8 mb-3 ${selectedDay === idx ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-xl font-bold text-white">{day.temp}</span>
            </button>
          ))}
        </div>

        {/* Details for Selected Day */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              {(() => {
                const SelectedIcon = forecast[selectedDay].icon;
                return <SelectedIcon className="w-20 h-20 text-blue-400 mr-6" />;
              })()}
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">{forecast[selectedDay].temp}</h3>
                <p className="text-xl text-slate-400">{forecast[selectedDay].condition}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
              <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 min-w-[140px]">
                <Droplets className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Валежи</p>
                  <p className="text-lg font-bold text-white">{forecast[selectedDay].rain}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 min-w-[140px]">
                <Wind className="w-8 h-8 text-indigo-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Вятър</p>
                  <p className="text-lg font-bold text-white">{forecast[selectedDay].wind}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
