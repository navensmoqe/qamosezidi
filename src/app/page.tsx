'use client';

import { useState, useEffect, useCallback } from 'react';
import HeroSearch from '@/components/HeroSearch';
import WordCard from '@/components/WordCard';
import WordTableView from '@/components/WordTableView';
import Pagination from '@/components/Pagination';
import { DictionaryEntry, SearchMode, ViewMode } from '@/lib/types';
import { BookOpen, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [totalMatched, setTotalMatched] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dictionary data from API
  const fetchEntries = useCallback(async (query: string, mode: SearchMode, page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(query)}&mode=${mode}&page=${page}&limit=12`);
      const data = await res.json();

      if (data.success) {
        setEntries(data.entries);
        setTotalMatched(data.total);
        setTotalPages(data.totalPages);

        // If dataset is totally empty (0 records), auto-seed sample vocabulary!
        if (data.stats?.totalWords === 0 && !query) {
          await fetch('/api/dictionary/seed', { method: 'POST' });
          // Re-fetch after seeding
          const reRes = await fetch(`/api/dictionary?q=&mode=all&page=1&limit=12`);
          const reData = await reRes.json();
          if (reData.success) {
            setEntries(reData.entries);
            setTotalMatched(reData.total);
            setTotalPages(reData.totalPages);
          }
        }
      } else {
        setError(data.error || 'فشل جلب المفردات القاموسية');
      }
    } catch (err) {
      setError('تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Live search effect with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries(searchQuery, searchMode, currentPage);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, searchMode, currentPage, fetchEntries]);

  // Reset to page 1 when search input or mode changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      
      {/* Hero & Search Header */}
      <HeroSearch
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        searchMode={searchMode}
        setSearchMode={handleModeChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalMatched={totalMatched}
      />

      {/* Main Results Section */}
      <section className="space-y-6">
        
        {/* Results Header Info */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {searchQuery ? 'نتائج البحث' : 'مستكشف القاموس الأيزيدي'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {totalMatched} مفردة
            </span>
          </div>

          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              type="button"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              إلغاء تصفية البحث
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-500">جاري البحث في المفردات الأيزيدية والعربية...</p>
          </div>
        ) : error ? (
          <div className="py-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3 text-red-600 dark:text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="font-bold text-sm">{error}</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty Search Results */
          <div className="py-16 p-8 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-2xl font-bold">
              𐺑
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">لم يتم العثور على كلمات مطابقة</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              جرب تغيير الكلمة في مربع البحث أو التبديل بين وضع البحث بالأيزيدية أو العربية.
            </p>
            <button
              onClick={() => handleSearchChange('')}
              type="button"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
            >
              عرض جميع المفردات
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((entry) => (
              <WordCard key={entry.id} entry={entry} searchQuery={searchQuery} />
            ))}
          </div>
        ) : (
          /* Table View */
          <WordTableView entries={entries} searchQuery={searchQuery} />
        )}

        {/* Pagination Controls */}
        {!isLoading && entries.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalMatched={totalMatched}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}

      </section>

    </div>
  );
}
