"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Tractor, Droplets, Wind, ArrowRight, BrainCircuit, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { easeCinematic, staggerInViewContainer, transitionCinematic, viewportFadeUpVariants } from "@/lib/motion";

export default function Home() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section with Slanted Background */}
      <section className="relative w-full pt-28 pb-24 md:pt-36 md:pb-32 lg:pt-40 lg:pb-40 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-full w-full slanted-bg -z-10 bg-background overflow-hidden">
          <div className="ai-mesh">
            <div className="ai-mesh-blob -top-[20%] -right-[10%] w-[70%] h-[100%] bg-gradient-to-bl from-primary/25 via-cyan-400/20 to-transparent rotate-12" />
            <div className="ai-mesh-blob top-[20%] -left-[10%] w-[55%] h-[85%] bg-gradient-to-tr from-accent/15 via-primary/15 to-transparent" />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] cinematic-vignette" aria-hidden />

        <div className="container relative z-[2] px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { ...transitionCinematic, delay: 0.08, ease: easeCinematic }
              }
              className="max-w-2xl"
            >
              <div className="ai-pill ai-glow-breathe mb-6 max-w-full">
                <span className="flex h-2 w-2 shrink-0 rounded-full bg-primary mr-2 shadow-[0_0_12px_rgb(5_150_105/0.8)]" />
                <span className="tracking-wide text-[0.8125rem] uppercase text-muted-foreground sm:normal-case sm:text-sm">
                  AI operating system for learning
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                Интелигентна инфраструктура <br className="hidden md:block" />
                за <span className="text-gradient-ai">модерно земеделие</span>
              </h1>
              
              <p className="max-w-[600px] text-lg md:text-xl text-muted-foreground mt-6 font-medium leading-relaxed">
                Един слой за курсове, симулации, RAG и компютърно зрение — като операционна система за обучение. Обучавай се по-умно, не по-трудно.
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
              initial={reduceMotion ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.95,
                      delay: 0.18,
                      ease: easeCinematic,
                    }
              }
              className="relative hidden lg:block"
            >
              <div className="relative ai-panel p-2 w-full max-w-lg ml-auto z-10 overflow-hidden transform transition-all duration-slow ease-cinematic hover:-translate-y-2 hover:shadow-elevated glow-primary">
                {/* Mockup Header */}
                <div className="flex items-center space-x-2 px-4 py-3 border-b border-border/60 bg-muted/40 rounded-t-[calc(var(--radius-2xl)-0.25rem)]">
                  <div className="flex space-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="mx-auto h-4 w-1/2 bg-card/90 rounded-full border border-border/80 shadow-sm backdrop-blur-sm" />
                </div>
                {/* Mockup Body */}
                <div className="p-6 bg-card/30 backdrop-blur-md rounded-b-[calc(var(--radius-2xl)-0.25rem)] space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-foreground">Анализ на почвата</h4>
                      <p className="text-sm text-muted-foreground">Проф. Соил (AI)</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/15 rounded-full flex items-center justify-center ring-1 ring-primary/20">
                      <BrainCircuit className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[95, 75, 45].map((w, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-cyan-400" style={{ width: `${w}%` }} />
                        </div>
                        <span className="text-xs font-bold text-foreground">{w}%</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 glass-subtle rounded-xl border border-border/60">
                    <div className="flex items-start space-x-3">
                       <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                       <p className="text-sm text-muted-foreground font-medium leading-relaxed">
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
      <section id="courses" className="w-full py-24 bg-background relative z-10 border-t border-border/40">
        <div className="container px-6 lg:px-8 mx-auto">
          <motion.div 
            initial={reduceMotion ? "animate" : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={viewportFadeUpVariants}
            className="mb-16 max-w-3xl"
          >
            <h2 className="text-primary font-bold tracking-wide uppercase text-sm mb-3">Обучителна Екосистема</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
              Напълно интегриран набор от <br /> 
              модерни агро дисциплини.
            </h3>
            <p className="text-lg text-muted-foreground mt-4 font-medium">
              От основите на растениевъдството до най-сложните автономни системи.
            </p>
          </motion.div>

          <motion.div 
            initial={reduceMotion ? "animate" : "initial"}
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerInViewContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: "Растениевъдство", icon: Sprout, desc: "От семето до реколтата с детайлни AI анализи и диагностика." },
              { title: "Агро Дронове", icon: Wind, desc: "Специализирани курсове за RTK системи и прецизно пръскане." },
              { title: "Smart Машини", icon: Tractor, desc: "Обучения за GPS навигация, автономия и тежка техника." },
              { title: "Оранжерии", icon: Droplets, desc: "Оптимизация на микроклимата, водата и LED осветлението." }
            ].map((course, idx) => (
              <motion.div key={idx} variants={viewportFadeUpVariants}>
                <Card className="h-full hover-lift transition-all border border-border/50 bg-card/70 backdrop-blur-md shadow-card hover:border-primary/25 hover:shadow-elevated">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/15 to-cyan-400/10 flex items-center justify-center mb-2 border border-border/60 shadow-sm">
                      <course.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-medium leading-relaxed">{course.desc}</p>
                    <Link href="/dashboard" className="inline-flex items-center mt-6 text-primary font-semibold hover:text-accent transition-colors">
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
      <section id="ai-faculty" className="w-full py-24 bg-band text-band-foreground overflow-hidden relative">
        <div className="absolute inset-0 ai-mesh opacity-80">
          <div className="ai-mesh-blob top-0 right-0 w-[80%] h-[70%] bg-gradient-to-bl from-primary/30 via-cyan-400/20 to-transparent" />
          <div className="ai-mesh-blob bottom-0 left-0 w-[60%] h-[60%] bg-gradient-to-tr from-accent/25 to-transparent" />
        </div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-band to-band -z-10" />
        
        <div className="container px-6 lg:px-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={reduceMotion ? "animate" : "initial"}
              whileInView="animate"
              viewport={{ once: true }}
              variants={viewportFadeUpVariants}
              className="space-y-8"
            >
              <div>
                <h2 className="text-cyan-300 font-bold tracking-wide uppercase text-sm mb-3">Multi-Agent AI</h2>
                <h3 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
                  Запознайте се с <br />Вашия личен факултет.
                </h3>
              </div>
              <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
                Зад всеки предмет стои специализиран AI агент. Обучен върху хиляди научни статии, книги и реални данни, той проверява тестовете ви и отговаря на въпросите ви 24/7.
              </p>
              
              <ul className="space-y-4 pt-2">
                {[
                  "Computer Vision за разпознаване на болести",
                  "Персонализирани планове за обучение",
                  "Интерактивни лаборатории в реално време"
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-[15px] font-semibold text-slate-200">
                    <div className="mr-3 rounded-full bg-cyan-400/20 p-1 ring-1 ring-cyan-400/30">
                      <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                reduceMotion ? { duration: 0 } : { ...transitionCinematic, ease: easeCinematic }
              }
              className="relative"
            >
              <div className="glass-dark rounded-2xl p-8 glow-accent relative z-10 ring-1 ring-white/10">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg ring-2 ring-white/20">
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white">Проф. АгроМайнд</h4>
                    <p className="text-cyan-300 font-medium">Главен AI Агроном</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-band/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 text-sm text-slate-200 font-medium shadow-inner">
                    &ldquo;Анализирах снимката на листото, която качи. Забелязвам начални признаци на брашнеста мана. Ето как да я третираме органично&hellip;&rdquo;
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

