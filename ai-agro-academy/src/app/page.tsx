"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Tractor, Droplets, Wind, ArrowRight, BrainCircuit, Play, User, Activity, ChevronRight, BarChart3, CloudRain, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section with Slanted Background */}
      <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Stripe-like Slanted Background */}
        <div className="absolute top-0 left-0 right-0 h-full w-full slanted-bg -z-10 bg-[#F6F9FC] overflow-hidden">
           {/* Animated Gradient Mesh (Simulated with CSS) */}
           <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[100%] bg-gradient-to-bl from-[#059669]/10 via-[#00D4FF]/10 to-transparent rounded-full blur-[80px] -z-10 transform rotate-12" />
           <div className="absolute top-[20%] -left-[10%] w-[50%] h-[80%] bg-gradient-to-tr from-[#FF6B6B]/5 via-[#059669]/10 to-transparent rounded-full blur-[100px] -z-10" />
        </div>
        
        <div className="container px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center rounded-full border border-[#E6EBF1] bg-white px-3 py-1 text-sm font-semibold text-[#425466] shadow-sm mb-6">
                <span className="flex h-2 w-2 rounded-full bg-[#059669] mr-2"></span>
                Платформа от следващо поколение
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A2540] leading-[1.1]">
                Интелигентна инфраструктура <br className="hidden md:block" />
                за <span className="text-[#059669]">модерно земеделие</span>
              </h1>
              
              <p className="max-w-[600px] text-lg md:text-xl text-[#425466] mt-6 font-medium leading-relaxed">
                AI Agro Academy обединява изкуствен интелект, виртуални лаборатории и експертни знания в една цялостна екосистема. Обучавай се по-умно, не по-трудно.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button variant="default" size="lg" className="w-full sm:w-auto font-semibold">
                    Започни веднага <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                  Свържи се с продажби
                </Button>
              </div>
            </motion.div>
            
            {/* Right Graphic (Dashboard Mockup) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl bg-white border border-[#E6EBF1] stripe-shadow p-2 w-full max-w-lg ml-auto z-10 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
                {/* Mockup Header */}
                <div className="flex items-center space-x-2 px-4 py-3 border-b border-[#E6EBF1] bg-[#F6F9FC] rounded-t-xl">
                  <div className="flex space-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-auto h-4 w-1/2 bg-white rounded-full border border-[#E6EBF1] shadow-sm" />
                </div>
                {/* Mockup Body */}
                <div className="p-6 bg-white rounded-b-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[#0A2540]">Анализ на почвата</h4>
                      <p className="text-sm text-[#425466]">Проф. Соил (AI)</p>
                    </div>
                    <div className="h-10 w-10 bg-[#059669]/10 rounded-full flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-[#059669]" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[95, 75, 45].map((w, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-2 flex-1 bg-[#F6F9FC] rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#059669] to-[#00D4FF]" style={{ width: `${w}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#0A2540]">{w}%</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-[#F6F9FC] rounded-lg border border-[#E6EBF1]">
                    <div className="flex items-start space-x-3">
                       <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5" />
                       <p className="text-sm text-[#425466] font-medium leading-relaxed">
                         Въз основа на последните данни от дрона, препоръчвам увеличаване на азотното торене в сектор B-4.
                       </p>
                    </div>
                  </div>
                  <Button variant="neon" size="sm" className="w-full">Приложи препоръката</Button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* API / Features Section */}
      <section id="courses" className="w-full py-24 bg-white relative z-10">
        <div className="container px-6 lg:px-8 mx-auto">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mb-16 max-w-3xl"
          >
            <h2 className="text-[#059669] font-bold tracking-wide uppercase text-sm mb-3">Обучителна Екосистема</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-[#0A2540] leading-tight">
              Напълно интегриран набор от <br /> 
              модерни агро дисциплини.
            </h3>
            <p className="text-lg text-[#425466] mt-4 font-medium">
              От основите на растениевъдството до най-сложните автономни системи.
            </p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: "Растениевъдство", icon: Sprout, desc: "От семето до реколтата с детайлни AI анализи и диагностика." },
              { title: "Агро Дронове", icon: Wind, desc: "Специализирани курсове за RTK системи и прецизно пръскане." },
              { title: "Smart Машини", icon: Tractor, desc: "Обучения за GPS навигация, автономия и тежка техника." },
              { title: "Оранжерии", icon: Droplets, desc: "Оптимизация на микроклимата, водата и LED осветлението." }
            ].map((course, idx) => (
              <motion.div key={idx} variants={fadeUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded bg-[#F6F9FC] flex items-center justify-center mb-2 shadow-sm border border-[#E6EBF1]">
                      <course.icon className="h-6 w-6 text-[#0A2540]" />
                    </div>
                    <CardTitle className="text-xl text-[#0A2540]">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#425466] font-medium leading-relaxed">{course.desc}</p>
                    <Link href="/dashboard" className="inline-flex items-center mt-6 text-[#059669] font-semibold hover:text-[#0A2540] transition-colors">
                      Научи повече <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Global Scale / AI Faculty Section */}
      <section id="ai-faculty" className="w-full py-24 bg-[#0A2540] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#059669]/20 via-[#0A2540] to-[#0A2540] -z-10" />
        
        <div className="container px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-8"
            >
              <div>
                <h2 className="text-[#00D4FF] font-bold tracking-wide uppercase text-sm mb-3">Multi-Agent AI</h2>
                <h3 className="text-3xl md:text-5xl font-extrabold leading-tight">
                  Запознайте се с <br />Вашия личен факултет.
                </h3>
              </div>
              <p className="text-lg text-[#8898AA] font-medium leading-relaxed max-w-lg">
                Зад всеки предмет стои специализиран AI агент. Обучен върху хиляди научни статии, книги и реални данни, той проверява тестовете ви и отговаря на въпросите ви 24/7.
              </p>
              
              <ul className="space-y-4 pt-2">
                {[
                  "Computer Vision за разпознаване на болести",
                  "Персонализирани планове за обучение",
                  "Интерактивни лаборатории в реално време"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-[15px] font-semibold text-[#E6EBF1]">
                    <div className="mr-3 rounded-full bg-[#00D4FF]/20 p-1">
                      <CheckCircle2 className="h-4 w-4 text-[#00D4FF]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-xl bg-[#1A365D] border border-[#2A4B7C] p-8 shadow-2xl relative z-10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#059669] to-[#00D4FF] flex items-center justify-center shadow-lg">
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Проф. АгроМайнд</h4>
                    <p className="text-[#00D4FF] font-medium">Главен AI Агроном</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-[#0A2540] p-4 rounded-lg border border-[#2A4B7C] text-sm text-[#E6EBF1] font-medium shadow-inner">
                    "Анализирах снимката на листото, която качи. Забелязвам начални признаци на брашнеста мана. Ето как да я третираме органично..."
                  </div>
                  <Link href="/faculty/agromind" className="w-full">
                    <Button variant="neon" className="w-full h-12 text-base font-semibold">
                      Задай въпрос на AI
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

    </div>
  );
}

