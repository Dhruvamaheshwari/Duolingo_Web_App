"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/api";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({ name, email, password });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a192f] text-gray-100 font-sans p-4">
      <div className="w-full max-w-md bg-[#112240] rounded-3xl border border-gray-700 shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
            <UserPlus className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight text-white">Create Account</h1>
        <p className="text-center text-gray-400 mb-8 font-medium">Start your language learning journey today.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-2xl text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a192f] border-2 border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium transition-colors"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a192f] border-2 border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium transition-colors"
              placeholder="Enter your email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a192f] border-2 border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium transition-colors"
              placeholder="Create a password"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-300 uppercase tracking-wide">Confirm Password</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#0a192f] border-2 border-gray-700 rounded-2xl px-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium transition-colors"
              placeholder="Confirm your password"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full bg-indigo-500 text-white font-extrabold text-lg rounded-2xl py-4 border-b-4 border-indigo-600 active:border-b-0 active:translate-y-1 hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0"
          >
            {isLoading ? "CREATING..." : "SIGN UP"}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
