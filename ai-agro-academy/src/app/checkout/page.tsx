"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, CreditCard, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const planId = searchParams.get("planId") || "Избран план";
  const price = searchParams.get("price") || "0";
  const annual = searchParams.get("annual") === "true";

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate Stripe API call
    setTimeout(() => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/checkout/success");
      }, 1000);
    }, 2500);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-300 font-sans flex items-center justify-center py-20 px-4">
      {/* Background Grid & Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Payment Form (Left) */}
        <div className="lg:col-span-3">
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="bg-transparent border-b border-slate-800 pb-6">
              <div className="flex items-center space-x-2 text-white mb-2">
                <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Плащане</CardTitle>
              </div>
              <p className="text-sm text-slate-400">Сигурно плащане през 256-bit SSL криптиране. Вашите данни са защитени.</p>
            </CardHeader>
            <CardContent className="pt-8">
              {success ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Плащането е успешно!</h3>
                  <p className="text-slate-400">Моля изчакайте, пренасочваме ви...</p>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-slate-500" /> Данни на картата
                    </h4>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Име върху картата</label>
                      <Input required placeholder="Иван Иванов" className="w-full" />
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-400 mb-1 block">Номер на картата</label>
                      <div className="relative">
                        <Input required placeholder="0000 0000 0000 0000" maxLength={19} className="w-full font-mono tracking-widest pl-10" />
                        <CreditCard className="w-5 h-5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">Валидност (MM/YY)</label>
                        <Input required placeholder="12/28" maxLength={5} className="w-full font-mono text-center" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 mb-1 block">CVC</label>
                        <Input required type="password" placeholder="***" maxLength={3} className="w-full font-mono text-center" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <Button 
                      type="submit" 
                      disabled={isProcessing}
                      className="w-full h-14 text-lg font-bold bg-primary text-slate-950 hover:bg-primary/90 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Обработка...
                        </>
                      ) : (
                        <>
                          Плати {price} € <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
            <CardFooter className="bg-slate-950/30 border-t border-slate-800 p-4 flex justify-center text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 mr-1 text-primary/70" /> Плащането е обезпечено от Stripe (Демо Режим)
            </CardFooter>
          </Card>
        </div>

        {/* Order Summary (Right) */}
        <div className="lg:col-span-2">
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-24">
            <CardHeader className="border-b border-slate-800 bg-slate-950/20">
              <CardTitle className="text-lg">Вашата поръчка</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-lg">{planId}</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    {annual ? "Годишен абонамент" : "Месечен абонамент"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white text-xl">{price} €</span>
                </div>
              </div>
              
              {annual && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Отстъпка (Годишен план)</span>
                  <Badge variant="default" className="font-mono">-20%</Badge>
                </div>
              )}

              <div className="pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-white">Общо за плащане</span>
                  <span className="text-3xl font-extrabold text-primary">{price} <span className="text-xl">€</span></span>
                </div>
                <p className="text-right text-xs text-slate-500 mt-2">с вкл. ДДС</p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 text-sm">
                <h5 className="font-bold text-white mb-2 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" /> Гаранция
                </h5>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Можете да прекратите абонамента си по всяко време без допълнителни такси. 
                  Услугата се подновява автоматично.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
