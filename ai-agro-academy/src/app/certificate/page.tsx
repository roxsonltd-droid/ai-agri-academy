"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Printer, Medal, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CertificateContent() {
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get("course") || "Основи на Прецизното Земеделие";
  
  const [studentName, setStudentName] = useState("Иван Иванов (Отличен)");
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString("bg-BG"));
  const [certId, setCertId] = useState("#" + (Math.floor(Math.random() * 90000) + 10000).toString());
  
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("agro_farm_profile");
      if (savedUser) {
        // We can just set a dynamic name for realism
        setStudentName("Сертифициран Фермер");
      }
    } catch(e) {}

    try {
      const certs = JSON.parse(localStorage.getItem("agro_certificates") || "[]");
      const found = certs.find((c: any) => c.courseName === courseTitle);
      if (found) {
        setDateStr(new Date(found.date).toLocaleDateString("bg-BG"));
        setCertId("#" + found.id);
      }
    } catch(e) {}
  }, [courseTitle]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center print:hidden">
        <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center transition-colors">
          <ChevronLeft className="w-5 h-5 mr-1" /> Към портала
        </Link>
        <Button onClick={handlePrint} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/50">
          <Printer className="w-4 h-4 mr-2" /> Принтирай
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        
        <div className="relative bg-white w-full max-w-5xl aspect-[1.414/1] sm:aspect-auto sm:min-h-[700px] rounded-sm shadow-2xl p-4 sm:p-12 border-8 border-slate-800 overflow-hidden print:shadow-none print:border-none print:p-0">
          
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full border-[12px] border-double border-amber-600/30 m-4 rounded-sm pointer-events-none print:m-0" />
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-amber-700 m-8 rounded-tl-xl pointer-events-none print:hidden" />
          <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-amber-700 m-8 rounded-tr-xl pointer-events-none print:hidden" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-amber-700 m-8 rounded-bl-xl pointer-events-none print:hidden" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-amber-700 m-8 rounded-br-xl pointer-events-none print:hidden" />

          <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-4 py-8">
            
            <div className="flex items-center space-x-4 mb-8">
              <ShieldCheck className="w-16 h-16 text-amber-700" />
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 tracking-wider uppercase">
                Agro Academy
              </h1>
              <ShieldCheck className="w-16 h-16 text-amber-700" />
            </div>

            <p className="text-xl md:text-2xl text-slate-600 font-serif italic mb-12">
              Този сертификат се издава на
            </p>

            <h2 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-6 border-b-2 border-slate-300 pb-4 px-12">
              {studentName}
            </h2>

            <p className="text-lg md:text-xl text-slate-600 font-serif mb-6">
              за успешно завършване на обучителния модул:
            </p>

            <h3 className="text-3xl md:text-4xl font-serif font-bold text-amber-800 mb-16 uppercase max-w-3xl leading-snug">
              {courseTitle}
            </h3>

            <div className="w-full flex flex-col md:flex-row justify-between items-end mt-auto px-8 md:px-24">
              
              <div className="flex flex-col items-center mb-8 md:mb-0">
                <div className="text-4xl font-signature text-slate-700 mb-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>AgroMind AI</div>
                <div className="w-48 border-t border-slate-400 pt-2">
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Проф. АгроМайнд</p>
                  <p className="text-xs text-slate-500">Главен AI Ректор</p>
                </div>
              </div>

              <div className="relative flex items-center justify-center mb-8 md:mb-0 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 rounded-full shadow-xl flex items-center justify-center border-4 border-amber-200">
                  <div className="w-28 h-28 border-2 border-dashed border-amber-200/50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <Medal className="w-10 h-10 text-white mx-auto mb-1" />
                      <p className="text-[10px] text-white font-bold tracking-widest uppercase">Certified</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="text-xl font-serif text-slate-800 mb-4">{dateStr}</div>
                <div className="w-48 border-t border-slate-400 pt-2">
                  <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Дата</p>
                  <p className="text-xs text-slate-500">Идентификатор: {certId}</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Зареждане на сертификата...</div>}>
      <CertificateContent />
    </Suspense>
  );
}
