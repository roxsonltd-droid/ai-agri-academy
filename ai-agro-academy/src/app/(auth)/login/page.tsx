"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appFieldLabelClassName, appInputClassName } from "@/lib/app-shell-classes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "https://agro-academy-backend.onrender.com"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Грешен имейл или парола");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Възникна грешка");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-app-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center space-x-2 mb-6">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-app-ink"
          >
            <path d="M12 22c4-4 4-10 0-14-4 4-4 10 0 14z" fill="currentColor" fillOpacity="0.1" />
            <path d="M12 8c4-4 4-10 0-14-4 4-4 10 0 14z" transform="rotate(90 12 12)" />
          </svg>
          <span className="text-2xl font-semibold tracking-tight text-app-ink">AI Agro</span>
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight">Вход във вашия профил</h2>
        <p className="mt-2 text-center text-sm text-app-ink-muted">
          Нямате профил?{" "}
          <Link href="/register" className="font-semibold text-app-primary hover:text-app-primary-hover transition-colors">
            Създайте сега
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-app-card py-8 px-4 shadow-sm border border-app-border sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium border border-red-100">{error}</div>
            )}
            <div>
              <label htmlFor="email" className={appFieldLabelClassName}>
                Имейл адрес
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={appInputClassName}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={appFieldLabelClassName}>
                Парола
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={appInputClassName}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-app-ink hover:bg-app-navy-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-app-ink transition-colors h-11"
              >
                {isLoading ? "Влизане..." : "Вход"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
