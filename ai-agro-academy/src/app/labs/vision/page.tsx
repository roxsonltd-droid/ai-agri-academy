"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ImagePlus, Loader2, Sparkles, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const apiBase = () => process.env.NEXT_PUBLIC_API_URL || "https://agro-academy-backend.onrender.com";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result;
      if (typeof s === "string") resolve(s);
      else reject(new Error("read fail"));
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export default function LabsVisionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState(
    "Има ли признаци на болест или вредител? Какво препоръчваш за третиране?",
  );
  const [inferJson, setInferJson] = useState<string | null>(null);
  const [agentReply, setAgentReply] = useState<string | null>(null);
  const [loadingInfer, setLoadingInfer] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError(null);
    setInferJson(null);
    setAgentReply(null);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Изберете JPEG, PNG или WebP.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }, []);

  const token = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const runInfer = async () => {
    if (!file) {
      setError("Първо изберете снимка.");
      return;
    }
    setLoadingInfer(true);
    setError(null);
    setInferJson(null);
    try {
      const t = token();
      if (!t) {
        setError("Влезте в акаунта (JWT), за да извикате Roboflow, или задайте X-Roboflow-Infer-Secret на бекенда.");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiBase()}/api/v1/vision/roboflow/infer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: fd,
      });
      const text = await res.text();
      if (!res.ok) {
        setError(text || `HTTP ${res.status}`);
        return;
      }
      try {
        const j = JSON.parse(text);
        setInferJson(JSON.stringify(j, null, 2));
      } catch {
        setInferJson(text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Мрежова грешка");
    } finally {
      setLoadingInfer(false);
    }
  };

  const runAgent = async () => {
    if (!file) {
      setError("Първо изберете снимка.");
      return;
    }
    setLoadingAgent(true);
    setError(null);
    setAgentReply(null);
    try {
      const t = token();
      if (!t) {
        setError("Влезте в акаунта, за да ползвате агента с изображение.");
        return;
      }
      const image_base64 = await readFileAsBase64(file);
      const res = await fetch(`${apiBase()}/api/v1/agents/run`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question.trim(),
          image_base64,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { detail?: string }).detail || JSON.stringify(data) || `HTTP ${res.status}`);
        return;
      }
      setAgentReply((data as { reply?: string }).reply ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Мрежова грешка");
    } finally {
      setLoadingAgent(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <div className="ai-mesh">
          <div className="ai-mesh-blob -top-24 right-0 w-[55%] h-[45%] bg-gradient-to-bl from-primary/20 to-cyan-400/10" />
          <div className="ai-mesh-blob bottom-0 left-0 w-[50%] h-[40%] bg-gradient-to-tr from-accent/15 to-transparent" />
        </div>
      </div>

      <header className="relative z-10 border-b border-border/50 glass-strong px-4 py-3">
        <div className="container mx-auto flex flex-wrap items-center gap-3">
          <Link
            href="/labs"
            className="inline-flex items-center text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Лаборатории
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-sm font-semibold text-foreground sm:text-base flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            Roboflow — компютърно зрение
          </h1>
        </div>
      </header>

      <main className="relative z-10 container mx-auto flex-1 px-4 py-8 pt-6 max-w-4xl">
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Качете снимка (лист, култура, дрон). Бекендът извиква{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">POST /api/v1/vision/roboflow/infer</code> или
          агент (ReAct) с инструмент <code className="rounded bg-muted px-1.5 py-0.5 text-xs">roboflow_detect_uploaded</code> + Mistral.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-subtle border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImagePlus className="h-5 w-5 text-primary" />
                Снимка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-10 transition-colors hover:border-primary/40 hover:bg-muted/50">
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPick} />
                <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm font-semibold text-foreground">Избери файл</span>
                <span className="text-xs text-muted-foreground mt-1">JPEG · PNG · WebP</span>
              </label>
              {previewUrl && (
                <img src={previewUrl} alt="Преглед" className="max-h-56 w-full rounded-lg object-contain ring-1 ring-border" />
              )}
            </CardContent>
          </Card>

          <Card className="glass-subtle border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-accent" />
                Въпрос към агента
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={8}
                className="w-full resize-y rounded-xl border border-border/80 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                placeholder="Какво да анализира AI след Roboflow?"
              />
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={runInfer} disabled={loadingInfer || !file} className="rounded-full">
            {loadingInfer ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Само Roboflow (JSON)
          </Button>
          <Button
            type="button"
            variant="neon"
            onClick={runAgent}
            disabled={loadingAgent || !file}
            className="rounded-full"
          >
            {loadingAgent ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Агент + Roboflow + Mistral
          </Button>
        </div>

        {inferJson && (
          <Card className="mt-8 border-border/60 glass-subtle">
            <CardHeader>
              <CardTitle className="text-base">Roboflow отговор</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-background/80 p-4 text-xs leading-relaxed text-muted-foreground ring-1 ring-border/60">
                {inferJson}
              </pre>
            </CardContent>
          </Card>
        )}

        {agentReply && (
          <Card className="mt-6 border-border/60 glass-subtle">
            <CardHeader>
              <CardTitle className="text-base">Отговор от агента</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                {agentReply}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
