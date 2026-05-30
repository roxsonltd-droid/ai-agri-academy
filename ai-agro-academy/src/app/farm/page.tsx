"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Save, MapPin, Tractor, Wheat, Loader2, CloudLightning, Sun, Wind, Droplets, LineChart, TrendingUp, AlertTriangle, ArrowRight, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FarmProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
      const parsed = JSON.parse(saved);
      setProfile(parsed);
      if (!parsed.region || !parsed.crops) {
        setIsEditing(true);
      }
    } else {
      setIsEditing(true);
    }
    setIsLoaded(true);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("agro_farm_profile", JSON.stringify(profile));
      setIsSaving(false);
      setIsEditing(false);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (!isLoaded) return null;

  // Render the Edit Form
  if (isEditing) {
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

              <div className="pt-4 border-t border-border/30 flex justify-between">
                {profile.region && profile.crops && (
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-muted-foreground">
                    Отказ
                  </Button>
                )}
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || !profile.region || !profile.crops}
                  className="ml-auto w-full sm:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold"
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

  // Render the Live Dashboard
  const askRectorUrl = `/faculty/agromind?context=${encodeURIComponent(
    `Здравейте, аз съм фермер от регион ${profile.region}. Отглеждам ${profile.crops} на площ от ${profile.area} дка (${profile.soilType}). Имам следния въпрос:`
  )}`;

  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20">
        <div className="ai-mesh h-full">
          <div className="ai-mesh-blob -top-20 right-10 w-[60%] h-[50%] bg-gradient-to-bl from-primary/30 to-transparent" />
          <div className="ai-mesh-blob bottom-10 left-10 w-[50%] h-[40%] bg-gradient-to-tr from-accent/20 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-border/50 pb-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад към Таблото
            </Link>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 border border-primary/50 shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <Tractor className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Команден център</h1>
            </div>
            <p className="text-muted-foreground">Живи данни и AI анализи за вашето стопанство в {profile.region}.</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(true)} className="border-border/60">
              <Edit3 className="w-4 h-4 mr-2" /> Настройки
            </Button>
            <Link href={askRectorUrl}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
                AI Консултация <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Farm Details Card */}
          <Card className="glass-subtle border-border/50 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-foreground">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Локация: {profile.region}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Площ</p>
                  <p className="text-base font-bold">{profile.area || 0} дка</p>
                </div>
                <div className="bg-background/40 p-3 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Почва</p>
                  <p className="text-base font-bold">{profile.soilType}</p>
                </div>
              </div>
              <div className="bg-background/40 p-4 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2 flex items-center">
                  <Wheat className="w-4 h-4 mr-1 text-emerald-400" /> Активни култури
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.crops.split(",").map((c, i) => (
                    <span key={i} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-md">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Weather Agent Card */}
          <Card className="glass-strong border-blue-500/20 lg:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CloudLightning className="w-32 h-32" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center text-blue-400">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                  Агент "Метеоролог"
                </CardTitle>
                <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">LIVE DATA</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4 relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="col-span-1 flex flex-col justify-center items-center p-4 bg-background/40 rounded-xl border border-border/50">
                <Sun className="w-10 h-10 text-yellow-400 mb-2" />
                <h3 className="text-3xl font-bold">24°C</h3>
                <p className="text-sm text-muted-foreground">Предимно слънчево</p>
              </div>
              <div className="col-span-2 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 flex items-center p-3 bg-background/40 rounded-lg border border-border/50">
                    <Droplets className="w-5 h-5 text-blue-400 mr-3" />
                    <div>
                      <p className="text-xs text-muted-foreground">Влажност</p>
                      <p className="text-sm font-bold">45% (Оптимално)</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center p-3 bg-background/40 rounded-lg border border-border/50">
                    <Wind className="w-5 h-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-xs text-muted-foreground">Вятър</p>
                      <p className="text-sm font-bold">12 км/ч (СИ)</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-400">AI Предупреждение</p>
                    <p className="text-xs text-red-300 mt-1">
                      Очаква се краткотрайна буря в региона на {profile.region} утре следобед. 
                      Препоръчва се отлагане на пръскането с хербициди.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Market Agent Card */}
          <Card className="glass-strong border-emerald-500/20 lg:col-span-3 relative overflow-hidden mt-2">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <LineChart className="w-48 h-48" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                  Агент "Агро Пазар"
                </CardTitle>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">LIVE MARKET</span>
              </div>
              <CardDescription>Изкупни цени и тенденции за вашите култури спрямо борсите в региона.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {profile.crops.split(",").slice(0, 4).map((c, i) => (
                  <div key={i} className="p-4 bg-background/50 border border-border/50 rounded-xl relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                    <p className="text-sm text-muted-foreground font-medium mb-2">{c.trim()}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-2xl font-bold">{(Math.random() * 200 + 300).toFixed(0)} <span className="text-xs text-muted-foreground font-normal">лв/т</span></h3>
                      <div className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <TrendingUp className="w-3 h-3 mr-1" /> +{(Math.random() * 5 + 1).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
                {profile.crops.split(",").length === 0 && (
                  <p className="text-sm text-muted-foreground">Моля, добавете култури в профила си, за да видите пазарни данни.</p>
                )}
              </div>
              <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-200/80">
                  <strong className="text-emerald-400">AI Анализ на пазара:</strong> Търсенето на зърнени култури в Черноморския регион се увеличава. 
                  Препоръчваме задържане на продукцията през следващите 2 седмици за постигане на оптимална цена.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
