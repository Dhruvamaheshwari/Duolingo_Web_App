"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLearningPath, getLearnerProgress, Course, LearnerProgress } from "@/lib/api";
import { Flame, Zap, Heart, Trophy, Target, Star, Lock, BookOpen } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [courseData, progressData] = await Promise.all([
          getLearningPath(),
          getLearnerProgress()
        ]);
        setCourse(courseData);
        setProgress(progressData);
      } catch (err: any) {
        if (err.message === 'Not authenticated' || err.message.includes('401')) {
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
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-green-500">Loading...</div>;
  }

  if (!course || !progress) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-red-500">Error loading data.</div>;
  }

  // A simple array of offsets to create a zigzag effect for skills
  const zigzagOffsets = [0, 40, 80, 40, 0, -40, -80, -40];

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {/* Top Bar / Stats */}
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md pl-4 md:pl-8 pr-24 md:pr-28">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400 hover:opacity-80 transition-opacity">
          LingoClone
        </Link>
        <div className="flex items-center gap-6 font-semibold text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${progress.current_streak > 0 ? "text-orange-500" : "text-gray-400"}`} />
            <span className={progress.current_streak > 0 ? "text-orange-500" : ""}>{progress.current_streak}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-500">
            <Zap className="w-5 h-5" />
            <span>{progress.total_xp} XP</span>
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <Heart className="w-5 h-5" />
            <span>{progress.hearts}</span>
          </div>
          <Link href="/leaderboard" className="ml-2 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-2">
            <Trophy className="w-5 h-5" /> LEADERBOARD
          </Link>
          <Link href="/profile" className="ml-4 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold ring-2 ring-indigo-500/20">
              {progress.username ? progress.username.charAt(0).toUpperCase() : 'U'}
            </div>
            PROFILE
          </Link>
          <button onClick={async () => {
            const { logout } = await import('@/lib/api');
            await logout();
            router.push('/login');
          }} className="ml-4 hover:text-red-500 transition-colors flex items-center gap-2 font-bold text-gray-400">
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 px-4">
        
        {/* Daily XP Goal Widget */}
        {/* Daily XP Goal Widget */}
        <div className="w-full mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Daily Quest
            </h3>
            <span className="font-medium text-muted-foreground text-sm">
              {progress.daily_xp} / {progress.daily_goal} XP
            </span>
          </div>
          
          <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progress.daily_xp >= progress.daily_goal ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min((progress.daily_xp / progress.daily_goal) * 100, 100)}%` }}
            />
          </div>
          {progress.daily_xp >= progress.daily_goal && (
            <p className="mt-4 text-center font-medium text-green-600 dark:text-green-400 text-sm">You met your daily goal!</p>
          )}
        </div>

        {course.units.map((unit) => (
          <div key={unit.id} className="mb-12 w-full">
            {/* Unit Header */}
            {/* Unit Header */}
            <div className="mb-10 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-md">
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">Unit {unit.position}</h2>
              <p className="text-indigo-100 font-medium text-lg">{unit.title} <span className="opacity-75 px-2">•</span> {unit.description}</p>
            </div>

            {/* Skills / Path */}
            <div className="flex flex-col items-center gap-6">
              {unit.skills.map((skill, skillIndex) => {
                const offset = zigzagOffsets[skillIndex % zigzagOffsets.length];
                const isLocked = skill.state === 'locked';
                const isCompleted = skill.state === 'completed';
                const isAvailable = skill.state === 'available';
                
                let bgColor = "bg-gray-100 dark:bg-slate-800";
                let borderColor = "border-gray-200 dark:border-slate-700";
                let textColor = "text-gray-400 dark:text-gray-500";
                
                if (isCompleted) {
                  bgColor = "bg-amber-400 dark:bg-amber-500";
                  borderColor = "border-amber-500 dark:border-amber-600";
                  textColor = "text-amber-50";
                } else if (isAvailable) {
                  bgColor = "bg-indigo-500";
                  borderColor = "border-indigo-600";
                  textColor = "text-white";
                }

                return (
                  <div
                    key={skill.id}
                    className="relative flex flex-col items-center"
                    style={{ transform: `translateX(${offset}px)` }}
                  >
                    {/* Crown / Progress indicator if available or completed */}
                    {isAvailable && (
                      <div className="absolute -top-6 text-xs font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full ring-1 ring-indigo-200 dark:ring-indigo-800">
                        {skill.progress}%
                      </div>
                    )}
                    <button
                      disabled={isLocked || !skill.first_lesson_id}
                      onClick={() => {
                        if (skill.first_lesson_id) {
                          router.push(`/lesson/${skill.first_lesson_id}`);
                        }
                      }}
                      className={`relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-[6px] ${bgColor} ${borderColor} transition-all hover:brightness-110 active:translate-y-1.5 active:border-b-0 disabled:hover:brightness-100 disabled:active:translate-y-0 disabled:active:border-b-[6px] shadow-sm`}
                    >
                      <span className={`flex items-center justify-center ${textColor}`}>
                        {isCompleted ? <Star className="w-8 h-8 fill-current" /> : isLocked ? <Lock className="w-7 h-7" /> : <BookOpen className="w-7 h-7" />}
                      </span>
                    </button>
                    <span className="mt-4 text-center font-bold text-gray-500 dark:text-gray-400">
                      {skill.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
