"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Send, User, ChevronLeft, Sprout } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AgroMindChat() {
  const reduceMotion = useReducedMotion();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Здравей! Аз съм Проф. АгроМайнд. С какво мога да ти бъда полезен днес относно твоето стопанство или обучение?"
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/agents/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Network response was not ok");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      console.error("Error communicating with AI:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Извинявай, възникна техническа грешка при връзката със сървъра." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="ai-mesh opacity-[0.35]">
        <div className="ai-mesh-blob -top-24 -left-16 w-[55%] h-[45%] bg-gradient-to-br from-primary/25 to-cyan-400/15" />
        <div className="ai-mesh-blob bottom-10 right-0 w-[50%] h-[40%] bg-gradient-to-tl from-accent/20 to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex-none glass-strong border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-md ring-2 ring-primary/15">
                <BrainCircuit className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight text-foreground">Проф. АгроМайнд</h1>
                <p className="text-xs text-primary font-semibold flex items-center">
                  <span className="h-2 w-2 rounded-full bg-primary mr-1.5 animate-pulse" />
                  На линия
                </p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex ai-pill items-center space-x-2 px-3 py-1.5">
            <Sprout className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground">AI Faculty</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="container mx-auto max-w-3xl space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.28 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "ai" ? (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-sm ring-1 ring-primary/20">
                      <BrainCircuit className="h-4 w-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shadow-sm ring-1 ring-border">
                      <User className="h-4 w-4 text-foreground" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div 
                  className={`p-4 text-[15px] leading-relaxed ${
                    msg.role === "user" 
                      ? "rounded-2xl rounded-tr-sm bg-band text-band-foreground shadow-elevated ring-1 ring-white/10" 
                      : "ai-bubble-assistant text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&_strong]:font-bold [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-foreground"
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
            <motion.div 
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="flex justify-start"
            >
              <div className="flex space-x-3 flex-row max-w-[85%]">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-sm ring-1 ring-primary/20">
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
      </main>

      {/* Input Area */}
      <footer className="relative z-10 flex-none glass-strong border-t border-border/50 p-4">
        <div className="container mx-auto max-w-3xl">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Попитай Проф. АгроМайнд..."
              className="w-full bg-muted/80 border border-border/80 rounded-full pl-6 pr-14 py-4 text-foreground placeholder:text-subtle-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-transparent transition-all shadow-inner backdrop-blur-sm"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="default"
              size="sm" 
              className="absolute right-2 h-10 w-10 rounded-full p-0 flex items-center justify-center"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4 text-primary-foreground ml-0.5" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">
            AI може да допуска грешки. Винаги проверявайте важните агрономически съвети с реален специалист.
          </p>
        </div>
      </footer>
    </div>
  );
}

