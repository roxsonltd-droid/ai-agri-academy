"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, FolderOpen, Calendar, MapPin, Search, ArrowUpRight, CheckCircle2, History, TrendingDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FieldPassport() {
  const [selectedField, setSelectedField] = useState(1);

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-16 overflow-hidden">
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-7xl flex flex-col">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-4 text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад към началото
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Digital Field Passport</h1>
            </div>
            <p className="text-slate-400">Пълна история, агротехнически мероприятия и дигитален двойник.</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              + Добави Мероприятие
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
          
          {/* Sidebar - Field List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Търси парцел..." 
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div className="space-y-3 mt-4">
              {[1, 2, 3].map((field) => (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedField === field 
                      ? "bg-indigo-600/10 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                      : "bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">Блок {field}0{field}</h3>
                    <span className="text-xs font-mono text-indigo-400">124 дка</span>
                  </div>
                  <div className="flex items-center text-xs text-slate-400 mb-1">
                    <MapPin className="w-3 h-3 mr-1" /> Пловдив, Южен
                  </div>
                  <div className="flex items-center text-xs text-emerald-400">
                    Култура: Пшеница (Сорт Енола)
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Digital Twin */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <TrendingDown className="w-20 h-20 text-indigo-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">Разходи до момента</p>
                <p className="text-3xl font-bold text-white">12,450 лв</p>
                <p className="text-xs text-slate-400 mt-2">~100.4 лв/дка</p>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <CheckCircle2 className="w-20 h-20 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">Фаза на развитие</p>
                <p className="text-3xl font-bold text-white">Вретенене</p>
                <p className="text-xs text-emerald-400 mt-2">BBCH 32</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <ArrowUpRight className="w-20 h-20 text-cyan-500" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase mb-1">Очакван добив (AI)</p>
                <p className="text-3xl font-bold text-white">620 кг/дка</p>
                <p className="text-xs text-cyan-400 mt-2">Прогноза базирана на сателит</p>
              </div>
            </div>

            {/* History Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <History className="w-5 h-5 mr-3 text-indigo-400" /> Хронология на обработките
                </h2>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                  Експорт PDF
                </Button>
              </div>

              <div className="relative border-l-2 border-slate-800 pl-6 space-y-8 ml-3">
                
                {/* Timeline Item 1 */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-lg">Хербицидно третиране</h3>
                      <span className="flex items-center text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3 mr-1" /> 12 Март 2026
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">Третиране срещу широколистни плевели с Дерби Супер Едно.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800/50 text-sm">
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Доза</span>
                        <span className="font-semibold text-white">3.3 гр/дка</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Разход</span>
                        <span className="font-semibold text-white">820 лв</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Машина</span>
                        <span className="font-semibold text-white">John Deere R4040</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Изпълнител</span>
                        <span className="font-semibold text-white">Иван Иванов</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white text-lg">Пролетно подхранване</h3>
                      <span className="flex items-center text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3 mr-1" /> 28 Фев 2026
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">Внасяне на Амониев Нитрат (34%).</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/80 p-3 rounded-lg border border-slate-800/50 text-sm">
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Доза</span>
                        <span className="font-semibold text-white">20 кг/дка</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Разход</span>
                        <span className="font-semibold text-white">1,560 лв</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">VRA Карта</span>
                        <span className="font-semibold text-indigo-400">Да (NDRE)</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 mb-1">Време</span>
                        <span className="font-semibold text-white">4°C, Слънчево</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative opacity-50">
                  <div className="absolute -left-[35px] top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="bg-slate-950/30 border border-slate-800 border-dashed p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-400 text-lg">Сеитба Пшеница</h3>
                      <span className="flex items-center text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                        <Calendar className="w-3 h-3 mr-1" /> 15 Окт 2025
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">Засяване на хибрид Енола.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
