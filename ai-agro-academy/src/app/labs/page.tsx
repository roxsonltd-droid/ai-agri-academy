"use client";

import Link from "next/link";
import { ChevronLeft, Beaker, Leaf, Eye, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LabsHubPage() {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground flex flex-col pt-20">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-25">
        <div className="ai-mesh h-full">
          <div className="ai-mesh-blob -top-10 left-0 w-[50%] h-[45%] bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="ai-mesh-blob bottom-0 right-10 w-[40%] h-[40%] bg-gradient-to-tl from-accent/15 to-transparent" />
        </div>
      </div>

      {/* Top Header */}
      <div className="glass-strong border-b border-border/50 h-14 flex items-center px-4 lg:px-8 shadow-sm flex-shrink-0 z-10 backdrop-blur-xl gap-3">
        <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium rounded-full px-2 py-1 hover:bg-muted/70 shrink-0">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Назад към портала
        </Link>
        <div className="h-4 w-px bg-border hidden sm:block shrink-0" />
        <h1 className="text-[15px] font-semibold text-foreground hidden sm:block truncate min-w-0 flex-1 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          AI Лаборатории
        </h1>
      </div>

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4 border border-primary/20">
              <Beaker className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Практически Лаборатории</h2>
              <p className="text-muted-foreground text-sm mt-1">Изберете инструмент, за да експериментирате с AI в реални сценарии</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/labs/soil" className="group">
              <Card className="h-full glass-subtle border-border/60 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl group-hover:text-primary transition-colors">
                    <Leaf className="h-6 w-6 text-green-500" />
                    Анализ на почвата
                  </CardTitle>
                  <CardDescription>
                    Симулатор за агрономически и финансови прогнози въз основа на почвени параметри.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Въведете pH, NPK, бюджет и метеорология, за да получите експертен съвет от Проф. АгроМайнд.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/labs/vision" className="group">
              <Card className="h-full glass-subtle border-border/60 hover:border-accent/50 transition-all hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl group-hover:text-accent transition-colors">
                    <Eye className="h-6 w-6 text-accent" />
                    Компютърно зрение
                  </CardTitle>
                  <CardDescription>
                    Разпознаване на болести и вредители чрез снимки с Roboflow и AI.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Качете снимка на листо или култура, за да получите диагноза от компютърното зрение и AI агента.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

