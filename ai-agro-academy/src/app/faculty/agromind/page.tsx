"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Send, User, ChevronLeft, Sprout } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function AgroMindChat() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://agro-academy-backend.onrender.com'}/api/v1/chat/`, {
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
    <div className="flex flex-col h-screen bg-[#F6F9FC] font-sans text-[#0A2540]">
      {/* Header */}
      <header className="flex-none bg-white border-b border-[#E6EBF1] shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-[#425466] hover:text-[#059669] transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#059669] to-[#00D4FF] flex items-center justify-center shadow-md">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Проф. АгроМайнд</h1>
                <p className="text-xs text-[#059669] font-semibold flex items-center">
                  <span className="h-2 w-2 rounded-full bg-[#10B981] mr-1.5 animate-pulse"></span>
                  На линия
                </p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2 bg-[#F6F9FC] px-3 py-1.5 rounded-full border border-[#E6EBF1]">
            <Sprout className="h-4 w-4 text-[#059669]" />
            <span className="text-xs font-semibold text-[#425466]">AI Faculty</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="container mx-auto max-w-3xl space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={idx} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[75%] space-x-3 ${msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {msg.role === "ai" ? (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#059669] to-[#00D4FF] flex items-center justify-center shadow-sm">
                      <BrainCircuit className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#0A2540] flex items-center justify-center shadow-sm">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div 
                  className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-[#0A2540] text-white rounded-tr-sm" 
                      : "bg-white border border-[#E6EBF1] text-[#425466] rounded-tl-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-2 [&_strong]:font-bold [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mb-1 [&_h3]:mt-3"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex space-x-3 flex-row max-w-[85%]">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#059669] to-[#00D4FF] flex items-center justify-center shadow-sm">
                    <BrainCircuit className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#E6EBF1] rounded-tl-sm flex items-center space-x-2 h-12 shadow-sm">
                  <div className="w-2 h-2 bg-[#059669]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-[#059669]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-[#059669]/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-[#E6EBF1] p-4">
        <div className="container mx-auto max-w-3xl">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Попитай Проф. АгроМайнд..."
              className="w-full bg-[#F6F9FC] border border-[#E6EBF1] rounded-full pl-6 pr-14 py-4 text-[#0A2540] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-transparent transition-all shadow-inner"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              variant="default"
              size="sm" 
              className="absolute right-2 h-10 w-10 rounded-full p-0 flex items-center justify-center bg-[#059669] hover:bg-[#047857]"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4 text-white ml-0.5" />
            </Button>
          </form>
          <p className="text-center text-[11px] text-[#94A3B8] mt-3 font-medium">
            AI може да допуска грешки. Винаги проверявайте важните агрономически съвети с реален специалист.
          </p>
        </div>
      </footer>
    </div>
  );
}

