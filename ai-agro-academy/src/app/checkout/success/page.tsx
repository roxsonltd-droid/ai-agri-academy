"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Mark user as PRO in local storage
    localStorage.setItem("agro_pro", "true");
    
    // Dispatch an event so Navbar updates immediately
    window.dispatchEvent(new Event("agro_pro_updated"));
    
    // Add a welcome notification
    const newNotif = {
      id: Date.now().toString(),
      type: "system",
      message: `Добре дошли в PRO клуба! Вашият абонамент е активиран успешно.`,
      date: new Date().toISOString(),
      read: false
    };
    const current = JSON.parse(localStorage.getItem("agro_notifications") || "[]");
    localStorage.setItem("agro_notifications", JSON.stringify([newNotif, ...current]));
    window.dispatchEvent(new Event("agro_notifications_updated"));

    // Fire simulated Email Receipt
    fetch("/api/emails/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo-farmer@agrinexus.eu", plan: "PRO", price: "249" })
    }).catch(console.error);

  }, []);

  if (!isClient) return null;

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
      
      {/* Success Confetti / Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative z-10 max-w-lg w-full bg-slate-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="w-24 h-24 bg-emerald-500/20 border-4 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
          Плащането е успешно! <Sparkles className="w-6 h-6 ml-2 text-amber-400" />
        </h1>
        
        <p className="text-slate-400 mb-8 leading-relaxed">
          Благодарим ви! Вашият профил вече е надграден. 
          Имате пълен достъп до всички ексклузивни функции и AI агенти.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-8 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Статус на акаунта:</span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">PRO / Спонсор</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Номер на поръчка:</span>
            <span className="text-slate-300 font-mono">ORD-{Math.floor(Math.random() * 1000000)}</span>
          </div>
        </div>

        <Link href="/dashboard" className="block w-full">
          <Button className="w-full h-14 text-lg font-bold bg-white text-slate-950 hover:bg-slate-200">
            Към моето табло <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
