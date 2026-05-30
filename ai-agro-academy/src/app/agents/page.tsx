"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { listContainerVariants, listItemVariants } from "@/lib/motion";
import { 
  CloudRain, 
  Bug, 
  LineChart, 
  Tractor, 
  AlertTriangle, 
  ShieldCheck, 
  ChevronRight, 
  BrainCircuit, 
  Radio,
  Settings,
  X,
  Plus,
  Zap,
  Loader2,
  FolderOpen,
  Eraser,
  Search,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle2,
  HardDrive,
  Mail,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Agent = {
  id: string;
  name: string;
  role: string;
  icon: any;
  status: "idle" | "monitoring" | "alert" | "active";
  color: string;
  bg: string;
};

export default function AgentsMissionControl() {
  const [region, setRegion] = useState("вашия регион");
  const [crops, setCrops] = useState("вашите култури");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showNewAgentModal, setShowNewAgentModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentTask, setNewAgentTask] = useState("");
  
  const [isSimulatingCron, setIsSimulatingCron] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // AI Clear States
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanComplete, setCleanComplete] = useState(false);

  // Docs States
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  // Marketing States
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "marketing",
      name: "Маркетинг Агент",
      role: "Автоматизирани Имейл Кампании",
      icon: Mail,
      status: "active",
      color: "text-pink-400",
      bg: "bg-pink-500/10 border-pink-500/30"
    },
    {
      id: "weather",
      name: "Агент Време",
      role: "Метеорологичен Мониторинг",
      icon: CloudRain,
      status: "alert",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30"
    },
    {
      id: "disease",
      name: "Агент Болести",
      role: "Санитарен Контрол",
      icon: Bug,
      status: "monitoring",
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/30"
    },
    {
      id: "market",
      name: "Агент Пазари",
      role: "Борсови Цени & Тенденции",
      icon: LineChart,
      status: "monitoring",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30"
    },
    {
      id: "docs",
      name: "Агент Секретар",
      role: "Документация и Архивни Срокове",
      icon: FolderOpen,
      status: "active",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30"
    },
    {
      id: "clear",
      name: "AI Clear",
      role: "Почистване на Дигитален Боклук",
      icon: Eraser,
      status: "active",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/30"
    },
    {
      id: "mech",
      name: "Агент Техника",
      role: "Сензори и Поддръжка",
      icon: Tractor,
      status: "idle",
      color: "text-slate-400",
      bg: "bg-slate-500/10 border-slate-500/30"
    }
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agro_farm_profile");
      let currentRegion = "вашия регион";
      let currentCrops = "вашите култури";
      
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile.region) {
          setRegion(profile.region);
          currentRegion = profile.region;
        }
        if (profile.crops) {
          setCrops(profile.crops);
          currentCrops = profile.crops;
        }
      }

      const notifs = JSON.parse(localStorage.getItem("agro_notifications") || "[]");
      const formattedNotifs = notifs.map((n: any) => ({
         id: n.id,
         agentId: n.type,
         severity: n.type === 'weather' ? 'high' : n.type === 'market' ? 'medium' : 'low',
         title: n.type === 'weather' ? `Метео Аларма: ${currentRegion}` : n.type === 'market' ? `Пазарно Известие` : `Системно Известие`,
         description: n.message,
         time: "Току-що",
         contextParam: `Здравей, получих известие: ${n.message}`
      }));
      
      const defaultAlerts = [
        {
          id: "def-1",
          agentId: "weather",
          severity: "high",
          title: `Очакват се обилни валежи в ${currentRegion}`,
          description: `Анализът на сателитните данни показва 85% вероятност за силни валежи през следващите 48 часа. Препоръчва се отлагане на планираните пръскания.`,
          time: "Преди 12 мин",
          contextParam: `Здравей, Агент Време засече обилни валежи в ${currentRegion} за следващите 48 часа. Какви превантивни мерки да предприема за ${currentCrops}?`
        },
        {
          id: "def-2",
          agentId: "market",
          severity: "medium",
          title: "Ръст на цената на зърното на MATIF",
          description: "Европейската борса отчита повишение с 2.5% за пшеницата през последните 24 часа. Подходящ момент за сключване на предварителни договори.",
          time: "Преди 2 часа",
          contextParam: `Агент Пазари ме информира за ръст от 2.5% на пшеницата в MATIF. Можеш ли да ми дадеш икономически съвет кога е най-добре да продавам?`
        },
        {
          id: "def-3",
          agentId: "disease",
          severity: "low",
          title: `Следене на ${currentCrops} за ранен пригор`,
          description: "Повишената влажност през уикенда създава благоприятни условия за развитие на гъбични заболявания.",
          time: "Преди 5 часа",
          contextParam: `Агент Болести съобщава за повишен риск от ранен пригор по ${currentCrops} заради влагата. Какво да използвам за превантивно пръскане?`
        }
      ];

      setAlerts([...formattedNotifs, ...defaultAlerts]);
    } catch(e) {}
  }, []);

  const handleCreateAgent = () => {
    if (!newAgentName) return;
    setAgents([...agents, {
      id: "custom-" + Date.now(),
      name: newAgentName,
      role: newAgentTask || "Специфичен Мониторинг",
      icon: Plus,
      status: "monitoring",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/30"
    }]);
    setShowNewAgentModal(false);
    setNewAgentName("");
    setNewAgentTask("");
  };

  const simulateCronJob = () => {
    setIsSimulatingCron(true);
    setTimeout(() => {
       const isWeather = Math.random() > 0.5;
       const newNotif = {
         id: Date.now().toString(),
         type: isWeather ? "weather" : "market",
         message: isWeather 
          ? `Внимание! AI Метеоролог засича рязък спад на температурите в ${region}. Погрижете се за вашите посеви (${crops}).`
          : `AI Пазари: Наблюдава се повишено търсене на ${crops} в региона на ${region}. Проверете борсовите цени.`,
         date: new Date().toISOString(),
         read: false
       };
       
       const current = JSON.parse(localStorage.getItem("agro_notifications") || "[]");
       localStorage.setItem("agro_notifications", JSON.stringify([newNotif, ...current]));
       
       // Alert Navbar
       window.dispatchEvent(new Event("agro_notifications_updated"));
       
       // Update local feed
       setAlerts([{
         id: newNotif.id,
         agentId: newNotif.type,
         severity: isWeather ? 'high' : 'medium',
         title: isWeather ? `Метео Аларма: ${region}` : `Пазарно Известие: ${region}`,
         description: newNotif.message,
         time: "Току-що",
         contextParam: `Моля за съвет относно: ${newNotif.message}`
       }, ...alerts]);
       
       setIsSimulatingCron(false);
    }, 1500);
  };

  const handleAIClearScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setCleanComplete(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 2500);
  };

  const handleAIClearClean = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      setScanComplete(false);
      setCleanComplete(true);
      
      // Simulate system notification
      const newNotif = {
         id: Date.now().toString(),
         type: "system",
         message: `AI Clear успешно премахна 1.2 GB ненужни файлове, кеш и изтекли сесии.`,
         date: new Date().toISOString(),
         read: false
       };
       const current = JSON.parse(localStorage.getItem("agro_notifications") || "[]");
       localStorage.setItem("agro_notifications", JSON.stringify([newNotif, ...current]));
       window.dispatchEvent(new Event("agro_notifications_updated"));
    }, 2000);
  };

  const handleDocUpload = () => {
    setUploadingDoc(true);
    setTimeout(() => {
      setUploadingDoc(false);
      // Simulate system notification
      const newNotif = {
         id: Date.now().toString(),
         type: "system",
         message: `Секретарят обработи новия документ. Няма открити рискове. Категория: Фактури.`,
         date: new Date().toISOString(),
         read: false
       };
       const current = JSON.parse(localStorage.getItem("agro_notifications") || "[]");
       localStorage.setItem("agro_notifications", JSON.stringify([newNotif, ...current]));
       window.dispatchEvent(new Event("agro_notifications_updated"));
    }, 1500);
  };

  const handleSendWelcomeEmail = () => {
    setSendingEmail(true);
    setEmailSent(false);
    fetch("/api/emails/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo-farmer@agrinexus.eu", name: "Иван" })
    })
      .then(() => {
        setTimeout(() => {
          setSendingEmail(false);
          setEmailSent(true);
          const newNotif = {
            id: Date.now().toString(),
            type: "system",
            message: `Маркетинг Агентът изпрати Welcome имейл до demo-farmer@agrinexus.eu.`,
            date: new Date().toISOString(),
            read: false
          };
          const current = JSON.parse(localStorage.getItem("agro_notifications") || "[]");
          localStorage.setItem("agro_notifications", JSON.stringify([newNotif, ...current]));
          window.dispatchEvent(new Event("agro_notifications_updated"));
        }, 1000);
      })
      .catch(console.error);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pt-20 pb-20">
      
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-emerald-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/50">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Mission Control</h1>
            </div>
            <p className="text-slate-400">Централа за 24/7 автономен AI мониторинг на вашето стопанство.</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3" />
            <span className="text-sm font-medium text-emerald-400 uppercase tracking-widest">Системата е активна</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Agents Panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Automation Simulator */}
            <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 shadow-[0_0_20px_rgba(79,70,229,0.1)] mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center mb-3">
                <Zap className="w-4 h-4 mr-2" /> Автоматизация
              </h2>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Сървърният Cron Job работи всеки ден в 06:00 ч. Можете да го симулирате ръчно, за да тествате известията (API: <code>/api/cron</code>).
              </p>
              <Button 
                onClick={simulateCronJob}
                disabled={isSimulatingCron}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {isSimulatingCron ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                {isSimulatingCron ? "Симулиране..." : "Симлуирай Сутрешен Cron Job"}
              </Button>
            </div>

            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" /> Наети Агенти
            </h2>
            
            <motion.div 
              variants={listContainerVariants} 
              initial="hidden" 
              animate="show" 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"
            >
              {agents.map((agent) => (
                <motion.div 
                  variants={listItemVariants}
                  key={agent.id} 
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-xl border bg-slate-900/80 backdrop-blur-sm transition-all cursor-pointer hover:scale-[1.02] ${
                    agent.status === 'alert' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                    : agent.id === 'clear' ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${agent.bg}`}>
                      <agent.icon className={`w-5 h-5 ${agent.color}`} />
                    </div>
                    {agent.status === "monitoring" && (
                      <span className="flex items-center text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" /> Мониторинг
                      </span>
                    )}
                    {agent.status === "alert" && (
                      <span className="flex items-center text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Внимание
                      </span>
                    )}
                    {agent.status === "idle" && (
                      <span className="flex items-center text-[10px] uppercase font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded">
                        Изчакване
                      </span>
                    )}
                    {agent.status === "active" && (
                      <span className="flex items-center text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        Наличен
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="p-5 mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 text-center">
              <h4 className="text-sm font-bold text-white mb-2">Имате нужда от нов агент?</h4>
              <p className="text-xs text-slate-400 mb-4">Ректорът може да обучи персонализиран AI агент специфично за вашите нужди.</p>
              <Button 
                onClick={() => setShowNewAgentModal(true)}
                variant="outline" 
                className="w-full text-xs border-slate-700 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Заяви нов агент
              </Button>
            </div>
          </div>

          {/* Live Alerts Feed */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center mb-6">
              <AlertTriangle className="w-4 h-4 mr-2" /> Живи Известия
            </h2>

            <div className="space-y-4">
              <AnimatePresence>
                {alerts.map((alert, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.05 }}
                    key={alert.id} 
                    className={`relative p-6 rounded-xl border backdrop-blur-sm overflow-hidden ${
                      alert.severity === 'high' 
                        ? 'bg-red-950/20 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                        : alert.severity === 'medium'
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      alert.severity === 'high' ? 'bg-red-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-slate-700'
                    }`} />
                    
                    <div className="flex justify-between items-start mb-3 pl-3">
                      <h3 className={`font-bold text-lg ${
                        alert.severity === 'high' ? 'text-red-400' : alert.severity === 'medium' ? 'text-amber-400' : 'text-white'
                      }`}>
                        {alert.title}
                      </h3>
                      <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">{alert.time}</span>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed pl-3 mb-5">
                      {alert.description}
                    </p>

                    <div className="pl-3 flex justify-end">
                      <Link href={`/faculty/agromind?context=${encodeURIComponent(alert.contextParam)}`}>
                        <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm flex items-center transition-colors hover:border-primary/50">
                          <BrainCircuit className="w-4 h-4 mr-2 text-primary" />
                          Анализирай с Ректора <ChevronRight className="w-3 h-3 ml-2 text-slate-400" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Agent Modals */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 pt-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-slate-900 border rounded-2xl p-6 w-full shadow-2xl relative max-h-[80vh] overflow-y-auto custom-scrollbar ${
                selectedAgent.id === 'clear' ? 'max-w-2xl border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.1)]' 
                : selectedAgent.id === 'docs' ? 'max-w-3xl border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.1)]'
                : 'max-w-md border-slate-700'
              }`}
            >
              <button onClick={() => setSelectedAgent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center mb-8 border-b border-slate-800 pb-4">
                <div className={`p-4 rounded-xl ${selectedAgent.bg} mr-4`}>
                  <selectedAgent.icon className={`w-8 h-8 ${selectedAgent.color}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedAgent.name}</h3>
                  <p className="text-slate-400">{selectedAgent.role}</p>
                </div>
              </div>

              {/* 1. AI CLEAR MODAL CONTENT */}
              {selectedAgent.id === 'clear' && (
                <div className="space-y-6">
                  {!scanComplete && !cleanComplete && (
                    <div className="text-center py-10">
                      <HardDrive className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Дигитален скенер</h4>
                      <p className="text-slate-400 max-w-md mx-auto mb-8">
                        С течение на времето платформата натрупва кеширани данни, дублирани известия, стари отчети и временни файлове. 
                      </p>
                      <Button 
                        onClick={handleAIClearScan}
                        disabled={isScanning}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 px-10 rounded-xl text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                      >
                        {isScanning ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Search className="w-6 h-6 mr-3" />}
                        {isScanning ? "Сканиране на системата..." : "Сканирай за боклук"}
                      </Button>
                    </div>
                  )}

                  {scanComplete && !cleanComplete && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-xl p-6 text-center">
                        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-2" />
                        <h4 className="text-xl font-bold text-white">Намерен е дигитален боклук!</h4>
                        <p className="text-cyan-400 text-2xl font-bold mt-2">1.2 GB <span className="text-sm font-normal text-slate-400">ненужни данни</span></p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-1">Стари метео-прогнози</span>
                          <span className="text-white font-bold">450 MB</span>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-1">Изтекли сесии и кеш</span>
                          <span className="text-white font-bold">320 MB</span>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-1">Дублирани документи</span>
                          <span className="text-white font-bold">280 MB</span>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block mb-1">Темпорални логове</span>
                          <span className="text-white font-bold">150 MB</span>
                        </div>
                      </div>

                      <Button 
                        onClick={handleAIClearClean}
                        disabled={isCleaning}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-xl text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                      >
                        {isCleaning ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Eraser className="w-6 h-6 mr-3" />}
                        {isCleaning ? "Почистване..." : "Почисти системата безопасно"}
                      </Button>
                    </motion.div>
                  )}

                  {cleanComplete && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                      <div className="w-24 h-24 bg-cyan-500/20 border-2 border-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-cyan-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2">Системата е изчистена!</h4>
                      <p className="text-slate-400">Вашето дигитално пространство е оптимизирано и работи на максимални обороти.</p>
                      <Button onClick={() => setSelectedAgent(null)} variant="outline" className="mt-8 border-slate-700">
                        Затвори
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}

              {/* 2. SECRETARY MODAL CONTENT */}
              {selectedAgent.id === 'docs' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div>
                      <h4 className="font-bold text-white">Интелигентен Архив</h4>
                      <p className="text-xs text-slate-400">AI автоматично сортира и следи сроковете на вашите договори.</p>
                    </div>
                    <Button onClick={handleDocUpload} disabled={uploadingDoc} className="bg-amber-600 hover:bg-amber-500 text-white">
                      {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                      Качи Документ
                    </Button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 border-b border-slate-800 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-4 font-medium">Име на документ</th>
                          <th className="px-6 py-4 font-medium">Категория</th>
                          <th className="px-6 py-4 font-medium">Изтича на</th>
                          <th className="px-6 py-4 font-medium">AI Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 flex items-center"><FileText className="w-4 h-4 mr-3 text-amber-400" /> Договор за Аренда - Нива 12</td>
                          <td className="px-6 py-4">Договори</td>
                          <td className="px-6 py-4 text-red-400 font-medium">След 14 дни</td>
                          <td className="px-6 py-4"><span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs">Изисква внимание</span></td>
                        </tr>
                        <tr className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 flex items-center"><FileText className="w-4 h-4 mr-3 text-blue-400" /> Фактура за Торове #109</td>
                          <td className="px-6 py-4">Счетоводство</td>
                          <td className="px-6 py-4">-</td>
                          <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs">Обработено</span></td>
                        </tr>
                        <tr className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 flex items-center"><FileText className="w-4 h-4 mr-3 text-purple-400" /> Заявление за Субсидия (2025)</td>
                          <td className="px-6 py-4">ДФЗ</td>
                          <td className="px-6 py-4 text-amber-400">15.06.2026</td>
                          <td className="px-6 py-4"><span className="bg-amber-500/10 text-amber-400 px-2 py-1 rounded text-xs">В срок</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-start">
                    <ShieldCheck className="w-5 h-5 text-amber-500 mr-3 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">
                      <strong className="text-amber-400">AI Бележка:</strong> Договорът за аренда за Нива 12 изтича скоро. Желаете ли да подготвя чернова за анекс за удължаване?
                    </p>
                  </div>
                </div>
              )}

              {/* 3. MARKETING MODAL CONTENT */}
              {selectedAgent.id === 'marketing' && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <Mail className="w-16 h-16 text-pink-500 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-white mb-2">Имейл Автоматизация</h4>
                    <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm">
                      Този агент следи за нови регистрации и успешни плащания. Използва Resend за моментално доставяне на красиви HTML писма.
                    </p>
                    
                    {!emailSent ? (
                      <Button 
                        onClick={handleSendWelcomeEmail}
                        disabled={sendingEmail}
                        className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-6 px-10 rounded-xl text-lg shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all"
                      >
                        {sendingEmail ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Send className="w-6 h-6 mr-3" />}
                        {sendingEmail ? "Изпращане на имейл..." : "Тествай Welcome Email"}
                      </Button>
                    ) : (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-pink-950/20 border border-pink-500/30 rounded-xl p-6">
                        <CheckCircle2 className="w-12 h-12 text-pink-400 mx-auto mb-3" />
                        <h4 className="font-bold text-white mb-1">Имейлът е изпратен!</h4>
                        <p className="text-pink-400 text-sm">Вижте конзолата на сървъра за HTML шаблона (Simulation Mode).</p>
                        <Button onClick={() => setEmailSent(false)} variant="outline" className="mt-4 border-slate-700">
                          Изпрати отново
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden mt-6">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-950 border-b border-slate-800 text-xs uppercase">
                        <tr>
                          <th className="px-6 py-4 font-medium">Тригер</th>
                          <th className="px-6 py-4 font-medium">Шаблон</th>
                          <th className="px-6 py-4 font-medium">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        <tr className="hover:bg-slate-800/50">
                          <td className="px-6 py-4">Нова Регистрация (Clerk)</td>
                          <td className="px-6 py-4">Welcome Email</td>
                          <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs">Активен</span></td>
                        </tr>
                        <tr className="hover:bg-slate-800/50">
                          <td className="px-6 py-4">Успешно Плащане (Stripe)</td>
                          <td className="px-6 py-4">Разписка & PRO</td>
                          <td className="px-6 py-4"><span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs">Активен</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. DEFAULT SETTINGS MODAL CONTENT (for Weather, Market, etc) */}
              {selectedAgent.id !== 'clear' && selectedAgent.id !== 'docs' && selectedAgent.id !== 'marketing' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Ниво на тревога (Сензитивност)</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none">
                      <option>Нормално (Препоръчително)</option>
                      <option>Високо (Съобщавай за всяка дреболия)</option>
                      <option>Ниско (Само критични събития)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Специфичен фокус (За какво да внимава)</label>
                    <textarea 
                      placeholder="Напр: Следи специално за риск от мана или градушки..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none h-24 resize-none"
                    ></textarea>
                  </div>

                  <Button 
                    onClick={() => setSelectedAgent(null)} 
                    className="w-full bg-primary hover:bg-primary/90 text-slate-950 font-bold py-3 mt-2"
                  >
                    Запази Настройките
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Agent Modal */}
      <AnimatePresence>
        {showNewAgentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowNewAgentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 mr-4">
                  <BrainCircuit className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Нов Агент</h3>
                  <p className="text-sm text-slate-400">Обучете AI за специфична задача</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Име на агента</label>
                  <input 
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="Напр. Агент Склад"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Какво да следи?</label>
                  <textarea 
                    value={newAgentTask}
                    onChange={(e) => setNewAgentTask(e.target.value)}
                    placeholder="Напр. Следи наличностите на торове и препарати и ме предупреждавай..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:border-primary focus:outline-none h-24 resize-none"
                  ></textarea>
                </div>

                <Button 
                  onClick={handleCreateAgent}
                  disabled={!newAgentName}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 mt-2 disabled:opacity-50"
                >
                  Наеми Агента
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
