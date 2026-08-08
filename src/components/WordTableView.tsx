'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { DictionaryEntry } from '@/lib/types';
import { containsYazidiScript } from '@/lib/csvHelper';

interface WordTableViewProps {
  entries: DictionaryEntry[];
  searchQuery?: string;
}

export default function WordTableView({ entries, searchQuery }: WordTableViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-sm">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-500 dark:text-slate-400">
            <th className="py-4 px-6">#</th>
            <th className="py-4 px-6">الكلمة العربية (Column 1)</th>
            <th className="py-4 px-6">التمثيل الأيزيدي (Column 2)</th>
            <th className="py-4 px-6">نوع الخط</th>
            <th className="py-4 px-6 text-center">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
          {entries.map((entry, index) => {
            const hasNativeScript = containsYazidiScript(entry.yazidiWord);
            return (
              <tr
                key={entry.id}
                className="hover:bg-amber-500/5 dark:hover:bg-slate-700/40 transition-colors"
              >
                <td className="py-4 px-6 font-semibold text-slate-400">{index + 1}</td>
                
                <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-lg">
                  {entry.arabicWord}
                </td>

                <td className="py-4 px-6 font-bold text-amber-600 dark:text-amber-400 text-lg font-yazidi">
                  {entry.yazidiWord}
                </td>

                <td className="py-4 px-6">
                  {hasNativeScript ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="w-3 h-3" />
                      خط أيزيدي أصلي
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      أبجدية صوتية
                    </span>
                  )}
                </td>

                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => handleCopy(`${entry.arabicWord} - ${entry.yazidiWord}`, entry.id)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-200 transition-all"
                    title="نسخ الكلمتين"
                    type="button"
                  >
                    {copiedId === entry.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
