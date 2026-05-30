"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Save, MapPin, Tractor, Wheat, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FarmProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [profile, setProfile] = useState({
    area: "",
    region: "",
    crops: "",
    soilType: "Чернозем",
    experience: "5-10 години",
  });

  useEffect(() => {
    const saved = localStorage.getItem("agro_farm_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("agro_farm_profile", JSON.stringify(profile));
      setIsSaving(false);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (!isLoaded) return null;

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20">
        <div className="ai-mesh h-full">
          <div className="ai-mesh-blob -top-20 right-0 w-[50%] h-[45%] bg-gradient-to-bl from-emerald-500/30 to-transparent" />
          <div className="ai-mesh-blob bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-cyan-500/20 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Назад към Таблото
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Tractor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Моето Стопанство</h1>
              <p className="text-muted-foreground">Настройте профила си, за да получавате персонализирани съвети от AI.</p>
            </div>
          </div>
        </div>

        <Card className="glass-strong border-border/60">
          <CardHeader className="border-b border-border/30 pb-6">
            <CardTitle className="text-xl">Основни параметри</CardTitle>
            <CardDescription>
              Тази информация се използва от Проф. АгроМайнд като контекст при всяка ваша консултация.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" /> Регион (Област)
                </label>
                <input 
                  type="text" 
                  name="region"
                  value={profile.region}
                  onChange={handleChange}
                  placeholder="напр. Добрич, Плевен..."
                  className="w-full bg-card/50 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-emerald-400" /> Площ (в декари)
                </label>
                <input 
                  type="number" 
                  name="area"
                  value={profile.area}
                  onChange={handleChange}
                  placeholder="напр. 15000"
                  className="w-full bg-card/50 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-400" /> Отглеждани култури
              </label>
              <textarea 
                name="crops"
                value={profile.crops}
                onChange={handleChange}
                placeholder="Пшеница, слънчоглед, рапица..."
                className="w-full bg-card/50 border border-border/50 rounded-xl px-4 py-3 text-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Преобладаващ тип почва</label>
                <select 
                  name="soilType"
                  value={profile.soilType}
                  onChange={handleChange}
                  className="w-full bg-card/50 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="Чернозем">Чернозем</option>
                  <option value="Смолница">Смолница</option>
                  <option value="Канелена горска">Канелена горска</option>
                  <option value="Алувиална">Алувиална</option>
                  <option value="Друга">Друга</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Опит в земеделието</label>
                <select 
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  className="w-full bg-card/50 border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="Начинаещ (0-2 год.)">Начинаещ (0-2 год.)</option>
                  <option value="С опит (2-5 год.)">С опит (2-5 год.)</option>
                  <option value="Напреднал (5-10 год.)">Напреднал (5-10 год.)</option>
                  <option value="Експерт (Над 10 год.)">Експерт (Над 10 год.)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border/30">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold"
              >
                {isSaving ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Запазване...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Запази профила</>
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
