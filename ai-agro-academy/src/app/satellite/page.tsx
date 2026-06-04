"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Satellite, Map, Layers, Activity, Search, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SatelliteMonitoring() {
  const [activeLayer, setActiveLayer] = useState<"NDVI" | "NDRE" | "RGB">("NDVI");

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-16 overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-7xl flex flex-col h-[calc(100vh-8rem)]">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-slate-800 pb-4 shrink-0">
          <div>
            <Link href="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-4 text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад към началото
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <Satellite className="w-5 h-5 text-teal-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">AI Satellite Monitoring</h1>
            </div>
            <p className="text-slate-400">Синхронизирано с Sentinel-2 и Copernicus. Резолюция: 10m/px.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse mr-3" />
            <span className="text-sm font-mono text-teal-400 uppercase tracking-widest">Sentinel-2: СВЪРЗАН</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 flex flex-col overflow-y-auto custom-scrollbar pr-2">
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Търси парцел..." 
                className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
              />
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <Layers className="w-4 h-4 mr-2" /> Слоеве
              </h3>
              <div className="space-y-2">
                {(["NDVI", "NDRE", "RGB"] as const).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-bold transition-all ${
                      activeLayer === layer 
                        ? "bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {layer === "NDVI" && "NDVI (Вегетационен индекс)"}
                    {layer === "NDRE" && "NDRE (Азотен статус)"}
                    {layer === "RGB" && "RGB (Реални цветове)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <Map className="w-4 h-4 mr-2" /> Парцели
              </h3>
              <div className="space-y-2">
                {[1, 2, 3].map((field) => (
                  <div key={field} className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-teal-500/30 cursor-pointer transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-white group-hover:text-teal-400 transition-colors">Блок {field}0{field} (Пшеница)</h4>
                      <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Здрав</span>
                    </div>
                    <p className="text-xs text-slate-500">124 дка • Последна снимка: Днес</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20" />
            
            {/* Simulated Field Polygon */}
            <div className="relative z-10 w-2/3 h-2/3 max-w-md">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                {activeLayer === "NDVI" && (
                  <polygon points="10,20 80,10 90,80 20,90" fill="rgba(34, 197, 94, 0.6)" stroke="#14b8a6" strokeWidth="1" />
                )}
                {activeLayer === "NDRE" && (
                  <polygon points="10,20 80,10 90,80 20,90" fill="url(#ndreGradient)" stroke="#f59e0b" strokeWidth="1" />
                )}
                {activeLayer === "RGB" && (
                  <polygon points="10,20 80,10 90,80 20,90" fill="#4a5568" stroke="#718096" strokeWidth="1" />
                )}
                <defs>
                  <linearGradient id="ndreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(245, 158, 11, 0.6)" />
                    <stop offset="100%" stopColor="rgba(34, 197, 94, 0.6)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Problem area marker */}
              {activeLayer !== "RGB" && (
                <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-red-500/20 rounded-full border border-red-500/50 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  <Activity className="w-4 h-4 text-red-500" />
                </div>
              )}
            </div>

            {/* Map UI Overlay */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button size="icon" variant="outline" className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800 backdrop-blur-md">
                +
              </Button>
              <Button size="icon" variant="outline" className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800 backdrop-blur-md">
                -
              </Button>
              <Button size="icon" variant="outline" className="bg-slate-900/80 border-slate-700 text-white hover:bg-slate-800 backdrop-blur-md mt-4">
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute bottom-4 inset-x-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm mb-1">Анализ от {activeLayer}</h4>
                  <p className="text-xs text-slate-400">
                    {activeLayer === "NDVI" && "Растителността е в норма. Открито е малко петно със стрес в северозападната част."}
                    {activeLayer === "NDRE" && "Азотният статус показва лек дефицит в краищата на масива. Препоръчва се променлива норма на торене (VRA)."}
                    {activeLayer === "RGB" && "Реални цветове към дата 04 Юни 2026. Няма облачност."}
                  </p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-500 text-white ml-4 shrink-0 shadow-[0_0_15px_rgba(13,148,136,0.3)]">
                  Създай VRA карта
                </Button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
