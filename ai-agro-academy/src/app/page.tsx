"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bot, Code2, Image as ImageIcon, Video, Music, FileText, BarChart3, Globe, Zap, Mic, Languages } from "lucide-react";
import Link from "next/link";
import { easeCinematic, staggerInViewContainer, transitionCinematic, viewportFadeUpVariants } from "@/lib/motion";

export default function Home() {
  const reduceMotion = useReducedMotion();

  const features = [
    { title: "Агро Чат", desc: "Разговаряйте с най-добрите AI модели (GPT-4o, Claude 3) за земеделие.", icon: MessageSquare, color: "from-teal-400 to-teal-500", bg: "bg-teal-500/10", href: "/chat" },
    { title: "Автономни Агенти", desc: "Агенти, които мислят, планират и управляват вашите ресурси автономно.", icon: Bot, color: "from-purple-400 to-purple-500", bg: "bg-purple-500/10" },
    { title: "Симулации", desc: "Тествайте стратегии за засаждане и торене във виртуална среда.", icon: Code2, color: "from-blue-400 to-blue-500", bg: "bg-blue-500/10" },
    { title: "Анализ на Снимки", desc: "Разпознаване на болести по растенията чрез компютърно зрение.", icon: ImageIcon, color: "from-orange-400 to-orange-500", bg: "bg-orange-500/10" },
    { title: "Видео Уроци", desc: "Генериране на 3D видео симулации за работа с агро техника.", icon: Video, color: "from-red-400 to-red-500", bg: "bg-red-500/10" },
    { title: "Гласов Асистент", desc: "Диктувайте бележки на полето и ги превръщайте в отчети.", icon: Mic, color: "from-pink-400 to-pink-500", bg: "bg-pink-500/10" },
    { title: "Център за Документи", desc: "Анализирайте почвени проби, сертификати и PDF ръководства.", icon: FileText, color: "from-cyan-400 to-cyan-500", bg: "bg-cyan-500/10" },
    { title: "Добив и Данни", desc: "Качвайте таблици и получавайте моментални AI прогнози за добива.", icon: BarChart3, color: "from-emerald-400 to-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Мултиезичност", desc: "Превеждайте земеделска литература от над 100 езика моментално.", icon: Languages, color: "from-indigo-400 to-indigo-500", bg: "bg-indigo-500/10" },
    { title: "Смарт Напояване", desc: "Интеграция с IoT сензори за автоматично контролиране на водата.", icon: Zap, color: "from-yellow-400 to-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Глобални Пазари", desc: "Следете борсовите цени на зърното в реално време.", icon: Globe, color: "from-sky-400 to-sky-500", bg: "bg-sky-500/10" },
    { title: "Агро Подкаст", desc: "Генерирайте аудио резюмета на последните агро-новини за слушане в трактора.", icon: Music, color: "from-rose-400 to-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19]">
      {/* Centered Hero Section */}
      <section className="relative w-full pt-40 pb-20 md:pt-48 md:pb-28 overflow-hidden flex flex-col items-center text-center">
        {/* Background glow - Optimized blur for performance */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent blur-[40px] md:blur-[60px] -z-10 rounded-full" />
        
        <div className="container px-6 lg:px-8 mx-auto z-10 flex flex-col items-center">
          
          <motion.div
            initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { ...transitionCinematic, delay: 0.1, ease: easeCinematic }}
            className="flex flex-col items-center"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-8 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgb(52_211_153/0.8)]" />
              <span className="text-sm font-medium text-slate-300">
                100% Безплатно — Не се изисква кредитна карта
              </span>
            </div>
            
            {/* Massive Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] max-w-5xl">
              Всички Агро Инструменти.<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Една Платформа.</span><br />
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Нула Усилия.</span>
            </h1>
            
            {/* Subtitle */}
            <p className="max-w-2xl text-lg md:text-xl text-slate-400 mt-8 font-medium leading-relaxed">
              Обучавай AI агенти, които анализират почви, управляват дронове и предвиждат добиви — всички захранвани от най-добрите AI модели в света.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full pb-32 relative z-10">
        <div className="container px-4 md:px-8 mx-auto">
          <motion.div 
            initial={reduceMotion ? "animate" : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerInViewContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {features.map((feature, idx) => {
              const CardContent = (
                <div className="relative h-full bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-[2rem] overflow-hidden group hover:border-white/20 transition-all duration-500">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 md:mb-8 border border-white/5 group-hover:scale-110 transition-transform duration-500 ease-out`}>
                      <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-white opacity-90" />
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mt-auto">
                      {feature.desc}
                    </p>
                  </div>

                  {/* Hover Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                </div>
              );

              return (
                <motion.div key={idx} variants={viewportFadeUpVariants} className="h-full">
                  {feature.href ? (
                    <Link href={feature.href} className="block h-full cursor-pointer">
                      {CardContent}
                    </Link>
                  ) : (
                    CardContent
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
