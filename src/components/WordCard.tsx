'use client';

import { useState } from 'react';
import { Copy, Check, Volume2, Sparkles } from 'lucide-react';
import { DictionaryEntry } from '@/lib/types';
import { containsYazidiScript } from '@/lib/csvHelper';

interface WordCardProps {
  entry: DictionaryEntry;
  searchQuery?: string;
}

export default function WordCard({ entry, searchQuery }: WordCardProps) {
  const [copiedType, setCopiedType] = useState<'arabic' | 'yazidi' | 'both' | null>(null);

  const hasNativeScript = containsYazidiScript(entry.yazidiWord);

  const handleCopy = (text: string, type: 'arabic' | 'yazidi' | 'both') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const highlightText = (text: string) => {
    if (!searchQuery?.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-400/30 text-amber-600 dark:text-amber-300 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="group relative rounded-2xl p-6 transition-all duration-300 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 flex flex-col justify-between">
      
      {/* Header Badges */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/50">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
          مدخل قاموسي
        </span>

        {hasNativeScript ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" />
            خط أيزيدي أصلي
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            أبجدية صوتية
          </span>
        )}
      </div>

      {/* 2-Column Content Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        
        {/* Column 1: Arabic Word */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>الكلمة العربية (Arabic)</span>
            <button
              onClick={() => handleCopy(entry.arabicWord, 'arabic')}
              className="text-slate-400 hover:text-amber-500 transition-colors"
              title="نسخ الكلمة العربية"
              type="button"
            >
              {copiedType === 'arabic' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {highlightText(entry.arabicWord)}
          </p>
        </div>

        {/* Column 2: Yazidi Word / Script */}
        <div className="p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <span>التمثيل الأيزيدي (Yazidi)</span>
            <button
              onClick={() => handleCopy(entry.yazidiWord, 'yazidi')}
              className="text-amber-500 hover:text-amber-600 transition-colors"
              title="نسخ الكلمة الأيزيدية"
              type="button"
            >
              {copiedType === 'yazidi' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 font-yazidi tracking-tight">
            {highlightText(entry.yazidiWord)}
          </p>
        </div>

      </div>

      {/* Footer Copy Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 text-xs">
        <span className="text-slate-400">ID: #{entry.id.substring(0, 8)}</span>

        <button
          onClick={() => handleCopy(`${entry.arabicWord} - ${entry.yazidiWord}`, 'both')}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200"
        >
          {copiedType === 'both' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">تم النسخ!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ المدخل الكامل</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
