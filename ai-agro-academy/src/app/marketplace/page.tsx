"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, MapPin, Wheat, Tractor, Map, TrendingUp, Filter, Tag, Clock, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("grains");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pt-20 pb-20">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-amber-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-orange-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">FIELDLOT Marketplace</h1>
            </div>
            <p className="text-slate-400">Първият AI-управляван пазар за земеделска продукция, техника и земя.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6">
              <Tag className="w-4 h-4 mr-2" /> Добави Обява
            </Button>
          </div>
        </div>

        {/* AI Broker Widget */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
            <TrendingUp className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center">
              AI Брокер Анализ <ShieldCheck className="w-4 h-4 text-emerald-400 ml-2" />
            </h3>
            <p className="text-slate-300 text-sm">
              Цената на пшеницата днес е <strong className="text-emerald-400">с 4% по-висока</strong> спрямо миналата седмица. AI препоръчва да продавате сега. Има повишено търсене на комбайни под наем в регион Пловдив.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
            Виж Борсови Цени
          </Button>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex flex-col sm:flex-row bg-slate-900 rounded-xl p-1 border border-slate-800 w-full lg:w-auto gap-1 sm:gap-0">
            <button
              onClick={() => setActiveTab("grains")}
              className={`flex-1 lg:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'grains' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Wheat className="w-4 h-4 mr-2" /> Продукция
            </button>
            <button
              onClick={() => setActiveTab("machinery")}
              className={`flex-1 lg:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'machinery' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Tractor className="w-4 h-4 mr-2" /> Техника
            </button>
            <button
              onClick={() => setActiveTab("land")}
              className={`flex-1 lg:px-6 py-3 sm:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${activeTab === 'land' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Map className="w-4 h-4 mr-2" /> Земя
            </button>
          </div>
          
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Търси пшеница, трактори под наем, парцели..." 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Grains Listings */}
          {activeTab === "grains" && (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                  <Image src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=500" alt="Пшеница" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 z-20 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">Продава</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">Хлебна пшеница</h3>
                    <span className="font-bold text-amber-400">420 лв/т</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Качество: Протеин 12.5%, Глутен 26%. Наличност: 500 тона.</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Добрич</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Преди 2ч</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center">
                       <div className="w-6 h-6 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-[10px] font-bold">АИ</div>
                       <span className="text-xs text-slate-300">Агро Инвест</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2">Свържи се</Button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                  <Image src="https://images.unsplash.com/photo-1601398863623-6cb61d9a5b3a?auto=format&fit=crop&q=80&w=500" alt="Царевица" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 z-20 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">Продава</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">Царевица</h3>
                    <span className="font-bold text-amber-400">380 лв/т</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Влага 14%. Подходяща за фураж. Наличност: 200 тона.</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Плевен</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Преди 5ч</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center">
                       <div className="w-6 h-6 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-[10px] font-bold">ИГ</div>
                       <span className="text-xs text-slate-300">Иван Георгиев</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2">Свържи се</Button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-48 bg-slate-800 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
                  <div className="absolute inset-0 bg-blue-900/10 z-0" />
                  <div className="absolute top-3 left-3 z-20 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Купува</div>
                  <Wheat className="w-16 h-16 text-blue-500/50 z-10" />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">Търся Слънчоглед</h3>
                    <span className="font-bold text-blue-400">По договаряне</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Търся маслодаен слънчоглед. Количество: до 1000 тона.</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Цялата страна</span>
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Днес</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center">
                       <div className="w-6 h-6 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-[10px] font-bold">ОК</div>
                       <span className="text-xs text-slate-300">Оливас ООД</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2">Оферирай</Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Machinery Listings */}
          {activeTab === "machinery" && (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                  <Image src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=500" alt="Трактор" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 z-20 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">Дава под наем</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">Трактор John Deere 8R</h3>
                    <span className="font-bold text-amber-400">120 лв/час</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">С включен оператор и гориво. Свободен от другата седмица.</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Стара Загора</span>
                    <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-amber-400" /> 4.9 (12 наема)</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">Резервирай</Button>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                  <Image src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=500" alt="Комбайн" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 z-20 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">Продава</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">Комбайн CLAAS Lexion</h3>
                    <span className="font-bold text-amber-400">240,000 лв</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Година: 2018. Моточасове: 2500. Отлично състояние.</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> Русе</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">Виж детайли</Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Land Listings */}
          {activeTab === "land" && (
            <>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group">
                <div className="h-48 bg-slate-800 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                  <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=500" alt="Нива" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 z-20 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">Дава под Аренда</div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-lg">Земеделска земя 50 дка</h3>
                    <span className="font-bold text-amber-400">80 лв/дка</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">Категория 3. Равна, обработвана до момента.</p>
                  <div className="flex items-center text-xs text-slate-500 mb-4 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> с. Труд, Пловдив</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center">
                       <div className="w-6 h-6 rounded-full bg-slate-700 mr-2 flex items-center justify-center text-[10px] font-bold">СМ</div>
                       <span className="text-xs text-slate-300">Спас Маринов</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-8 px-2">Свържи се</Button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
