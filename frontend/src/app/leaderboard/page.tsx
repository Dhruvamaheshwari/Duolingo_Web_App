"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, getLearnerProgress, LeaderboardEntry, LearnerProgress } from "@/lib/api";
import { Trophy, Medal, Hexagon, Coffee, Flame, Star, Shield, Zap } from "lucide-react";
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
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-primary">Loading Leaderboard...</div>;
  }

  if (!progress) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-red-500">Error loading data.</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md pl-4 md:pl-8 pr-24 md:pr-28">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-indigo-500 hover:opacity-80 transition-opacity">
          LingoClone
        </Link>
        <div className="flex items-center gap-6 font-semibold text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">LEARN</Link>
          <span className="text-indigo-500 border-b-2 border-indigo-500 pb-1 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> LEADERBOARD
          </span>
          <Link href="/profile" className="ml-4 hover:text-foreground transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 flex items-center justify-center text-sm font-bold ring-2 ring-indigo-500/20">
              {progress?.username ? progress.username.charAt(0).toUpperCase() : 'U'}
            </div>
            PROFILE
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto flex w-full max-w-5xl flex-col lg:flex-row gap-8 py-10 px-4">
        
        {/* Left Column: Leaderboard */}
        <div className="flex-1 flex flex-col">
          
          {/* League Header */}
          <div className="mb-8 border-b border-border pb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Hexagon className="w-8 h-8 text-amber-600 fill-amber-500" />
              <Hexagon className="w-10 h-10 text-rose-600 fill-rose-500" />
              <Shield className="w-14 h-14 text-indigo-600 fill-indigo-500 scale-110 mx-2" />
              <Hexagon className="w-10 h-10 text-muted fill-card opacity-50" />
              <Hexagon className="w-8 h-8 text-muted fill-card opacity-50" />
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Amethyst League</h1>
              <p className="mt-2 text-primary font-bold">Top 7 advance to the next league</p>
              <p className="mt-1 font-medium text-muted-foreground text-sm uppercase tracking-wide">3 days remaining</p>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="w-full flex flex-col gap-1">
            {leaderboard.map((entry, idx) => {
              const isTop3 = entry.rank <= 3;
              let rankColor = "text-muted-foreground";
              if (entry.rank === 1) rankColor = "text-amber-500";
              else if (entry.rank === 2) rankColor = "text-gray-400";
              else if (entry.rank === 3) rankColor = "text-amber-700";

              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-4 px-6 rounded-2xl transition-colors ${
                    entry.is_current 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-8 font-extrabold text-xl text-center ${rankColor}`}>
                      {isTop3 ? (
                        <Medal className="w-8 h-8 mx-auto fill-current" />
                      ) : (
                        entry.rank
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm ${
                        entry.is_current ? 'bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'bg-slate-400'
                      }`}>
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      
                      <span className={`text-lg font-bold ${entry.is_current ? 'text-indigo-600 dark:text-indigo-400' : 'text-foreground'}`}>
                        {entry.username}
                        {entry.is_current && <span className="ml-3 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold border border-indigo-200 dark:border-indigo-800/50">You</span>}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`font-bold ${entry.is_current ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'}`}>
                    {entry.total_xp} <span className="text-sm font-semibold opacity-70">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[300px] flex flex-col gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-6 sticky top-24">
            
            {/* User Profile Mini */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm bg-indigo-500">
                {progress.username ? progress.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-foreground text-lg">{progress.username}</p>
                <Link href="/profile" className="text-indigo-500 font-bold text-sm hover:opacity-80">VIEW PROFILE</Link>
              </div>
            </div>

            <hr className="border-border" />

            {/* Set Status Section */}
            <div>
              <p className="font-bold text-foreground mb-4">Set your status</p>
              <div className="grid grid-cols-3 gap-3">
                <button className="flex items-center justify-center p-3 rounded-2xl border-2 border-border hover:bg-muted transition-colors text-orange-500">
                  <Flame className="w-6 h-6" />
                </button>
                <button className="flex items-center justify-center p-3 rounded-2xl border-2 border-border hover:bg-muted transition-colors text-amber-500 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <Star className="w-6 h-6 fill-current" />
                </button>
                <button className="flex items-center justify-center p-3 rounded-2xl border-2 border-border hover:bg-muted transition-colors text-blue-500">
                  <Zap className="w-6 h-6" />
                </button>
                <button className="flex items-center justify-center p-3 rounded-2xl border-2 border-border hover:bg-muted transition-colors text-amber-700">
                  <Coffee className="w-6 h-6" />
                </button>
                <button className="flex items-center justify-center p-3 rounded-2xl border-2 border-border hover:bg-muted transition-colors text-purple-500">
                  <Shield className="w-6 h-6" />
                </button>
                <button className="flex items-center justify-center p-3 rounded-2xl border-2 border-border hover:bg-muted transition-colors text-emerald-500">
                  <Trophy className="w-6 h-6" />
                </button>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
