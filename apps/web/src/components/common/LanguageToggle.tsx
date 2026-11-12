'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'compact' | 'expanded';
}

export function LanguageToggle({ className = '', variant = 'compact' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-0.5 text-xs font-semibold backdrop-blur-md shadow-sm ${className}`}
      title="Switch Language / Ganti Bahasa"
    >
      <div className="flex items-center pl-2 pr-1 text-slate-500 dark:text-slate-400">
        <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
          language === 'en'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('id')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
          language === 'id'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
        }`}
      >
        ID
      </button>
    </div>
  );
}
