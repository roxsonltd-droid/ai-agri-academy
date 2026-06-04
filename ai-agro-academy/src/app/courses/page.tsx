import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Video, ChevronLeft, PlayCircle, BookOpen } from "lucide-react";

export const metadata = {
	title: "Видео Уроци · AI Agro Academy",
	description: "Каталог с 3D видео симулации и уроци.",
};

export default function CoursesIndexPage() {
	return (
		<div className="relative flex flex-col min-h-screen overflow-hidden bg-background font-sans text-foreground">
			<div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
				<div className="ai-mesh-blob top-0 left-1/4 w-[55%] h-[40%] bg-gradient-to-br from-red-500/20 to-orange-500/10" />
				<div className="ai-mesh-blob bottom-10 right-0 w-[45%] h-[45%] bg-gradient-to-tl from-rose-500/10 to-transparent" />
			</div>

      <header className="relative z-10 glass-strong border-b border-border/50 px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-xl">
              <Video className="h-5 w-5 text-red-400" />
            </div>
            <h1 className="font-bold text-lg text-foreground">Видео Уроци и Симулации</h1>
          </div>
        </div>
      </header>

			<main className="relative z-10 flex-1 container mx-auto max-w-4xl px-4 py-12 flex flex-col items-center justify-center text-center">
				<div className="glass-subtle rounded-3xl border border-border/60 p-10 shadow-card backdrop-blur-md max-w-2xl w-full relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <PlayCircle className="w-64 h-64" />
          </div>

          <div className="h-20 w-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <BookOpen className="h-10 w-10 text-red-400" />
          </div>

					<h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            Академията е отворена
          </h2>
					<p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
						Каталогът с интерактивни обучения и 3D видео симулации за работа с агро техника е достъпен през персоналното ви табло. Отворете го, за да започнете.
					</p>
					
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Link href="/dashboard">
							<Button className="w-full sm:w-auto h-12 px-8 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 text-md font-semibold">
                Към Таблото с Курсове
              </Button>
						</Link>
						<Link href="/">
							<Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full border-border/80 bg-card/50 backdrop-blur-sm text-md font-semibold hover:bg-white/5">
								Обратно в началото
							</Button>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
