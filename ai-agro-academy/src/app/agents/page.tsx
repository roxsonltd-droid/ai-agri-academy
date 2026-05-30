"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Agent = {
  id: string;
  name: string;
  role: string;
  icon: any;
  status: "idle" | "monitoring" | "alert";
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
  
  const [agents, setAgents] = useState<Agent[]>([
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
      id: "mech",
      name: "Агент Техника",
      role: "Сензори и Поддръжка",
      icon: Tractor,
      status: "idle",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30"
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
         severity: n.type === 'weather' ? 'high' : 'medium',
         title: n.type === 'weather' ? `Метео Аларма: ${currentRegion}` : `Пазарно Известие`,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans pt-20">
      
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {agents.map((agent) => (
                <div 
                  key={agent.id} 
                  onClick={() => setSelectedAgent(agent)}
                  className={`p-4 rounded-xl border bg-slate-900/80 backdrop-blur-sm transition-all cursor-pointer hover:scale-[1.02] ${
                    agent.status === 'alert' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-slate-800 hover:border-slate-600'
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
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>
                    </div>
                    <Settings className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              ))}
            </div>

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

      {/* Settings Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setSelectedAgent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-xl ${selectedAgent.bg} mr-4`}>
                  <selectedAgent.icon className={`w-6 h-6 ${selectedAgent.color}`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                  <p className="text-sm text-slate-400">Настройки на агента</p>
                </div>
              </div>

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
