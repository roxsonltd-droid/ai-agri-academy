"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiAvatar } from "@/components/ai-avatar";
import { API_BASE } from "@/lib/api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Здравейте! Аз съм вашият Агро AI асистент. С какво мога да ви помогна днес? (Например: Как да предпазя доматите от мана? или Какви са актуалните цени на пшеницата?)",
    },
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

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Възникна грешка при свързването със сървъра. Моля, опитайте отново по-късно.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#0B0F19] text-slate-200">
      {/* Spacer for Navbar which is fixed at top */}
      <div className="h-20 shrink-0"></div>
      
      <div className="flex-1 overflow-hidden relative flex flex-col mx-auto w-full max-w-4xl">
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[80px] -z-10" />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="flex flex-col gap-6 pb-20">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 mt-1">
                    <AiAvatar size="sm" className="ring-2 ring-teal-500/20" />
                  </div>
                )}
                
                <div className={`rounded-2xl px-5 py-3.5 max-w-[85%] sm:max-w-[75%] ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="shrink-0 mt-1 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 justify-start"
              >
                <div className="shrink-0 mt-1">
                  <AiAvatar size="sm" className="ring-2 ring-teal-500/20" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span className="text-sm text-slate-400">Агро AI мисли...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19] to-transparent shrink-0">
          <form 
            onSubmit={sendMessage} 
            className="relative flex items-end gap-2 max-w-4xl mx-auto bg-white/5 border border-white/10 p-2 rounded-3xl backdrop-blur-md focus-within:ring-1 focus-within:ring-teal-500/50 focus-within:border-teal-500/50 transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Попитайте ме за болести, торене, сеитба..."
              className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none border-none px-4 py-3 text-slate-200 placeholder:text-slate-500 text-sm md:text-base leading-relaxed"
              rows={1}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="rounded-full w-11 h-11 shrink-0 bg-teal-500 hover:bg-teal-600 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-0.5 mr-0.5"
              size="icon"
            >
              <Send className="w-5 h-5 ml-1" />
            </Button>
          </form>
          <div className="text-center mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3 h-3 text-teal-500/70" />
            <span>AI моделът може да допусне грешки. Винаги проверявайте важната агрономска информация.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
