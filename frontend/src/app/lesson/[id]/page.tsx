"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLesson, getLearnerProgress, completeLesson, deductHeart, Lesson, LearnerProgress } from "@/lib/api";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isCompleting, setIsCompleting] = useState(false);

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

  const exercises = lesson.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length || 1;
  const progressPercent = (currentExerciseIndex / totalExercises) * 100;

  const handleCheck = async () => {
    if (!currentExercise || status !== 'idle') return;

    if (currentExercise.type !== 'multiple_choice' && currentExercise.type !== 'word_bank') {
      setStatus('correct');
      return;
    }

    let isCorrect = false;

    if (currentExercise.type === 'multiple_choice') {
      if (!selectedOption) return;
      isCorrect = (selectedOption === currentExercise.answer);
    } else if (currentExercise.type === 'word_bank') {
      if (selectedWordIndices.length === 0) return;
      const selectedStr = selectedWordIndices.map(i => currentExercise.options[i]).join(' ');
      const correctAnswer = Array.isArray(currentExercise.answer) 
        ? currentExercise.answer.join(' ') 
        : String(currentExercise.answer);
      isCorrect = (selectedStr.trim() === correctAnswer.trim());
    }

    if (isCorrect) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
      try {
        const res = await deductHeart();
        setProgress(prev => prev ? { ...prev, hearts: res.hearts } : null);
      } catch (err) {
        console.error("Failed to deduct heart:", err);
      }
    }
  };

  const handleNext = () => {
    if (progress && progress.hearts <= 0) {
      router.push("/");
      return;
    }
    setCurrentExerciseIndex(prev => prev + 1);
    setSelectedOption(null);
    setSelectedWordIndices([]);
    setStatus('idle');
  };

  const handleFinish = async () => {
    setIsCompleting(true);
    try {
      await completeLesson(lesson.id);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to complete lesson. Ensure it is unlocked.");
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-gray-800">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between px-4 md:px-8 max-w-4xl mx-auto mt-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-3xl font-bold p-2 cursor-pointer transition-colors">
            ✕
          </Link>
          
          <div className="h-4 flex-1 rounded-full bg-gray-200 overflow-hidden relative">
            <div 
              className="h-full bg-green-500 transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute top-1 left-2 h-1 rounded-full bg-white opacity-20 transition-all duration-300"
              style={{ width: `calc(${progressPercent}% - 16px)` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-6 font-bold text-red-500 text-xl">
          <span>❤️</span>
          <span>{progress.hearts}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl flex flex-col items-center">
          
          {currentExercise ? (
            currentExercise.type === 'multiple_choice' ? (
              <div className="w-full flex flex-col gap-6">
                <h2 className="text-2xl font-bold mb-4">{currentExercise.question}</h2>
                <div className="flex flex-col gap-3">
                  {(currentExercise.options as string[]).map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => status === 'idle' && setSelectedOption(opt)}
                      disabled={status !== 'idle'}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left font-bold text-lg transition-all
                        ${selectedOption === opt && status === 'idle' ? 'border-blue-400 bg-blue-50 text-blue-500' : ''}
                        ${selectedOption !== opt && status === 'idle' ? 'border-gray-200 hover:bg-gray-50' : ''}
                        ${selectedOption === opt && status === 'correct' ? 'border-green-500 bg-green-100 text-green-600' : ''}
                        ${selectedOption === opt && status === 'incorrect' ? 'border-red-500 bg-red-100 text-red-600' : ''}
                        ${selectedOption !== opt && status !== 'idle' ? 'border-gray-200 opacity-50' : ''}
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : currentExercise.type === 'word_bank' ? (
              <div className="w-full flex flex-col gap-8">
                <h2 className="text-2xl font-bold mb-4">{currentExercise.question}</h2>
                
                {/* Answer Area (Selected Words) */}
                <div className="flex flex-wrap gap-2 min-h-[60px] border-b-2 border-gray-300 pb-2">
                  {selectedWordIndices.map((idx, orderPos) => (
                    <button
                      key={`sel-${idx}-${orderPos}`}
                      onClick={() => status === 'idle' && setSelectedWordIndices(prev => prev.filter(i => i !== idx))}
                      disabled={status !== 'idle'}
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white font-bold text-lg hover:bg-gray-50 transition-colors"
                    >
                      {currentExercise.options[idx]}
                    </button>
                  ))}
                </div>

                {/* Available Words */}
                <div className="flex flex-wrap gap-2 justify-center mt-8">
                  {(currentExercise.options as string[]).map((word, idx) => {
                    const isSelected = selectedWordIndices.includes(idx);
                    return (
                      <button
                        key={`opt-${idx}`}
                        onClick={() => status === 'idle' && setSelectedWordIndices(prev => [...prev, idx])}
                        disabled={isSelected || status !== 'idle'}
                        className={`px-4 py-2 rounded-xl border-2 font-bold text-lg transition-colors
                          ${isSelected ? 'border-gray-200 bg-gray-200 text-gray-200 cursor-default' : 'border-gray-200 bg-white hover:bg-gray-50 active:translate-y-1'}
                        `}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 border-4 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center bg-gray-50 mb-8">
                <p className="text-gray-500 font-bold mb-2">Unsupported Exercise Type: {currentExercise.type}</p>
                <p className="text-gray-400">Click Check to skip.</p>
              </div>
            )
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-green-500">Lesson Complete!</h2>
              <p className="text-gray-500 mt-4">Click Finish to complete.</p>
            </div>
          )}

        </div>
      </main>

      {/* Bottom Footer Area */}
      <footer className={`border-t-2 p-4 transition-colors duration-300 ${status === 'correct' ? 'bg-green-100 border-green-200' : status === 'incorrect' ? 'bg-red-100 border-red-200' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center min-h-[80px]">
          <div className="flex-1">
            {status === 'correct' && (
              <div className="flex items-center gap-4 text-green-600">
                <div className="bg-white rounded-full p-2"><span className="text-2xl">✔️</span></div>
                <h2 className="text-2xl font-bold">Good job!</h2>
              </div>
            )}
            {status === 'incorrect' && (
              <div className="flex items-center gap-4 text-red-500">
                <div className="bg-white rounded-full p-2"><span className="text-2xl">❌</span></div>
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold">Incorrect</h2>
                  <p className="font-medium">Correct answer: {Array.isArray(currentExercise?.answer) ? currentExercise?.answer.join(' ') : String(currentExercise?.answer)}</p>
                </div>
              </div>
            )}
            {progress && progress.hearts <= 0 && status === 'incorrect' && (
               <p className="text-red-600 font-bold mt-1">Out of hearts! You must exit.</p>
            )}
          </div>

          <div className="flex gap-4">
            {!currentExercise ? (
              <button 
                className="px-10 py-3 font-bold text-white bg-green-500 border-b-4 border-green-600 rounded-2xl active:border-b-0 active:translate-y-1 hover:bg-green-400 transition-all disabled:opacity-50"
                onClick={handleFinish}
                disabled={isCompleting}
              >
                FINISH
              </button>
            ) : status === 'idle' ? (
              <button 
                className="px-10 py-3 font-bold text-white bg-green-500 border-b-4 border-green-600 rounded-2xl active:border-b-0 active:translate-y-1 hover:bg-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:border-b-4 disabled:active:translate-y-0"
                onClick={handleCheck}
                disabled={
                  (currentExercise?.type === 'multiple_choice' && !selectedOption) ||
                  (currentExercise?.type === 'word_bank' && selectedWordIndices.length === 0)
                }
              >
                CHECK
              </button>
            ) : (
              <button 
                className={`px-10 py-3 font-bold text-white border-b-4 rounded-2xl active:border-b-0 active:translate-y-1 transition-all
                  ${status === 'correct' ? 'bg-green-500 border-green-600 hover:bg-green-400' : 'bg-red-500 border-red-600 hover:bg-red-400'}
                `}
                onClick={handleNext}
              >
                CONTINUE
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
