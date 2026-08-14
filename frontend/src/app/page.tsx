"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  getLearningPath, 
  getLearnerProgress, 
  getLeaderboard,
  Course, 
  LearnerProgress, 
  LeaderboardEntry,
} from "@/lib/api";
import { 
  Flame, 
  Zap, 
  Heart, 
  Trophy, 
  Target, 
  Star, 
  Lock, 
  BookOpen, 
  Check, 
  Sparkles,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [courseData, progressData, lbData] = await Promise.all([
          getLearningPath(),
          getLearnerProgress(),
          getLeaderboard().catch(() => [])
        ]);
        setCourse(courseData);
        setProgress(progressData);
        setLeaderboard(lbData);
      } catch (err: any) {
        console.error("Home data load error:", err);
        router.push('/login');
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
          <span>Loading Learning Path...</span>
        </div>
      </div>
    );
  }

  if (!course || !progress) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-red-500 font-bold text-xl gap-4">
        <ShieldAlert className="w-12 h-12" />
        <span>Error loading learning path. Redirecting to login...</span>
        <button
          onClick={() => router.push('/login')}
          className="mt-2 text-sm text-emerald-500 underline font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const pathOffsets = [0, 45, 75, 45, 0, -45, -75, -45];
  const displayName = progress.username ? progress.username.split('@')[0] : 'Learner';
  const userRank = leaderboard.find(entry => entry.username === progress.username)?.rank || 1;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar username={progress.username} totalXp={progress.total_xp} />

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-black text-emerald-500 tracking-tight">
          DUOLINGO
        </Link>
        <div className="flex items-center gap-4 font-bold text-sm">
          <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20">
            <Flame className="w-4 h-4 fill-current" />
            <span>{progress.current_streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
            <Zap className="w-4 h-4 fill-current" />
            <span>{progress.total_xp}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
            <Heart className="w-4 h-4 fill-current" />
            <span>{progress.hearts}</span>
          </div>
        </div>
      </header>

      {/* Main Learning Path Container */}
      <main className="flex-1 md:ml-64 lg:mr-80 p-4 md:p-8 flex flex-col items-center max-w-2xl md:max-w-3xl mx-auto w-full pb-24 md:pb-12">
        {course.units.map((unit) => (
          <div key={unit.id} className="w-full mb-16">
            
            {/* Unit Header */}
            <div className="relative mb-12 rounded-3xl bg-emerald-500 border-b-8 border-emerald-600 p-6 md:p-8 text-white shadow-xl shadow-emerald-950/20">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-emerald-100 drop-shadow-sm">
                    Unit {unit.position}
                  </h2>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mt-1">
                    {unit.title}
                  </h3>
                </div>
                <div className="bg-emerald-600/60 backdrop-blur-sm border border-emerald-400/30 rounded-2xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Guidebook</span>
                </div>
              </div>
              <p className="text-emerald-50 font-semibold text-sm md:text-base mt-2 opacity-95">
                {unit.description}
              </p>
            </div>

            {/* Skill Path Nodes */}
            <div className="relative flex flex-col items-center gap-12 my-6">
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" strokeDasharray="6 6">
                {unit.skills.map((_, idx) => {
                  if (idx === unit.skills.length - 1) return null;
                  const currentOffset = pathOffsets[idx % pathOffsets.length];
                  const nextOffset = pathOffsets[(idx + 1) % pathOffsets.length];
                  
                  const y1 = idx * 128 + 40;
                  const y2 = (idx + 1) * 128 + 40;
                  
                  return (
                    <path
                      key={idx}
                      d={`M calc(50% + ${currentOffset}px) ${y1} C calc(50% + ${currentOffset}px) ${y1 + 60}, calc(50% + ${nextOffset}px) ${y2 - 60}, calc(50% + ${nextOffset}px) ${y2}`}
                      fill="none"
                      stroke="currentColor"
                      className="text-border"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {unit.skills.map((skill, skillIndex) => {
                const offset = pathOffsets[skillIndex % pathOffsets.length];
                const isLocked = skill.state === 'locked';
                const isCompleted = skill.state === 'completed';
                const isAvailable = skill.state === 'available';

                return (
                  <div
                    key={skill.id}
                    className="relative z-10 flex flex-col items-center group"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {isAvailable && (
                      <div className="absolute -top-12 z-20 animate-bounce">
                        <div className="bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-emerald-400 flex items-center gap-1">
                          <span>START</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div className="w-3 h-3 bg-emerald-500 rotate-45 mx-auto -mt-1.5 border-r-2 border-b-2 border-emerald-400"></div>
                      </div>
                    )}

                    <div className="relative">
                      {isAvailable && skill.progress > 0 && (
                        <svg className="absolute -inset-2 w-[92px] h-[92px] -rotate-90 pointer-events-none">
                          <circle cx="46" cy="46" r="41" fill="none" stroke="currentColor" className="text-border" strokeWidth="6" />
                          <circle
                            cx="46"
                            cy="46"
                            r="41"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 41}
                            strokeDashoffset={2 * Math.PI * 41 * (1 - skill.progress / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}

                      <button
                        disabled={isLocked || !skill.first_lesson_id}
                        onClick={() => {
                          if (skill.first_lesson_id) {
                            router.push(`/lesson/${skill.first_lesson_id}`);
                          }
                        }}
                        className={`
                          relative flex h-20 w-20 items-center justify-center rounded-full border-b-[6px] transition-all duration-150
                          ${isCompleted ? 'bg-amber-400 border-amber-600 text-amber-950 hover:bg-amber-300 shadow-lg shadow-amber-500/20 active:translate-y-1 active:border-b-0' : ''}
                          ${isAvailable ? 'bg-emerald-500 border-emerald-700 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/30 active:translate-y-1 active:border-b-0' : ''}
                          ${isLocked ? 'bg-muted border-border text-muted-foreground cursor-not-allowed shadow-none' : ''}
                        `}
                      >
                        <span className="flex items-center justify-center">
                          {isCompleted ? (
                            <Star className="w-9 h-9 fill-current stroke-[1.5]" />
                          ) : isLocked ? (
                            <Lock className="w-8 h-8 stroke-[2.5]" />
                          ) : (
                            <BookOpen className="w-9 h-9 fill-current stroke-[1.5]" />
                          )}
                        </span>
                      </button>
                    </div>

                    <div className="mt-3 text-center">
                      <span className={`font-black text-sm md:text-base tracking-wide ${isLocked ? 'text-muted-foreground' : isCompleted ? 'text-amber-500' : 'text-foreground'}`}>
                        {skill.title}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </main>

      {/* Right Sidebar */}
      <aside className="hidden lg:flex w-80 border-l border-border p-6 fixed right-0 top-0 bottom-0 flex-col gap-6 overflow-y-auto z-20 bg-card text-foreground transition-colors duration-200">
        
        {/* Top User Stats Bar */}
        <div className="flex items-center justify-between bg-muted border border-border rounded-2xl p-3 px-4 shadow-sm">
          <div className="flex items-center gap-2 text-orange-500 font-extrabold text-sm" title="Streak Days">
            <Flame className="w-5 h-5 fill-current" />
            <span>{progress.current_streak}</span>
          </div>

          <div className="flex items-center gap-2 text-amber-500 font-extrabold text-sm" title="Total XP">
            <Zap className="w-5 h-5 fill-current" />
            <span>{progress.total_xp}</span>
          </div>

          <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm" title="Hearts Left">
            <Heart className="w-5 h-5 fill-current" />
            <span>{progress.hearts}</span>
          </div>
        </div>

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

        {/* Leaderboard Preview Card */}
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
            <span>View All Rankings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Learner Card */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-md">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-foreground text-sm truncate">{displayName}</span>
            <span className="text-xs font-bold text-muted-foreground">Streak: {progress.current_streak} days</span>
          </div>
        </div>

      </aside>

    </div>
  );
}
