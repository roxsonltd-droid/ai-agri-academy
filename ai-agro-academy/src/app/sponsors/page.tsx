import Link from "next/link";
import { ChevronLeft, Target, ArrowRight, Star, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const AD_BOARDS = [
  {
    title: "Партньор 'Подкаст'",
    description: "Аудио реклама в генерираните AI подкасти",
    price: "499 лв.",
    duration: "на месец",
    features: [
      "Споменаване в началото на всеки подкаст",
      "Лого в секцията /podcast",
      "Достигане до активните слушатели в трактора",
      "Ежемесечен отчет"
    ],
    popular: false,
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Генерален Спонсор",
    description: "Ексклузивно присъствие на началната страница",
    price: "1,200 лв.",
    duration: "на месец",
    features: [
      "Голям банер на първа страница (hero секция)",
      "Приоритетно позициониране на бранда ви",
      "Лого във всички AI Лаборатории",
      "Специален PR материал, написан от АгроМайнд"
    ],
    popular: true,
    color: "from-primary to-cyan-400",
    bg: "bg-primary/10"
  },
  {
    title: "Спонсор 'Модул'",
    description: "Спонсорирайте конкретен инструмент (напр. Време, Пазари)",
    price: "299 лв.",
    duration: "на месец",
    features: [
      "Брандиране 'Спонсорирано от' в избрания модул",
      "Кликаем линк към вашия сайт",
      "Таргетирана аудитория според модула",
      "Перфектно за по-малък бюджет"
    ],
    popular: false,
    color: "from-purple-400 to-indigo-500",
    bg: "bg-purple-500/10"
  }
];

export default function SponsorsPage() {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground flex flex-col pt-10">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-20">
        <div className="ai-mesh h-full">
          <div className="ai-mesh-blob -top-20 right-0 w-[50%] h-[45%] bg-gradient-to-bl from-primary/30 to-transparent" />
          <div className="ai-mesh-blob bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-accent/20 to-transparent" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mb-16 relative z-10 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Назад към началото
          </Link>
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gradient-ai">
            Реклама и Спонсорство
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Позиционирайте вашия бранд пред най-иновативните земеделци в България. 
            Изберете своето рекламно табло.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {AD_BOARDS.map((board, idx) => (
            <div 
              key={idx} 
              className={`relative glass flex flex-col rounded-3xl overflow-hidden border ${board.popular ? 'border-primary/50 shadow-elevated scale-105 z-10' : 'border-border/60 hover:border-primary/30'} transition-all duration-300`}
            >
              {board.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-cyan-400" />
              )}
              {board.popular && (
                <div className="absolute top-4 right-4 bg-primary/20 text-primary px-3 py-1 text-xs font-bold rounded-full border border-primary/30 flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Препоръчано
                </div>
              )}
              
              <div className="p-8 pb-0">
                <h3 className="text-xl font-bold mb-2">{board.title}</h3>
                <p className="text-muted-foreground text-sm h-10">{board.description}</p>
                
                <div className="my-6">
                  <span className="text-4xl font-extrabold">{board.price}</span>
                  <span className="text-muted-foreground ml-2">{board.duration}</span>
                </div>
              </div>

              <div className="flex-1 bg-card/40 p-8 flex flex-col justify-between border-t border-border/30">
                <ul className="space-y-4 mb-8">
                  {board.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <ShieldCheck className={`w-5 h-5 mr-3 shrink-0 bg-clip-text ${board.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full h-12 rounded-xl text-md font-bold shadow-lg transition-all ${
                    board.popular 
                      ? 'bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-400 text-primary-foreground shadow-primary/25 hover:scale-[1.02]' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  Запази това табло <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-4xl mx-auto glass-subtle border border-border/50 rounded-3xl p-8 md:p-12 text-center flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left flex-1">
            <h3 className="text-2xl font-bold mb-2">Имате различна идея?</h3>
            <p className="text-muted-foreground">
              Предлагаме и индивидуални B2B решения, интеграция на ваши продукти в AI симулатора и спонсорирано съдържание.
            </p>
          </div>
          <Button variant="outline" size="lg" className="h-14 px-8 rounded-full border-primary/30 text-primary hover:bg-primary/10 shrink-0">
            Свържете се с нас
          </Button>
        </div>
      </div>
    </div>
  );
}
