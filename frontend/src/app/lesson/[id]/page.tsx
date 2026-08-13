"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getLesson, getLearnerProgress, Lesson, LearnerProgress } from "@/lib/api";

export default function LessonPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // For the UI shell, we mock some exercise progression
  const [currentExercise, setCurrentExercise] = useState(1);
  const totalExercises = 5; // Placeholder

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const [lessonData, progressData] = await Promise.all([
          getLesson(parseInt(id as string, 10)),
          getLearnerProgress()
        ]);
        setLesson(lessonData);
        setProgress(progressData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-green-500">Loading Lesson...</div>;
  }

  if (!lesson || !progress) {
    return <div className="flex h-screen items-center justify-center font-bold text-xl text-red-500">Error loading lesson.</div>;
  }

  const progressPercent = (currentExercise / totalExercises) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-gray-800">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between px-4 md:px-8 max-w-4xl mx-auto mt-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-3xl font-bold p-2 cursor-pointer transition-colors">
            ✕
          </Link>
          
          {/* Progress Bar */}
          <div className="h-4 flex-1 rounded-full bg-gray-200 overflow-hidden relative">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercent}%` }}
            />
            {/* Highlight inside progress bar for polish */}
            <div 
              className="absolute top-1 left-2 h-1 rounded-full bg-white opacity-20 transition-all duration-300"
              style={{ width: `calc(${progressPercent}% - 16px)` }}
            />
          </div>
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-2 ml-6 font-bold text-red-500 text-xl">
          <span>❤️</span>
          <span>{progress.hearts}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-8 text-center">{lesson.title}</h1>
          <p className="text-gray-500 font-bold mb-4">Exercise {currentExercise} of {totalExercises}</p>
          
          {/* Placeholder for the exercise */}
          <div className="w-full h-64 border-4 border-dashed border-gray-300 rounded-3xl flex items-center justify-center bg-gray-50 mb-8">
            <p className="text-gray-400 font-medium text-lg">Exercise content goes here...</p>
          </div>
        </div>
      </main>

      {/* Bottom Footer Area */}
      <footer className="border-t-2 border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center h-16">
          <button 
            className="px-6 py-3 font-bold text-gray-400 border-2 border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentExercise(prev => Math.max(1, prev - 1))}
            disabled={currentExercise === 1}
          >
            SKIP
          </button>
          <button 
            className="px-8 py-3 font-bold text-white bg-green-500 border-b-4 border-green-600 rounded-2xl active:border-b-0 active:translate-y-1 hover:bg-green-400 transition-all"
            onClick={() => setCurrentExercise(prev => Math.min(totalExercises, prev + 1))}
          >
            CHECK
          </button>
        </div>
      </footer>
    </div>
  );
}
