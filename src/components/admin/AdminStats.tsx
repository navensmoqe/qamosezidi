'use client';

import { BookOpen, Sparkles, Database, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalWords: number;
    arabicCount: number;
    yazidiCount: number;
    yazidiScriptCount: number;
  };
  onSeedData: () => void;
  isSeeding: boolean;
}

export default function AdminStats({ stats, onSeedData, isSeeding }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Total Vocabulary */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">إجمالي الكلمات</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.totalWords}</h3>
          <p className="text-xs text-slate-400 mt-1">سجل ثنائي العمود</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
      </div>

      {/* Yazidi Script Count */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">كلمات بخط أيزيدي أصلي</p>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.yazidiScriptCount}</h3>
          <p className="text-xs text-slate-400 mt-1">ترميز UTF-8 الأيزيدي</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* Schema Status */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">هيكلية البيانات (Schema)</p>
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">عمودان (2-Cols)</h3>
          <p className="text-xs text-slate-400 mt-1">عربي / أيزيدي</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
          <Database className="w-6 h-6" />
        </div>
      </div>

      {/* Database Seeding Quick Trigger */}
      <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white border border-slate-700 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-400 mb-1">بيانات تجريبية</p>
          <button
            onClick={onSeedData}
            disabled={isSeeding}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'جاري البذر...' : 'بذر القاموس الأولي'}</span>
          </button>
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}
