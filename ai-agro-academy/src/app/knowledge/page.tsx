"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE } from "@/lib/api";
import { ChevronLeft, FileUp, Loader2, Trash2, BookMarked } from "lucide-react";

type DocumentRow = { name: string; size_bytes: number };

function authHeaders(token: string | null, uploadSecret: string): HeadersInit {
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  if (uploadSecret.trim()) h["X-RAG-Upload-Secret"] = uploadSecret.trim();
  return h;
}

export default function KnowledgeUploadPage() {
  const [uploadSecret, setUploadSecret] = useState("");
  const uploadSecretRef = useRef("");

  useEffect(() => {
    uploadSecretRef.current = uploadSecret;
  }, [uploadSecret]);

  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [pageReady, setPageReady] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDocs = useCallback(async () => {
    const t = localStorage.getItem("token");
    const secret = uploadSecretRef.current;
    setListLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/knowledge/documents`, {
        headers: authHeaders(t, secret),
      });
      if (res.status === 401 || res.status === 403) {
        setDocuments([]);
        if (!secret.trim()) {
          setError(
            "Нямате права за списъка. Нужен е акаунт admin/instructor или валиден ключ за качване по-долу."
          );
        } else {
          setError("Невалиден ключ или сесия. Проверете ключа или влезте отново.");
        }
        return;
      }
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as DocumentRow[];
      setDocuments(data);
    } catch {
      setError("Неуспешно зареждане на списъка.");
      setDocuments([]);
    } finally {
      setListLoading(false);
      setPageReady(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      const t = localStorage.getItem("token");
      if (!t) {
        window.location.href = "/login";
        return;
      }
      void loadDocs();
    });
  }, [loadDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const t = localStorage.getItem("token");
    const secret = uploadSecretRef.current;
    if (!t && !secret.trim()) {
      setError("Нужен е вход в системата или ключ за качване.");
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/api/v1/knowledge/documents`, {
        method: "POST",
        headers: authHeaders(t, secret),
        body: form,
      });
      const text = await res.text();
      if (!res.ok) {
        let detail = text;
        try {
          const j = JSON.parse(text) as { detail?: string };
          if (typeof j.detail === "string") detail = j.detail;
        } catch {
          /* use raw */
        }
        throw new Error(detail || res.statusText);
      }
      const data = JSON.parse(text) as { stored_as: string };
      setSuccess(`Качено: ${data.stored_as}`);
      await loadDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при качване.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Изтриване на ${name}?`)) return;
    const t = localStorage.getItem("token");
    const secret = uploadSecretRef.current;
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/knowledge/documents/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
          headers: authHeaders(t, secret),
        }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { detail?: string }).detail || res.statusText);
      }
      setSuccess("Файлът е изтрит.");
      await loadDocs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при изтриване.");
    }
  };

  if (!pageReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-25">
        <div className="ai-mesh h-full">
          <div className="ai-mesh-blob top-20 right-1/4 w-[55%] h-[35%] bg-gradient-to-bl from-primary/15 to-transparent" />
        </div>
      </div>
      <header className="glass-strong border-b border-border/50 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/dashboard" className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-primary">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">База знания (RAG)</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8 pt-24">
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Качете PDF, Markdown или текстов файл. Съдържанието се включва в индекса на Проф. АгроМайнд при
          следващото запитване. Достъп: акаунт <strong className="text-foreground">admin</strong> /{" "}
          <strong className="text-foreground">instructor</strong>, или ключ{" "}
          <code className="rounded-md border border-border/60 bg-muted/80 px-1.5 py-0.5 font-mono text-xs">
            RAG_UPLOAD_SECRET
          </code>{" "}
          от бекенда.
        </p>

        <Card className="mb-6 glass-subtle border-border/60 shadow-card backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Ключ за качване (по избор)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="password"
              autoComplete="off"
              placeholder="X-RAG-Upload-Secret от .env на бекенда"
              className="w-full rounded-xl border border-border/80 bg-card/70 px-4 py-3 text-sm text-foreground backdrop-blur-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={uploadSecret}
              onChange={(e) => setUploadSecret(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-primary/40 text-primary hover:bg-primary/10"
              disabled={listLoading}
              onClick={() => void loadDocs()}
            >
              {listLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Обнови списъка"}
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6 glass-subtle border-border/60 shadow-card backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <FileUp className="h-5 w-5 text-primary" />
              Качи файл
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/35 bg-primary/5 px-6 py-10 transition hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : (
                <>
                  <FileUp className="mb-2 h-10 w-10 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Изберете .pdf, .md или .txt</span>
                  <span className="mt-1 text-xs text-muted-foreground">до 10 MB</span>
                </>
              )}
              <input
                type="file"
                accept=".pdf,.md,.txt,text/markdown,text/plain,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {success}
          </div>
        )}

        <Card className="glass-subtle border-border/60 shadow-card backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Качени документи</CardTitle>
          </CardHeader>
          <CardContent>
            {listLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Няма видими файлове или нямате достъп до списъка.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {documents.map((d) => (
                  <li
                    key={d.name}
                    className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0"
                  >
                    <span className="truncate font-mono text-xs text-foreground">{d.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {(d.size_bytes / 1024).toFixed(1)} KB
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="shrink-0 text-red-600 hover:bg-red-50"
                      onClick={() => void handleDelete(d.name)}
                      aria-label={`Изтрий ${d.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
