"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLearnerProgress, getLeaderboard, LearnerProgress, LeaderboardEntry } from "@/lib/api";
import { Zap, Flame, Book, Crown, Target, Users, Calendar, Heart, Trophy, ChevronRight, Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [progData, lbData] = await Promise.all([
          getLearnerProgress(),
          getLeaderboard().catch(() => [])
        ]);
        setProgress(progData);
        setLeaderboard(lbData);
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-red-500 font-bold text-xl">
        <span>Failed to load profile.</span>
      </div>
    );
  }

  const completedSkills = progress.skill_progress?.filter((s: Record<string, unknown>) => s.completed).length || 0;
  const completedLessons = progress.lesson_progress?.length || 0;
  const displayName = progress.username ? progress.username.split('@')[0] : 'Learner';
  const userRank = leaderboard.find(entry => entry.username === progress.username)?.rank || 1;
  const joinDate = "August 2026";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar username={progress.username} totalXp={progress.total_xp} />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto w-full pb-24 md:pb-12">
        <div className="w-full flex flex-col lg:flex-row gap-8 mt-2">
          
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Profile Header Card */}
            <div className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden">
              
              {/* Green Header Banner */}
              <div className="h-32 md:h-36 bg-gradient-to-r from-emerald-500 to-teal-600 w-full relative">
                <div className="absolute top-4 right-4 bg-emerald-600/50 backdrop-blur-md border border-emerald-400/30 px-3 py-1 rounded-xl text-xs font-black uppercase text-white tracking-wider">
                  Learner Profile
                </div>
              </div>
              
              {/* Lower Profile Info Area */}
              <div className="px-6 md:px-8 pb-8 pt-0 relative flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                
                <div className="flex flex-col items-start">
                  <div className="-mt-14 mb-3 relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500 border-4 border-card flex items-center justify-center font-black text-slate-950 text-4xl shadow-xl">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                    {displayName}
                  </h1>
                  <p className="text-sm font-bold text-muted-foreground mt-0.5">
                    @{displayName.toLowerCase()}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mt-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>Joined {joinDate}</span>
                  </div>
                </div>

                {/* Followers / Following Pill */}
                <div className="flex items-center gap-4 bg-muted border border-border rounded-2xl p-3 px-5 text-sm font-bold mt-2 md:mt-0">
                  <div className="flex items-center gap-2 text-foreground">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>0 Following</span>
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="text-foreground">
                    <span>0 Followers</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Statistics Section */}
            <div>
              <h2 className="text-lg font-black text-foreground mb-4 uppercase tracking-wider">
                Statistics
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    <Flame className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{progress.current_streak}</p>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Day Streak</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Zap className="w-7 h-7 fill-current" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{progress.total_xp}</p>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Total XP</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Crown className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{completedSkills}</p>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Skills Mastered</p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Book className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{completedLessons}</p>
                    <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider">Lessons Finished</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Learning Overview Card */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-lg flex flex-col gap-4">
              <h2 className="text-lg font-black text-foreground uppercase tracking-wider">
                Learning Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-muted border border-border flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase text-muted-foreground">Current Health</span>
                  <span className="text-lg font-black text-rose-500 flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-current" /> {progress.hearts} / 5 Hearts
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-muted border border-border flex flex-col gap-1">
                  <span className="text-xs font-extrabold uppercase text-muted-foreground">Daily Target</span>
                  <span className="text-lg font-black text-emerald-500 flex items-center gap-2">
                    <Target className="w-5 h-5" /> {progress.daily_xp} / {progress.daily_goal} XP
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar Column */}
          <div className="w-full lg:w-[320px] flex flex-col gap-6">
            
            {/* Daily Goal Card */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-black text-foreground text-base">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <span>Daily Goal</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-xl">
                  {progress.daily_xp} / {progress.daily_goal} XP
                </span>
              </div>

              <div className="h-3.5 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    progress.daily_xp >= progress.daily_goal ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min((progress.daily_xp / progress.daily_goal) * 100, 100)}%` }}
                />
              </div>

              {progress.daily_xp >= progress.daily_goal ? (
                <p className="text-xs font-bold text-emerald-500 text-center flex items-center justify-center gap-1">
                  <Check className="w-4 h-4 stroke-[3]" /> Goal Achieved today!
                </p>
              ) : (
                <p className="text-xs font-medium text-muted-foreground text-center">
                  Earn {Math.max(0, progress.daily_goal - progress.daily_xp)} more XP today!
                </p>
              )}
            </div>

            {/* Leaderboard Position Card */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-black text-foreground text-base">
                  <Trophy className="w-5 h-5 text-amber-500 fill-amber-500/20" />
                  <span>Leaderboard</span>
                </div>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                  Rank #{userRank}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                {leaderboard.slice(0, 3).map((entry) => {
                  const cleanName = entry.username.split('@')[0];
                  const isUser = entry.username === progress.username;

                  return (
                    <div 
                      key={entry.rank}
                      className={`flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-colors ${
                        isUser ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-500' : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-5 text-center font-black ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : 'text-amber-700'}`}>
                          {entry.rank}
                        </span>
                        <span className="truncate max-w-[110px]">{cleanName}</span>
                      </div>
                      <span className="text-muted-foreground font-extrabold">{entry.total_xp} XP</span>
                    </div>
                  );
                })}
              </div>

              <Link 
                href="/leaderboard"
                className="w-full py-2.5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-extrabold text-xs uppercase tracking-wider text-center transition-all border border-border flex items-center justify-center gap-1.5 group"
              >
                <span>View Full Standings</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-card border border-border rounded-3xl p-5 shadow-lg flex flex-col gap-3">
              <span className="font-extrabold text-foreground text-sm uppercase tracking-wider">
                Quick Actions
              </span>
              
              <Link
                href="/"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider text-center shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Book className="w-4 h-4 stroke-[3]" />
                <span>Continue Learning</span>
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
