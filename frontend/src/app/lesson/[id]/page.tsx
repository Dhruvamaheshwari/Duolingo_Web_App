"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLesson, getLearnerProgress, completeLesson, deductHeart, refillHearts, Lesson, LearnerProgress } from "@/lib/api";
import { Heart, Trophy, CheckCircle2, XCircle, X } from "lucide-react";

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
  const [shuffledTiles, setShuffledTiles] = useState<string[]>([]);
  const [matchedTiles, setMatchedTiles] = useState<string[]>([]);
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionData, setCompletionData] = useState<{ xp_earned?: number; new_total_xp?: number; new_streak?: number } | null>(null);

  const [showOutModal, setShowOutModal] = useState(false);
  const [isRefilling, setIsRefilling] = useState(false);

  useEffect(() => {
    const currentExercise = lesson?.exercises?.[currentExerciseIndex];
    if (currentExercise && currentExercise.type === 'match_pairs') {
      const answerObj = currentExercise.answer as Record<string, string>;
      const allWords = [...Object.keys(answerObj), ...Object.values(answerObj)];
      // eslint-disable-next-line
      setShuffledTiles(allWords.sort(() => Math.random() - 0.5));
      setMatchedTiles([]);
      setSelectedTile(null);
      setWrongPair([]);
    }
  }, [lesson, currentExerciseIndex]);

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
  const progressPercent = completionData ? 100 : (currentExerciseIndex / totalExercises) * 100;

  const handleCheck = async () => {
    if (!currentExercise || status !== 'idle') return;

    if (currentExercise.type !== 'multiple_choice' && currentExercise.type !== 'word_bank' && currentExercise.type !== 'fill_blank' && currentExercise.type !== 'type_answer') {
      setStatus('correct');
      return;
    }

    let isCorrect = false;

    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') {
      if (!selectedOption) return;
      isCorrect = (selectedOption === currentExercise.answer);
    } else if (currentExercise.type === 'type_answer') {
      if (!selectedOption || selectedOption.trim() === '') return;
      const userInput = selectedOption.trim().toLowerCase();
      const correctAnswer = String(currentExercise.answer).trim().toLowerCase();
      isCorrect = (userInput === correctAnswer);
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
    if (progress && progress.hearts <= 0 && status === 'incorrect') {
      setShowOutModal(true);
      return;
    }
    
    if (status === 'incorrect' && currentExercise?.type === 'match_pairs') {
      setStatus('idle');
      setSelectedTile(null);
      setWrongPair([]);
      return;
    }

    setCurrentExerciseIndex(prev => prev + 1);
    setSelectedOption(null);
    setSelectedWordIndices([]);
    setStatus('idle');
  };

  const handleTileClick = async (word: string) => {
    if (status !== 'idle') return;
    if (matchedTiles.includes(word)) return;

    if (!selectedTile) {
      setSelectedTile(word);
      return;
    }

    if (selectedTile === word) {
      setSelectedTile(null);
      return;
    }

    const answerObj = currentExercise.answer as Record<string, string>;
    const isPair = answerObj[selectedTile] === word || answerObj[word] === selectedTile;

    if (isPair) {
      const newMatched = [...matchedTiles, selectedTile, word];
      setMatchedTiles(newMatched);
      setSelectedTile(null);
      
      if (newMatched.length === Object.keys(answerObj).length * 2) {
        setStatus('correct');
      }
    } else {
      setWrongPair([selectedTile, word]);
      setStatus('incorrect');
      try {
        const res = await deductHeart();
        setProgress(prev => prev ? { ...prev, hearts: res.hearts } : null);
      } catch (err) {
        console.error("Failed to deduct heart:", err);
      }
    }
  };

  const handleRefill = async () => {
    setIsRefilling(true);
    try {
      const res = await refillHearts();
      setProgress(prev => prev ? { ...prev, hearts: res.hearts } : null);
      setShowOutModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to refill hearts.");
    } finally {
      setIsRefilling(false);
    }
  };

  const handleFinish = async () => {
    if (completionData) {
      router.push("/");
      return;
    }
    setIsCompleting(true);
    try {
      const res = await completeLesson(lesson.id);
      setCompletionData(res);
    } catch (err) {
      console.error(err);
      alert("Failed to complete lesson. Ensure it is unlocked or not already completed.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900 font-sans text-gray-800 dark:text-gray-100">
      {showOutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 text-center flex flex-col items-center shadow-xl border border-gray-200 dark:border-slate-800">
            <Heart className="w-16 h-16 mb-6 text-red-500 fill-current opacity-80" />
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 mb-4 tracking-tight">Out of Hearts!</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">You made too many mistakes. Refill your hearts to continue learning.</p>
            
            <button
              onClick={handleRefill}
              disabled={isRefilling}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg bg-blue-500 border-b-4 border-blue-600 active:border-b-0 active:translate-y-1 hover:bg-blue-400 transition-all mb-4 disabled:opacity-50"
            >
              {isRefilling ? "REFILLING..." : "REFILL HEARTS"}
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-2xl font-bold text-red-500 text-lg border-2 border-gray-200 dark:border-slate-700 active:bg-gray-50 transition-all"
            >
              END LESSON
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between px-4 md:px-8 max-w-4xl mx-auto mt-4">
        <div className="flex items-center gap-4 flex-1">
          <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 cursor-pointer transition-colors">
            <X className="w-6 h-6" />
          </Link>
          
          <div className="h-3 flex-1 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden relative">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-6 font-bold text-red-500 text-xl">
          <Heart className="w-5 h-5 fill-current" />
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
                        w-full p-4 rounded-2xl border-2 border-b-4 text-left font-bold text-lg transition-all active:border-b-0 active:translate-y-1
                        ${selectedOption === opt && status === 'idle' ? 'border-blue-400 bg-blue-50 text-blue-500' : ''}
                        ${selectedOption !== opt && status === 'idle' ? 'border-gray-200 dark:border-slate-700 hover:bg-gray-50' : ''}
                        ${selectedOption === opt && status === 'correct' ? 'border-green-500 bg-green-100 text-green-600' : ''}
                        ${selectedOption === opt && status === 'incorrect' ? 'border-red-500 bg-red-100 text-red-600' : ''}
                        ${selectedOption !== opt && status !== 'idle' ? 'border-gray-200 dark:border-slate-700 opacity-50' : ''}
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
                      className="px-4 py-2 rounded-2xl border-2 border-b-4 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-lg hover:bg-gray-50 transition-all active:border-b-0 active:translate-y-1"
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
                        className={`px-4 py-2 rounded-2xl border-2 border-b-4 font-bold text-lg transition-all
                          ${isSelected ? 'border-gray-200 dark:border-slate-700 bg-gray-200 dark:bg-slate-700 text-gray-200 cursor-default border-b-2 translate-y-[2px]' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 active:translate-y-1 active:border-b-0'}
                        `}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : currentExercise.type === 'match_pairs' ? (
              <div className="w-full flex flex-col gap-8">
                <h2 className="text-2xl font-bold mb-4">{currentExercise.question || "Match the pairs"}</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  {shuffledTiles.map((word, idx) => {
                    const isMatched = matchedTiles.includes(word);
                    const isSelected = selectedTile === word;
                    const isWrong = wrongPair.includes(word);
                    
                    return (
                      <button
                        key={`mp-${idx}`}
                        onClick={() => handleTileClick(word)}
                        disabled={isMatched || status !== 'idle'}
                        className={`
                          p-4 rounded-2xl border-2 border-b-4 font-bold text-lg transition-all
                          ${isMatched ? 'border-gray-200 dark:border-slate-700 bg-gray-100 text-gray-300 opacity-50 cursor-default border-b-2 translate-y-[2px]' : ''}
                          ${isSelected && status === 'idle' ? 'border-blue-400 bg-blue-50 text-blue-500' : ''}
                          ${isWrong && status === 'incorrect' ? 'border-red-500 bg-red-50 text-red-600' : ''}
                          ${!isMatched && !isSelected && !isWrong ? 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-gray-50 active:border-b-0 active:translate-y-1' : ''}
                        `}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : currentExercise.type === 'fill_blank' ? (
              <div className="w-full flex flex-col gap-6 items-center">
                <h2 className="text-2xl font-bold mb-8 text-center leading-loose">
                  {currentExercise.question.split('___').map((part: string, i: number, arr: string[]) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className={`inline-block min-w-[100px] border-b-4 border-gray-300 mx-2 pb-1 text-center ${selectedOption ? 'text-blue-500 border-blue-400' : ''}`}>
                          {selectedOption || ''}
                        </span>
                      )}
                    </span>
                  ))}
                </h2>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  {(currentExercise.options as string[]).map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => status === 'idle' && setSelectedOption(opt)}
                      disabled={status !== 'idle'}
                      className={`
                        px-6 py-3 rounded-2xl border-2 border-b-4 font-bold text-lg transition-all active:border-b-0 active:translate-y-1
                        ${selectedOption === opt && status === 'idle' ? 'border-blue-400 bg-blue-50 text-blue-500' : ''}
                        ${selectedOption !== opt && status === 'idle' ? 'border-gray-200 dark:border-slate-700 hover:bg-gray-50' : ''}
                        ${selectedOption === opt && status === 'correct' ? 'border-green-500 bg-green-100 text-green-600' : ''}
                        ${selectedOption === opt && status === 'incorrect' ? 'border-red-500 bg-red-100 text-red-600' : ''}
                        ${selectedOption !== opt && status !== 'idle' ? 'border-gray-200 dark:border-slate-700 opacity-50' : ''}
                      `}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ) : currentExercise.type === 'type_answer' ? (
              <div className="w-full flex flex-col gap-6 items-center">
                <h2 className="text-2xl font-bold mb-8 text-center leading-loose">
                  {currentExercise.question}
                </h2>
                
                <div className="w-full max-w-lg">
                  <textarea
                    autoFocus
                    value={selectedOption || ''}
                    onChange={(e) => status === 'idle' && setSelectedOption(e.target.value)}
                    disabled={status !== 'idle'}
                    placeholder="Type your answer here..."
                    className={`
                      w-full p-4 rounded-2xl border-2 font-bold text-lg resize-none min-h-[120px] focus:outline-none transition-all
                      ${status === 'idle' ? 'border-gray-300 focus:border-blue-400 focus:bg-blue-50 bg-gray-50 text-blue-500' : ''}
                      ${status === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : ''}
                      ${status === 'incorrect' ? 'border-red-500 bg-red-50 text-red-700' : ''}
                    `}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-64 border-4 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center bg-gray-50 mb-8">
                <p className="text-gray-500 dark:text-gray-400 font-bold mb-2">Unsupported Exercise Type: {currentExercise.type}</p>
                <p className="text-gray-400">Click Check to skip.</p>
              </div>
            )
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in text-center mt-12">
              {completionData ? (
                <>
                  <div className="bg-amber-100 dark:bg-amber-900/30 p-8 rounded-full flex items-center justify-center mb-8">
                    <Trophy className="w-16 h-16 text-amber-500" />
                  </div>
                  <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-6 tracking-tight">Lesson Complete!</h2>
                  
                  <div className="flex gap-6 mb-12 w-full max-w-md">
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Total XP</span>
                      <span className="text-3xl font-extrabold text-blue-500">{completionData.new_total_xp}</span>
                      <span className="text-sm font-semibold text-green-500 dark:text-green-400 mt-1">+{completionData.xp_earned} Earned</span>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm rounded-2xl p-6 flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Streak</span>
                      <span className="text-3xl font-extrabold text-orange-500">{completionData.new_streak}</span>
                      <span className="text-sm font-semibold text-gray-400 mt-1">Days</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-green-500">You did it!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Click Finish to complete your lesson and claim your XP.</p>
                </>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Bottom Footer Area */}
      <footer className={`border-t p-4 transition-colors duration-300 ${status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : status === 'incorrect' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'}`}>
        <div className="max-w-4xl mx-auto flex justify-between items-center min-h-[80px]">
          {completionData ? (
            <button 
              className="w-full px-10 py-4 font-bold text-white bg-blue-500 border-b-4 border-blue-600 rounded-2xl active:border-b-0 active:translate-y-1 hover:bg-blue-400 transition-all text-xl disabled:opacity-50"
              onClick={handleFinish}
            >
              RETURN TO PATH
            </button>
          ) : (
            <>
              <div className="flex-1">
                {status === 'correct' && (
                  <div className="flex items-center gap-4 text-emerald-600 dark:text-emerald-400">
                    <div className="bg-white dark:bg-slate-900 rounded-full p-2"><CheckCircle2 className="w-8 h-8" /></div>
                    <h2 className="text-2xl font-bold tracking-tight">Good job!</h2>
                  </div>
                )}
                {status === 'incorrect' && (
                  <div className="flex items-center gap-4 text-red-500">
                    <div className="bg-white dark:bg-slate-900 rounded-full p-2"><XCircle className="w-8 h-8" /></div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold">Incorrect</h2>
                      <p className="font-medium">
                        {currentExercise?.type === 'match_pairs' 
                          ? 'That pair does not match.' 
                          : `Correct answer: ${Array.isArray(currentExercise?.answer) ? currentExercise?.answer.join(' ') : String(currentExercise?.answer)}`
                        }
                      </p>
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
                    className="px-10 py-3 font-bold text-white bg-indigo-500 border-b-4 border-indigo-600 rounded-2xl active:border-b-0 active:translate-y-1 hover:bg-indigo-400 transition-all disabled:opacity-50"
                    onClick={handleFinish}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'SAVING...' : 'FINISH'}
                  </button>
                ) : status === 'idle' ? (
                  <button 
                    className="px-10 py-3 font-bold text-white bg-indigo-500 border-b-4 border-indigo-600 rounded-2xl active:border-b-0 active:translate-y-1 hover:bg-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:border-b-4 disabled:active:translate-y-0"
                    onClick={handleCheck}
                    disabled={
                      ((currentExercise?.type === 'multiple_choice' || currentExercise?.type === 'fill_blank' || currentExercise?.type === 'type_answer') && (!selectedOption || selectedOption.trim() === '')) ||
                      (currentExercise?.type === 'word_bank' && selectedWordIndices.length === 0) ||
                      (currentExercise?.type === 'match_pairs')
                    }
                  >
                CHECK
              </button>
            ) : (
              <button 
                className={`px-10 py-3 font-bold text-white border-b-4 rounded-2xl active:border-b-0 active:translate-y-1 transition-all
                  ${status === 'correct' ? 'bg-emerald-500 border-emerald-600 hover:bg-emerald-400' : 'bg-red-500 border-red-600 hover:bg-red-400'}
                `}
                onClick={handleNext}
              >
                CONTINUE
              </button>
            )}
          </div>
          </>
          )}
        </div>
      </footer>
    </div>
  );
}
