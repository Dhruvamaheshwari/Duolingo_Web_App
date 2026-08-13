"use client";

import { useEffect, useState } from "react";
import { getLearningPath, getLearnerProgress, Course, LearnerProgress } from "@/lib/api";

export default function Home() {
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
      } catch (err) {
        console.error(err);
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
    <div className="flex min-h-screen flex-col bg-[#f7f9fa] font-sans text-gray-800">
      {/* Top Bar / Stats */}
      <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b-2 border-gray-200 bg-white px-4 md:px-8">
        <div className="text-2xl font-extrabold text-green-500">LingoClone</div>
        <div className="flex items-center gap-6 font-bold text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-orange-500">🔥</span>
            <span className={progress.current_streak > 0 ? "text-orange-500" : ""}>{progress.current_streak}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-500">⚡</span>
            <span>{progress.total_xp} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">💎</span>
            <span className="text-blue-400">500</span> {/* Mocked gems */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500">❤️</span>
            <span className="text-red-500">{progress.hearts}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center py-10 px-4">
        {course.units.map((unit) => (
          <div key={unit.id} className="mb-12 w-full">
            {/* Unit Header */}
            <div className="mb-8 rounded-2xl bg-green-500 p-6 text-white shadow-sm">
              <h2 className="text-2xl font-bold">Unit {unit.position}</h2>
              <p className="text-green-100">{unit.title} - {unit.description}</p>
            </div>

            {/* Skills / Path */}
            <div className="flex flex-col items-center gap-6">
              {unit.skills.map((skill, skillIndex) => {
                const offset = zigzagOffsets[skillIndex % zigzagOffsets.length];
                const isLocked = skill.state === 'locked';
                const isCompleted = skill.state === 'completed';
                const isAvailable = skill.state === 'available';
                
                let bgColor = "bg-gray-200";
                let borderColor = "border-gray-300";
                let textColor = "text-gray-400";
                
                if (isCompleted) {
                  bgColor = "bg-yellow-400";
                  borderColor = "border-yellow-500";
                  textColor = "text-white";
                } else if (isAvailable) {
                  bgColor = "bg-green-500";
                  borderColor = "border-green-600";
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
                      <div className="absolute -top-6 text-sm font-bold text-green-500">
                        {skill.progress}%
                      </div>
                    )}
                    <button
                      disabled={isLocked}
                      className={`relative flex h-20 w-20 items-center justify-center rounded-full border-b-8 ${bgColor} ${borderColor} transition-transform active:translate-y-1 active:border-b-0 disabled:active:translate-y-0 disabled:active:border-b-8`}
                    >
                      <span className={`text-2xl ${textColor}`}>
                        {isCompleted ? "⭐" : isLocked ? "🔒" : "📖"}
                      </span>
                    </button>
                    <span className="mt-4 text-center font-bold text-gray-500">
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
