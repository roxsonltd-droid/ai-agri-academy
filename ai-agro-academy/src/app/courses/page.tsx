import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
	title: "Курсове · AI Agro Academy",
	description: "Каталог и достъп до вашите курсове",
};

export default function CoursesIndexPage() {
	return (
		<main className="mx-auto max-w-lg px-6 py-24 pt-32 text-center font-sans text-[#0A2540]">
			<h1 className="text-2xl font-bold tracking-tight">Курсове</h1>
			<p className="mt-3 text-[#425466]">
				Каталогът с обучения се зарежда от вашия профил. Отворете таблото, за да видите генерираните курсове и да продължите урок.
			</p>
			<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
				<Link href="/dashboard">
					<Button className="w-full bg-[#059669] hover:bg-[#047857] text-white sm:w-auto">Към таблото</Button>
				</Link>
				<Link href="/">
					<Button variant="outline" className="w-full sm:w-auto">
						Начало
					</Button>
				</Link>
			</div>
		</main>
	);
}
