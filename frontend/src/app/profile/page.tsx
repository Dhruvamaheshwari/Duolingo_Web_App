"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLearnerProgress, LearnerProgress } from "@/lib/api";

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

  const completedSkills = progress.skill_progress?.filter((s: any) => s.completed).length || 0;
  const completedLessons = progress.lesson_progress?.length || 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fa] font-sans text-gray-800">
      {/* Top Header */}
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b-2 border-gray-200 bg-white px-4 md:px-8">
        <Link href="/" className="text-2xl font-extrabold text-green-500 hover:text-green-400 transition-colors">
          LingoClone
        </Link>
        <div className="flex items-center gap-6 font-bold text-gray-500">
          <Link href="/" className="hover:text-gray-700 transition-colors">LEARN</Link>
          <span className="text-gray-800 border-b-2 border-gray-800 pb-1">PROFILE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 px-4">
        
        {/* Profile Card */}
        <div className="w-full mb-10 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto w-32 h-32 bg-purple-500 rounded-full flex items-center justify-center text-white text-5xl font-bold mb-6">
            {progress.username ? progress.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">{progress.username || 'Learner'}</h1>
          <p className="text-gray-500 font-bold mt-2">Joined recently</p>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm flex gap-4 items-center">
            <span className="text-4xl">⚡</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">{progress.total_xp}</p>
              <p className="text-sm font-bold text-gray-500 uppercase">Total XP</p>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm flex gap-4 items-center">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">{progress.current_streak}</p>
              <p className="text-sm font-bold text-gray-500 uppercase">Day Streak</p>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm flex gap-4 items-center">
            <span className="text-4xl">📚</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedLessons}</p>
              <p className="text-sm font-bold text-gray-500 uppercase">Lessons Finished</p>
            </div>
          </div>
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm flex gap-4 items-center">
            <span className="text-4xl">👑</span>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedSkills}</p>
              <p className="text-sm font-bold text-gray-500 uppercase">Skills Mastered</p>
            </div>
          </div>
        </div>

        {/* Daily Goal Widget */}
        <div className="w-full rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 text-xl flex items-center gap-2">
              <span className="text-2xl">🎯</span> Daily Goal
            </h3>
            <span className="font-bold text-gray-500">
              {progress.daily_xp} / {progress.daily_goal} XP
            </span>
          </div>
          
          <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progress.daily_xp >= progress.daily_goal ? 'bg-green-500' : 'bg-yellow-400'}`}
              style={{ width: `${Math.min((progress.daily_xp / progress.daily_goal) * 100, 100)}%` }}
            />
          </div>
          {progress.daily_xp >= progress.daily_goal && (
            <p className="mt-4 text-center font-bold text-green-500 animate-pulse">You met your daily goal!</p>
          )}
        </div>
      </main>
    </div>
  );
}
