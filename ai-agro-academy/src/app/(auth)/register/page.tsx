"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sprout } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Възникна грешка при регистрацията");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-[#0A2540]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center space-x-2 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[#0A2540]">
            <path d="M12 22c4-4 4-10 0-14-4 4-4 10 0 14z" fill="currentColor" fillOpacity="0.1"/>
            <path d="M12 8c4-4 4-10 0-14-4 4-4 10 0 14z" transform="rotate(90 12 12)" />
          </svg>
          <span className="text-2xl font-semibold tracking-tight text-[#0A2540]">AI Agro</span>
        </Link>
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Създайте нов профил
        </h2>
        <p className="mt-2 text-center text-sm text-[#425466]">
          Вече имате профил?{" "}
          <Link href="/login" className="font-semibold text-[#059669] hover:text-[#047857] transition-colors">
            Влезте от тук
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-[#E6EBF1] sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#425466]">
                Име и фамилия
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-[#E6EBF1] px-3 py-2.5 placeholder-[#94A3B8] shadow-sm focus:border-[#059669] focus:outline-none focus:ring-[#059669] sm:text-sm bg-[#F6F9FC] transition-all"
                  placeholder="Иван Иванов"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#425466]">
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
                  className="block w-full appearance-none rounded-lg border border-[#E6EBF1] px-3 py-2.5 placeholder-[#94A3B8] shadow-sm focus:border-[#059669] focus:outline-none focus:ring-[#059669] sm:text-sm bg-[#F6F9FC] transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#425466]">
                Парола
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-[#E6EBF1] px-3 py-2.5 placeholder-[#94A3B8] shadow-sm focus:border-[#059669] focus:outline-none focus:ring-[#059669] sm:text-sm bg-[#F6F9FC] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] transition-colors h-11"
              >
                {isLoading ? "Създаване..." : "Регистрация"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
