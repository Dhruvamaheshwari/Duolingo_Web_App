"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, getLearnerProgress, LeaderboardEntry, LearnerProgress } from "@/lib/api";
import { Trophy, Medal, Flame, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadData() {
      try {
        const [lbData, progData] = await Promise.all([
          getLeaderboard(),
          getLearnerProgress()
        ]);
        setLeaderboard(lbData);
        setProgress(progData);
      } catch (err: any) {
        if (err.message === 'Not authenticated' || err.message.includes('401') || err.message.includes('Unauthorized')) {
          router.push('/login');
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-green-500">Loading Leaderboard...</div>;
  }

  if (!progress) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-red-500">Error loading data.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fa] font-sans text-gray-800 dark:text-gray-100">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-8">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">
          LingoClone
        </Link>
        <div className="flex items-center gap-6 font-semibold text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">LEARN</Link>
          <span className="text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 pb-1 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> LEADERBOARD
          </span>
          <Link href="/profile" className="ml-4 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold ring-2 ring-indigo-500/20">
              {progress?.username ? progress.username.charAt(0).toUpperCase() : 'U'}
            </div>
            PROFILE
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 px-4">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
            <Trophy className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">League Standings</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium">Compete with other learners by earning XP.</p>
        </div>

        {/* Leaderboard List */}
        <div className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col">
          {leaderboard.map((entry, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-4 px-6 border-b border-gray-100 dark:border-slate-800 last:border-0 transition-colors ${
                entry.is_current 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'hover:bg-gray-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-8 font-bold text-lg text-center ${
                  entry.rank === 1 ? 'text-amber-500' : 
                  entry.rank === 2 ? 'text-gray-400' : 
                  entry.rank === 3 ? 'text-amber-700' : 'text-gray-500'
                }`}>
                  {entry.rank <= 3 ? <Medal className="w-6 h-6 mx-auto" /> : entry.rank}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                    entry.is_current ? 'bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'bg-slate-400'
                  }`}>
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <span className={`font-semibold ${entry.is_current ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                    {entry.username}
                    {entry.is_current && <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">You</span>}
                  </span>
                </div>
              </div>
              <div className="font-bold text-gray-600 dark:text-gray-400">
                {entry.total_xp} <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">XP</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
