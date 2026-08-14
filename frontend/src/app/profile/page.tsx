"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLearnerProgress, LearnerProgress } from "@/lib/api";
import { Zap, Flame, Book, Crown, Target, Users, MapPin, Calendar } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLearnerProgress();
        setProgress(data);
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
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-primary">Loading Profile...</div>;
  }

  if (!progress) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-red-500">Failed to load profile.</div>;
  }

  const completedSkills = progress.skill_progress?.filter((s: Record<string, unknown>) => s.completed).length || 0;
  const completedLessons = progress.lesson_progress?.length || 0;
  const joinDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // Mocked for UI, ideally from backend

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
            PROFILE
          </span>
          <button onClick={async () => {
            const { logout } = await import('@/lib/api');
            await logout();
            router.push('/login');
          }} className="ml-4 hover:text-red-500 transition-colors flex items-center gap-2 font-bold text-muted-foreground">
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center py-10 px-4">
        
        {/* Banner and Profile Card area */}
        <div className="w-full relative mb-12">
          {/* Cover Photo Area (Blank/Colored) */}
          <div className="w-full h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl relative"></div>
          
          <div className="w-full bg-card border-x border-b border-border rounded-b-3xl p-8 pt-0 shadow-sm relative">
            {/* Avatar positioned halfway over the banner */}
            <div className="absolute -top-16 left-8 p-1.5 bg-card rounded-full">
              <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-500 text-5xl font-bold border-4 border-card">
                {progress.username ? progress.username.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{progress.username ? progress.username.split('@')[0] : 'Learner'}</h1>
                <p className="text-muted-foreground font-medium text-lg">@{progress.username ? progress.username.split('@')[0].toLowerCase() : 'learner'}</p>
                
                <div className="flex gap-6 mt-4 text-sm font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {joinDate}
                  </div>
                </div>

                <div className="flex gap-6 mt-4 text-sm font-bold text-foreground">
                  <div>
                    <span className="text-indigo-500">12</span> Following
                  </div>
                  <div>
                    <span className="text-indigo-500">8</span> Followers
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-2xl border border-border font-bold text-muted-foreground">
                <span className="text-xl">🇪🇸</span> Spanish
              </div>
            </div>
          </div>
        </div>

        {/* Stats and Layout split */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Stats */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground tracking-tight">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span className="font-bold text-foreground text-lg">{progress.current_streak}</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Day Streak</p>
                </div>
                
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-blue-500" />
                    <span className="font-bold text-foreground text-lg">{progress.total_xp}</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Total XP</p>
                </div>
                
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Book className="w-6 h-6 text-emerald-500" />
                    <span className="font-bold text-foreground text-lg">{completedLessons}</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Lessons</p>
                </div>
                
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-500" />
                    <span className="font-bold text-foreground text-lg">{completedSkills}</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Skills Mastered</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quests/Goals */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground tracking-tight">Daily Quest</h2>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center bg-muted">
                    <Target className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Earn {progress.daily_goal} XP</h3>
                    <div className="h-3 w-full bg-muted rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${progress.daily_xp >= progress.daily_goal ? 'bg-primary' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((progress.daily_xp / progress.daily_goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-muted-foreground text-right">
                  {progress.daily_xp} / {progress.daily_goal} XP
                </div>
              </div>
            </div>
            
            {/* Find Friends Placeholder */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-foreground tracking-tight">Friends</h2>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center text-center gap-4">
                <Users className="w-12 h-12 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-medium">Learning is more fun with friends!</p>
                <button className="w-full py-3 rounded-2xl font-bold text-indigo-500 text-lg border-2 border-border hover:bg-muted transition-colors uppercase tracking-wide">
                  Find Friends
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
