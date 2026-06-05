"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { API_BASE } from "@/lib/api";
import { DevOnly } from "@/components/dev-only";

export default function CreateAdPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/ads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, price })
      });
      if (!res.ok) throw new Error("Неуспешно създаване на обява");
      setMessage("Обявата е създадена успешно!");
      setTitle("");
      setDescription("");
      setPrice("");
    } catch (err: any) {
      setMessage(err.message ?? "Грешка при заявката");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background font-sans text-foreground">


<DevOnly>
  <div className="ai-mesh opacity-20 pointer-events-none absolute inset-0">
    <div className="ai-mesh-blob top-0 left-0 w-[55%] h-[45%] bg-gradient-to-tr from-emerald-500/20 to-teal-500/10" />
  </div>
</DevOnly>
      <main className="relative z-10 container mx-auto max-w-2xl px-4 py-12">
        <Card className="glass-subtle border-border/60">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-400">Създай нова обява</CardTitle>
            <CardDescription>Попълнете полетата и натиснете „Публикувай“.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                placeholder="Заглавие на обявата"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <Textarea
                placeholder="Описание"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                required
              />
              <Input
                placeholder="Цена (лв)"
                value={price}
                onChange={e => setPrice(e.target.value)}
                type="number"
                required
              />
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {isSubmitting ? "Публикуване..." : "Публикувай"}
              </Button>
            </form>
            {message && <p className="mt-4 text-center text-sm text-foreground">{message}</p>}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
