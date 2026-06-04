"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PawPrint, Send, User, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function LivestockAgent() {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Здравей! Аз съм твоят Експерт по Животновъдство. Мога да помогна с хранене, ветеринарни съвети и отглеждане на крави, овце, птици и свине. Какъв е проблемът днес?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const contextPrefix = "[КОНТЕКСТ: Ти си Експерт по Животновъдство. Даваш съвети за хранене, болести и отглеждане на фермерски животни.]\n\nВъпрос от фермера: ";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contextPrefix + userMsg })
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "Възникна техническа грешка при връзката с базата данни." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-20">
        <div className="ai-mesh-blob -top-24 -left-16 w-[55%] h-[45%] bg-gradient-to-br from-amber-500/25 to-orange-400/15" />
      </div>

      <header className="relative z-10 flex-none glass-strong border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/agents" className="text-muted-foreground hover:text-amber-500 transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                <PawPrint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight text-foreground">Експерт Животновъд</h1>
                <p className="text-xs text-amber-500 font-semibold flex items-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                  Готов за анализ
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="container mx-auto max-w-3xl space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "ai" ? (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                      <PawPrint className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shadow-sm border border-border">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>

                <div 
                  className={`p-4 text-[15px] leading-relaxed ${
                    msg.role === "user" 
                      ? "rounded-2xl rounded-tr-sm bg-amber-600 text-white shadow-elevated" 
                      : "bg-card text-card-foreground border border-border/60 rounded-2xl rounded-tl-sm shadow-sm [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_strong]:font-bold"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 flex-row max-w-[85%]">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <PawPrint className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm flex items-center space-x-2 h-12 px-4 shadow-sm">
                  <div className="w-2 h-2 bg-amber-500/40 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-amber-500/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-amber-500/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="relative z-10 flex-none glass-strong border-t border-border/50 p-4">
        <div className="container mx-auto max-w-3xl">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Пример: Имам 20 крави, забелязвам намален млеконадой. Какво да променя в дажбата?"
              className="w-full bg-muted/80 border border-border/80 rounded-full pl-6 pr-14 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all shadow-inner"
              disabled={isLoading}
            />
            
            <Button 
              type="submit" 
              variant="default"
              size="sm" 
              className="absolute right-2 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
