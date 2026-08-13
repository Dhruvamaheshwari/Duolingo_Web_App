'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-bold text-sm"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4" /> Light
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" /> Dark
        </>
      )}
    </button>
  );
}
