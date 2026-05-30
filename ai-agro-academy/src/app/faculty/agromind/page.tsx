"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Send, User, ChevronLeft, Sprout, Tractor, LineChart, Library, Presentation, Workflow, Mic, MicOff } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function RectorateChat() {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeExpert, setActiveExpert] = useState("AI Ректор");
  const [difficulty, setDifficulty] = useState("Студент");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "bg-BG";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
             currentTranscript += event.results[i][0].transcript;
          }
          // Overwrite the input with the live transcript
          setInput(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setInput(""); // Clear input when starting to listen
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Гласовото разпознаване не се поддържа в този браузър. Моля, използвайте Google Chrome.");
      }
    }
  };

  // Initialize with personalized context from localStorage
  useEffect(() => {
    let farmContext = "";
    try {
      const saved = localStorage.getItem("agro_farm_profile");
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile.region || profile.crops) {
          farmContext = ` Виждам, че отглеждате ${profile.crops || "култури"} в регион ${profile.region || "България"}.`;
        }
      }
    } catch(e) {}

    let initialMessage = `Добре дошли в Ректората! Аз съм Главният AI Ректор на академията.${farmContext} Моята цел е да изградя вашия персонален образователен път и да координирам експертния съвет. С кой казус ще започнем днес?`;

    // Handle agent context from URL
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const agentContext = params.get("context");
        if (agentContext) {
          initialMessage = agentContext;
        }
      }
    } catch(e) {}

    setMessages([
      {
        role: "ai",
        content: initialMessage
      }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Pass the active expert context to the agent
      const prompt = `[Контекст: Говориш в ролята на ${activeExpert}. Ниво на обяснение: ${difficulty}.] ${userMsg}`;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/agents/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Възникна техническа грешка при връзката с Главния AI сървър." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const experts = [
    { name: "AI Ректор", role: "Главен Оркестратор", icon: BrainCircuit, color: "text-primary" },
    { name: "Проф. Агроном", role: "Растениевъдство", icon: Sprout, color: "text-emerald-400" },
    { name: "Проф. Икономика", role: "Анализи и Финанси", icon: LineChart, color: "text-blue-400" },
    { name: "Проф. Механизация", role: "Техника и Дронове", icon: Tractor, color: "text-orange-400" },
  ];

  return (
    <div className="relative flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
        <div className="ai-mesh-blob -top-20 -left-10 w-[45%] h-[40%] bg-gradient-to-br from-primary/30 to-cyan-400/20" />
        <div className="ai-mesh-blob bottom-10 right-0 w-[40%] h-[35%] bg-gradient-to-tl from-accent/25 to-transparent" />
      </div>

      {/* LEFT PANEL: The Expert Board & Context */}
      <aside className="hidden lg:flex w-72 flex-col glass-strong border-r border-border/50 shadow-lg relative z-10 p-4 overflow-y-auto">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 mt-2 text-sm">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Към Кампуса
        </Link>

        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center">
          <Workflow className="w-4 h-4 mr-2" /> Кръгла Маса
        </h3>
        <div className="space-y-3 mb-8">
          {experts.map((exp) => (
            <div 
              key={exp.name}
              onClick={() => setActiveExpert(exp.name)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                activeExpert === exp.name 
                  ? "bg-card/80 border-primary/40 shadow-elevated scale-[1.02]" 
                  : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${exp.color}`}>
                  <exp.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{exp.name}</h4>
                  <p className="text-xs text-muted-foreground">{exp.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center">
          <Library className="w-4 h-4 mr-2" /> Ниво на сложност
        </h3>
        <select 
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full bg-card/60 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
        >
          <option value="Начинаещ">Начинаещ (Основи)</option>
          <option value="Студент">Студент (Средно)</option>
          <option value="Експерт">Експерт (Научно)</option>
        </select>
        
        <div className="mt-auto pt-6 border-t border-border/30">
           <div className="text-xs text-muted-foreground">
             <p className="font-semibold text-primary mb-1">Обучен върху:</p>
             <p>• 25 000+ научни публикации</p>
             <p>• 450 агрономически учебника</p>
             <p>• Регулации на ЕС (2024)</p>
           </div>
        </div>
      </aside>

      {/* CENTER PANEL: Main Auditorium / Chat */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 border-r border-border/50 shadow-xl bg-background/50">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 glass-subtle shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-md ring-1 ring-primary/30">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-md leading-tight">{activeExpert}</h1>
              <p className="text-[11px] text-primary font-semibold flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                Слуша и анализира...
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[90%] md:max-w-[85%] space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                  
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === "ai" ? (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-sm">
                        <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shadow-sm border border-border">
                        <User className="h-4 w-4 text-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div 
                    className={`p-4 text-[15px] leading-relaxed shadow-sm ${
                      msg.role === "user" 
                        ? "rounded-2xl rounded-tr-sm bg-band text-band-foreground border border-white/5" 
                        : "ai-bubble-assistant text-muted-foreground [&>p]:mb-3 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&_strong]:font-bold [&_h3]:font-bold [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:mb-2 [&_h3]:mt-4"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex space-x-3 flex-row max-w-[85%]">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-sm">
                      <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="ai-bubble-assistant flex items-center space-x-2 h-12 px-4">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="p-4 bg-background/40 backdrop-blur-md border-t border-border/30 shrink-0">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={sendMessage} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListen}
                className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                }`}
                title={isListening ? "Спри микрофона" : "Говори (Разреши микрофона)"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
              
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Слушам ви..." : `Попитай ${activeExpert}...`}
                  className={`w-full bg-card/60 border rounded-full pl-6 pr-14 py-4 text-foreground placeholder:text-subtle-foreground focus:outline-none transition-all shadow-inner backdrop-blur-sm ${
                    isListening ? "border-red-500/50 ring-1 ring-red-500/50" : "border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  }`}
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </Button>
              </div>
            </form>
          </div>
        </footer>
      </main>

      {/* RIGHT PANEL: Live Board (Artifacts / Widgets) */}
      <aside className="hidden xl:flex w-80 flex-col glass-subtle relative z-10 p-6 overflow-y-auto">
        <h3 className="text-sm font-bold text-foreground mb-6 flex items-center">
          <Presentation className="w-5 h-5 mr-2 text-primary" /> Жива Дъска
        </h3>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 border-2 border-dashed border-border/50 rounded-2xl p-6">
           <Presentation className="w-12 h-12 mb-4" />
           <p className="text-sm font-medium">Когато професорът обяснява сложни процеси, тук ще се появяват симулации, графики и 3D модели.</p>
        </div>

        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">Бързи Лаборатории</h4>
          <div className="space-y-2">
            <Link href="/labs">
              <Button variant="outline" className="w-full justify-start border-border/60 hover:bg-white/5">
                <Sprout className="w-4 h-4 mr-2" /> Симулация на добив
              </Button>
            </Link>
            <Link href="/labs/vision">
              <Button variant="outline" className="w-full justify-start border-border/60 hover:bg-white/5">
                <BrainCircuit className="w-4 h-4 mr-2" /> Анализ на болести (Снимка)
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
