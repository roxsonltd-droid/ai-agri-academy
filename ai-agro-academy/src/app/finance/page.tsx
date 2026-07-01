"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CircleDollarSign, TrendingUp, Wallet, Calculator, LineChart as LineChartIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIFinanceDirector() {
  const [costs, setCosts] = useState({
    seeds: 12000,
    fertilizers: 35000,
    chemicals: 18000,
    fuel: 25000,
    labor: 15000,
    other: 8000
  });

  const [yieldEstimate, setYieldEstimate] = useState(650); // kg/dka
  const [area, setArea] = useState(1000); // dka
  const [pricePerTon, setPricePerTon] = useState(420); // BGN

  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0);
  const totalRevenue = (yieldEstimate / 1000) * area * pricePerTon;
  const profit = totalRevenue - totalCosts;
  const roi = ((profit / totalCosts) * 100).toFixed(2);
  const costPerDka = (totalCosts / area).toFixed(2);
  const breakEvenYield = ((totalCosts / area) / (pricePerTon / 1000)).toFixed(0);

  const handleCostChange = (key: keyof typeof costs, value: string) => {
    const num = parseInt(value) || 0;
    setCosts(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-200 flex flex-col pt-16 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-yellow-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-7xl flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800 pb-6">
          <div>
            <Link href="/" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-4 text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад към началото
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <CircleDollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">AI Финансов Директор</h1>
            </div>
            <p className="text-slate-400">Оптимизация на печалбата, себестойност и управление на риска.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
              Експорт Отчет
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              Запази Сценарий
            </Button>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-500/30 rounded-2xl p-6 mb-8 flex items-start shadow-lg">
          <div className="p-3 bg-amber-500/20 rounded-full border border-amber-500/40 mr-4 shrink-0">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-1">AI Финансов Анализ</h3>
            <p className="text-slate-300">
              Текущият ви план показва възвръщаемост от <strong className="text-white">{roi}%</strong>. 
              Ако намалите разхода за торове с 10% чрез променлива норма (VRA), печалбата ще се увеличи с <strong className="text-emerald-400">~3,500 лв</strong>. 
              Рентабилността на тази култура е с 18% по-висока от слънчогледа при сегашните пазарни цени.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-amber-500" /> Параметри на полето
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Площ (декара)</label>
                  <input 
                    type="number" 
                    value={area}
                    onChange={(e) => setArea(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Очакван добив (кг/дка)</label>
                  <input 
                    type="number" 
                    value={yieldEstimate}
                    onChange={(e) => setYieldEstimate(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Очаквана цена (лв/тон)</label>
                  <input 
                    type="number" 
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-rose-500" /> Прогнозни Разходи (лв)
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'seeds', label: 'Семена' },
                  { key: 'fertilizers', label: 'Торове' },
                  { key: 'chemicals', label: 'Препарати (ПРЗ)' },
                  { key: 'fuel', label: 'Гориво' },
                  { key: 'labor', label: 'Труд' },
                  { key: 'other', label: 'Други (Рента, Осигуровки)' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <label className="text-sm text-slate-400">{item.label}</label>
                    <input 
                      type="number" 
                      value={costs[item.key as keyof typeof costs]}
                      onChange={(e) => handleCostChange(item.key as keyof typeof costs, e.target.value)}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-right text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Общо Разходи</span>
                  <span className="font-bold text-rose-400">{totalCosts.toLocaleString()} лв</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: KPIs and Charts */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Приходи</p>
                <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} лв</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Печалба</p>
                <p className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {profit >= 0 ? '+' : ''}{profit.toLocaleString()} лв
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Разход / ДКА</p>
                <p className="text-2xl font-bold text-white">{costPerDka} лв</p>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center">
                  ROI <AlertCircle className="w-3 h-3 ml-1 text-slate-400" />
                </p>
                <p className={`text-2xl font-bold ${parseFloat(roi) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {roi}%
                </p>
              </div>
            </div>

            {/* Break Even Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center">
                <LineChartIcon className="w-6 h-6 text-cyan-500 mr-4" />
                <div>
                  <h3 className="font-bold text-white">Точка на безубитъчност (Break-even point)</h3>
                  <p className="text-sm text-slate-400">Минималният добив, необходим за покриване на разходите при текущата цена.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">{breakEvenYield} кг/дка</p>
              </div>
            </div>

            {/* Simulated Chart: Cost Breakdown */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Структура на Разходите</h2>
              <div className="space-y-4">
                {[
                  { key: 'seeds', label: 'Семена', color: 'bg-emerald-500' },
                  { key: 'fertilizers', label: 'Торове', color: 'bg-amber-500' },
                  { key: 'chemicals', label: 'Препарати', color: 'bg-rose-500' },
                  { key: 'fuel', label: 'Гориво', color: 'bg-slate-500' },
                  { key: 'labor', label: 'Труд', color: 'bg-indigo-500' },
                  { key: 'other', label: 'Други', color: 'bg-purple-500' }
                ].map((item) => {
                  const val = costs[item.key as keyof typeof costs];
                  const percent = totalCosts > 0 ? (val / totalCosts) * 100 : 0;
                  return (
                    <div key={item.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-slate-400">{val.toLocaleString()} лв ({percent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
