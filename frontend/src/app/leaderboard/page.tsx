"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard, getLearnerProgress, LeaderboardEntry, LearnerProgress } from "@/lib/api";
import { Trophy, Coffee, Flame, Star, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

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
        if (err.message === 'Not authenticated' || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          router.push('/login');
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-emerald-500 font-bold text-xl">
        <span>Loading Leaderboard...</span>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-red-500 font-bold text-xl">
        <span>Error loading data.</span>
      </div>
    );
  }

  const userEntry = leaderboard.find(e => e.is_current);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar username={progress.username} totalXp={progress.total_xp} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto w-full pb-24 md:pb-12">
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-4">
          
          {/* Leaderboard Column */}
          <div className="flex-1 flex flex-col">
            
            {/* Header */}
            <div className="mb-8 border-b border-border/50 pb-8 text-center">
              <h1 className="text-3xl font-black tracking-tight text-foreground">League Standings</h1>
              <p className="mt-2 text-muted-foreground font-medium mb-4">Compete with other learners by earning XP.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 font-bold rounded-2xl border border-emerald-500/30">
                <Trophy className="w-5 h-5" />
                <span>Current rank: {userEntry ? `#${userEntry.rank}` : 'Unranked'}</span>
              </div>
            </div>

            {/* List */}
            <div className="w-full flex flex-col gap-2.5">
              {leaderboard.map((entry, idx) => {
                let rankColor = "text-muted-foreground";
                if (entry.rank === 1) rankColor = "text-amber-500";
                else if (entry.rank === 2) rankColor = "text-slate-400";
                else if (entry.rank === 3) rankColor = "text-amber-700";

                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-4 px-6 rounded-2xl border transition-all ${
                      entry.is_current 
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500 shadow-sm' 
                        : 'bg-card border-border hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-8 font-black text-xl text-center ${rankColor}`}>
                        {entry.rank}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                          entry.is_current 
                            ? 'bg-emerald-500 text-slate-950 font-black' 
                            : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                        }`}>
                          {entry.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <span className={`text-lg font-bold truncate max-w-[150px] sm:max-w-xs ${entry.is_current ? 'text-emerald-500' : 'text-foreground'}`}>
                          {entry.username.split('@')[0]}
                          {entry.is_current && (
                            <span className="ml-3 text-xs bg-emerald-500/20 text-emerald-500 px-2.5 py-1 rounded-full uppercase tracking-wider font-extrabold border border-emerald-500/30 align-middle">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`font-extrabold ${entry.is_current ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      {entry.total_xp} <span className="text-sm font-semibold opacity-70">XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Status Card */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-6 sticky top-8">
              
              {/* User Profile Mini */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 text-xl font-black shadow-md">
                  {progress.username ? progress.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-extrabold text-foreground text-base truncate" title={progress.username}>
                    {progress.username.split('@')[0]}
                  </p>
                  <Link href="/profile" className="text-emerald-500 font-bold text-xs hover:underline">
                    VIEW PROFILE
                  </Link>
                </div>
              </div>

              <div className="h-px w-full bg-border" />

              {/* Status Picker */}
              <div>
                <p className="font-black text-foreground text-sm mb-4 uppercase tracking-wider">Set status</p>
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex items-center justify-center p-3 rounded-2xl border border-border hover:bg-muted transition-colors text-orange-500 cursor-pointer">
                    <Flame className="w-6 h-6" />
                  </button>
                  <button className="flex items-center justify-center p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 transition-colors text-amber-500 cursor-pointer">
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                  <button className="flex items-center justify-center p-3 rounded-2xl border border-border hover:bg-muted transition-colors text-blue-500 cursor-pointer">
                    <Zap className="w-6 h-6" />
                  </button>
                  <button className="flex items-center justify-center p-3 rounded-2xl border border-border hover:bg-muted transition-colors text-amber-700 cursor-pointer">
                    <Coffee className="w-6 h-6" />
                  </button>
                  <button className="flex items-center justify-center p-3 rounded-2xl border border-border hover:bg-muted transition-colors text-purple-500 cursor-pointer">
                    <Shield className="w-6 h-6" />
                  </button>
                  <button className="flex items-center justify-center p-3 rounded-2xl border border-border hover:bg-muted transition-colors text-emerald-500 cursor-pointer">
                    <Trophy className="w-6 h-6" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
