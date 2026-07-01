"use client";

import Link from "next/link";
import { CloudRain, ShieldAlert, CircleDollarSign, Tractor, LineChart, Cpu, Sun, ArrowUpRight, BrainCircuit } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-16 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-[1400px] flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800 pb-6 shrink-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Cpu className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">AI Farm Command Center</h1>
            </div>
            <p className="text-slate-400">Главно табло за управление. Управлявано от <strong className="text-emerald-400">Super AI Farmer</strong>.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
            <span className="text-sm font-mono text-emerald-400 uppercase tracking-widest">Системата е Синхронизирана</span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 auto-rows-min">
          
          {/* Main AI Agent Action Center */}
          <div className="col-span-1 md:col-span-4 lg:col-span-8 lg:row-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu className="w-48 h-48 text-emerald-500" />
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <BrainCircuit className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Super AI Farmer</h2>
                <p className="text-emerald-400 font-mono text-sm">Главен Оркестратор (LangGraph)</p>
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Дневен План за Действие</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold mr-3 shrink-0">1</span>
                    <p className="text-slate-300 text-sm">Открито е локално засушаване в Блок 101. Пуснете поливната система (Сектор А) за 4 часа.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold mr-3 shrink-0">2</span>
                    <p className="text-slate-300 text-sm">Пазарната цена на слънчогледа се покачи с 5%. Препоръчително е да продадете 30% от наличностите днес в FIELDLOT.</p>
                  </li>
                  <li className="flex items-start">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold mr-3 shrink-0">3</span>
                    <p className="text-slate-300 text-sm">Трактор John Deere #2 се нуждае от смяна на масло след 15 моточаса. Графикът на оператора е свободен утре.</p>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative flex flex-col sm:block gap-3">
              <input 
                type="text" 
                placeholder='Попитай: "Какво трябва да направя тази седмица?"' 
                className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl pl-4 sm:pl-6 pr-4 sm:pr-36 py-3 sm:py-4 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
              />
              <button className="w-full sm:w-auto sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 sm:py-2 rounded-lg font-bold transition-colors">
                Анализирай
              </button>
            </div>
          </div>

          {/* Weather Mini-Module */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <Link href="/weather" className="absolute inset-0 z-10" />
            <div className="flex justify-between items-start mb-4 relative z-20">
              <h3 className="font-bold text-white flex items-center">
                <CloudRain className="w-4 h-4 mr-2 text-blue-400" /> Времето
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="flex items-center mb-6">
              <Sun className="w-12 h-12 text-yellow-400 mr-4" />
              <div>
                <p className="text-3xl font-bold text-white">24°</p>
                <p className="text-sm text-slate-400">Слънчево • Пловдив</p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
              <p className="text-xs text-amber-400 font-bold flex items-center">
                <ShieldAlert className="w-3 h-3 mr-1" /> Очакват се валежи в Сряда
              </p>
            </div>
          </div>

          {/* Finance Mini-Module */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors">
            <Link href="/finance" className="absolute inset-0 z-10" />
            <div className="flex justify-between items-start mb-4 relative z-20">
              <h3 className="font-bold text-white flex items-center">
                <CircleDollarSign className="w-4 h-4 mr-2 text-amber-400" /> Финанси
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Очаквана Печалба</p>
                <p className="text-2xl font-bold text-emerald-400">+124,500 лв</p>
              </div>
              <div className="h-12 flex items-end space-x-1">
                {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-amber-500/40 rounded-t-sm transition-all hover:bg-amber-500" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Satellite & Fields */}
          <div className="col-span-1 md:col-span-2 lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-teal-500/50 transition-colors">
            <Link href="/satellite" className="absolute inset-0 z-10" />
            <div className="flex justify-between items-start mb-4 relative z-20">
              <h3 className="font-bold text-white flex items-center">
                <LineChart className="w-4 h-4 mr-2 text-teal-400" /> Сателит & Полета
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-500 uppercase mb-1">Среден NDVI</p>
                <p className="text-xl font-bold text-teal-400">0.78 <span className="text-xs text-slate-500 font-normal">Нормално</span></p>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                <p className="text-xs text-slate-500 uppercase mb-1">Активни Блокове</p>
                <p className="text-xl font-bold text-white">12 <span className="text-xs text-slate-500 font-normal">от 15</span></p>
              </div>
            </div>
          </div>

          {/* Machinery Mini-Module */}
          <div className="col-span-1 md:col-span-2 lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-slate-400/50 transition-colors">
            <Link href="/agents/machinery" className="absolute inset-0 z-10" />
            <div className="flex justify-between items-start mb-4 relative z-20">
              <h3 className="font-bold text-white flex items-center">
                <Tractor className="w-4 h-4 mr-2 text-slate-400" /> Техника
              </h3>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
            </div>
            <div className="space-y-3 mt-2">
              <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-sm font-bold text-white">Трактор J.D. R8R</span>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">В Движение</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                <span className="text-sm font-bold text-white">Пръскачка R4040</span>
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded">Сервиз (Утре)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
