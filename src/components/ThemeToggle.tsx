'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('qamos_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('qamos_theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('qamos_theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium
        bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-300
        dark:bg-slate-800/80 dark:border-slate-700/80 dark:text-amber-400 dark:hover:bg-slate-700 dark:hover:border-slate-600 shadow-sm"
      title={darkMode ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
      aria-label="تغيير المظهر"
    >
      {darkMode ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="hidden md:inline">الوضع الفاتح</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600" />
          <span className="hidden md:inline">الوضع الداكن</span>
        </>
      )}
    </button>
  );
}
