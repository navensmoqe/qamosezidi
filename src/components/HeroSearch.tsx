'use client';

import { Search, X, Sparkles, LayoutGrid, List, Filter } from 'lucide-react';
import { SearchMode, ViewMode } from '@/lib/types';

interface HeroSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalMatched: number;
}

const COMMON_YAZIDI_GLYPHS = ['𐺑', '𐺦', '𐺍', '𐺨', '𐺀', '𐺁', '𐺢', '𐺝', '𐺡', '𐺑𐺦𐺍𐺨'];

export default function HeroSearch({
  searchQuery,
  setSearchQuery,
  searchMode,
  setSearchMode,
  viewMode,
  setViewMode,
  totalMatched,
}: HeroSearchProps) {
  const handleGlyphClick = (glyph: string) => {
    setSearchQuery(searchQuery + glyph);
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-12 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent">
      <div className="max-w-4xl mx-auto px-4 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>محرك بحث ثنائي اللغة فوري (عربي - 𐺑𐺦𐺍𐺨)</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          ابحث في <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 bg-clip-text text-transparent">القاموس الأيزيدي</span> بكل سهولة
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          استكشف آلاف المفردات بالأبجدية الأيزيدية الأصلية والترجمة العربية الدقيقة.
        </p>

        {/* Live Search Input Bar */}
        <div className="relative max-w-3xl mx-auto mb-6">
          <div className="relative flex items-center shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 focus-within:border-amber-500 dark:focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
            
            <div className="pe-4 ps-5 text-slate-400">
              <Search className="w-6 h-6 text-amber-500" />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchMode === 'arabic'
                  ? 'اكتب كلمة باللغة العربية (مثال: الرأس، الشمس، الله)...'
                  : searchMode === 'yazidi'
                  ? 'اكتب كلمة بالأيزيدية (مثال: سَرِ أو 𐺑𐺦𐺍𐺨)...'
                  : 'ابحث في العمودين باللغتين العربية والأيزيدية (مثال: الرأس أو 𐺑𐺦𐺍𐺨)...'
              }
              className="w-full py-4 text-base sm:text-lg bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              dir="auto"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors me-2"
                title="مسح البحث"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Mode Toggles & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-3xl mx-auto px-2">
          
          {/* Mode Toggles */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold px-2 text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              نطاق البحث:
            </span>

            <button
              onClick={() => setSearchMode('all')}
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                searchMode === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الكل
            </button>

            <button
              onClick={() => setSearchMode('arabic')}
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                searchMode === 'arabic'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              العربية فقط
            </button>

            <button
              onClick={() => setSearchMode('yazidi')}
              type="button"
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                searchMode === 'yazidi'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الأيزيدية فقط
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 me-auto sm:me-0">
            <button
              onClick={() => setViewMode('grid')}
              type="button"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="عرض الشبكة (بطاقات)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('table')}
              type="button"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Yazidi Glyph Quick Keyboard Shortcuts */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="me-1 font-medium">أحرف أيزيدية سريعة:</span>
          {COMMON_YAZIDI_GLYPHS.map((glyph, idx) => (
            <button
              key={idx}
              onClick={() => handleGlyphClick(glyph)}
              type="button"
              className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 dark:text-amber-400 font-bold hover:border-amber-500 hover:scale-110 transition-all"
            >
              {glyph}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
