"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground font-sans p-4">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
            <LogIn className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-foreground">Welcome back</h1>
        <p className="text-center text-muted-foreground mb-8 font-medium">Log in to continue your learning journey.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-2xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-foreground font-medium transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border-2 border-border rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-foreground font-medium transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full bg-emerald-500 text-white font-extrabold text-lg rounded-2xl py-4 border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0"
          >
            {isLoading ? "LOGGING IN..." : "LOG IN"}
          </button>
        </form>

        <p className="mt-8 text-center text-muted-foreground font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
