'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Sparkles } from 'lucide-react';
import { DictionaryEntry } from '@/lib/types';
import { containsYazidiScript } from '@/lib/csvHelper';
import CsvExporter from './CsvExporter';

interface WordManagerProps {
  entries: DictionaryEntry[];
  totalRecords: number;
  onAdd: () => void;
  onEdit: (entry: DictionaryEntry) => void;
  onDelete: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
}

export default function WordManager({
  entries,
  totalRecords,
  onAdd,
  onEdit,
  onDelete,
  searchQuery,
  setSearchQuery,
}: WordManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت تأكد من رغبتك في حذف هذه الكلمة من القاموس؟')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة جدول المفردات (CRUD Manager)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            عرض وتعديل وحذف مفردات القاموس ثنائية العمود.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <CsvExporter searchQuery={searchQuery} totalRecords={totalRecords} />

          <button
            onClick={onAdd}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كلمة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="تصفية المفردات بالبحث في العربي أو الأيزيدي..."
          className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
            <tr>
              <th className="py-3.5 px-6">الكلمة العربية</th>
              <th className="py-3.5 px-6">التمثيل الأيزيدي</th>
              <th className="py-3.5 px-6">ترميز الخط</th>
              <th className="py-3.5 px-6 text-center">إجراءات الإدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400 text-xs">
                  لا توجد كلمات مطابقة للبحث حالياً.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const hasScript = containsYazidiScript(entry.yazidiWord);
                return (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{entry.arabicWord}</td>
                    <td className="py-4 px-6 font-bold text-amber-600 dark:text-amber-400 font-yazidi text-base">
                      {entry.yazidiWord}
                    </td>
                    <td className="py-4 px-6">
                      {hasScript ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Sparkles className="w-3 h-3" /> خط أصلي
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          صوتي
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(entry)}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-200 transition-colors"
                          title="تعديل"
                          type="button"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          disabled={deletingId === entry.id}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors disabled:opacity-50"
                          title="حذف"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
