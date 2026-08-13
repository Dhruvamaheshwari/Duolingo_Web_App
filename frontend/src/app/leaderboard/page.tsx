"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, getLearnerProgress, LeaderboardEntry, LearnerProgress } from "@/lib/api";

export default function LeaderboardPage() {
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
      } catch (err) {
        console.error(err);
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
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 md:px-8">
        <Link href="/" className="text-2xl font-extrabold text-green-500 hover:text-green-400 transition-colors">
          LingoClone
        </Link>
        <div className="flex items-center gap-6 font-bold text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-700 dark:text-gray-200 transition-colors">LEARN</Link>
          <span className="text-gray-800 dark:text-gray-100 border-b-2 border-gray-800 pb-1">LEADERBOARD</span>
          <Link href="/profile" className="ml-4 hover:text-gray-800 dark:text-gray-100 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
              {progress?.username ? progress.username.charAt(0).toUpperCase() : 'U'}
            </div>
            PROFILE
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 px-4">
        
        {/* Header Section */}
        <div className="w-full mb-8 text-center flex flex-col items-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">League Standings</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">Compete with other learners by earning XP.</p>
        </div>

        {/* Leaderboard List */}
        <div className="w-full rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
          {leaderboard.map((entry, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-4 px-6 border-b-2 border-gray-100 last:border-b-0 ${entry.is_current ? 'bg-blue-50' : 'bg-white dark:bg-slate-900'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`font-bold w-6 text-center ${
                  entry.rank === 1 ? 'text-yellow-500 text-xl' : 
                  entry.rank === 2 ? 'text-gray-400 text-xl' : 
                  entry.rank === 3 ? 'text-orange-400 text-xl' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {entry.rank}
                </span>
                
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">
                  {entry.username.charAt(0).toUpperCase()}
                </div>
                
                <span className={`font-bold ${entry.is_current ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}>
                  {entry.username} {entry.is_current && '(You)'}
                </span>
              </div>
              <span className="font-bold text-gray-500 dark:text-gray-400">
                {entry.total_xp} XP
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
