import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "Курсове · AI Agro Academy",
	description: "Каталог и достъп до вашите курсове",
};

export default function CoursesIndexPage() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
			<div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
				<div className="ai-mesh">
					<div className="ai-mesh-blob top-10 left-1/4 w-[55%] h-[40%] bg-gradient-to-br from-primary/25 to-cyan-400/10" />
					<div className="ai-mesh-blob bottom-20 right-0 w-[45%] h-[35%] bg-gradient-to-tl from-accent/20 to-transparent" />
				</div>
			</div>
			<main className="mx-auto max-w-lg px-6 py-24 pt-32 text-center">
				<div className="glass-subtle rounded-2xl border border-border/60 p-8 shadow-card backdrop-blur-md">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Курсове</h1>
					<p className="mt-3 text-muted-foreground">
						Каталогът с обучения се зарежда от вашия профил. Отворете таблото, за да видите генерираните курсове и да
						продължите урок.
					</p>
					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
						<Link href="/dashboard">
							<Button className="w-full shadow-sm glow-primary sm:w-auto">Към таблото</Button>
						</Link>
						<Link href="/">
							<Button variant="outline" className="w-full border-border/80 bg-card/50 backdrop-blur-sm sm:w-auto">
								Начало
							</Button>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
