"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLearnerProgress, LearnerProgress } from "@/lib/api";
import { Zap, Flame, Book, Crown, Target } from "lucide-react";

export default function ProfilePage() {
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getLearnerProgress();
        setProgress(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-green-500">Loading Profile...</div>;
  }

  if (!progress) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-red-500">Failed to load profile.</div>;
  }

  const completedSkills = progress.skill_progress?.filter((s: Record<string, unknown>) => s.completed).length || 0;
  const completedLessons = progress.lesson_progress?.length || 0;

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
            PROFILE
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 px-4">
        
        {/* Profile Card */}
        <div className="w-full mb-10 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
          <div className="mx-auto w-32 h-32 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-5xl font-bold mb-6 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
            {progress.username ? progress.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight">{progress.username || 'Learner'}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Joined recently</p>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex gap-4 items-center">
            <Zap className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{progress.total_xp}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total XP</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex gap-4 items-center">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{progress.current_streak}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Day Streak</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex gap-4 items-center">
            <Book className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{completedLessons}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lessons Finished</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex gap-4 items-center">
            <Crown className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{completedSkills}</p>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skills Mastered</p>
            </div>
          </div>
        </div>

        {/* Daily Goal Widget */}
        <div className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" /> Daily Goal
            </h3>
            <span className="font-medium text-gray-500 dark:text-gray-400 text-sm">
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
      </main>
    </div>
  );
}
