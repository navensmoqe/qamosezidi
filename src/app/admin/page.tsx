'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminStats from '@/components/admin/AdminStats';
import CsvImporter from '@/components/admin/CsvImporter';
import WordManager from '@/components/admin/WordManager';
import WordModal from '@/components/admin/WordModal';
import PagesManager from '@/components/admin/PagesManager';
import PageModal from '@/components/admin/PageModal';
import SettingsManager from '@/components/admin/SettingsManager';
import { DictionaryEntry, PageItem } from '@/lib/types';
import { Shield, BookOpen, FileText, Settings, Sparkles } from 'lucide-react';

type AdminTab = 'words' | 'pages' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('words');

  // Dictionary state
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [stats, setStats] = useState({
    totalWords: 0,
    arabicCount: 0,
    yazidiCount: 0,
    yazidiScriptCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWordModalOpen, setIsWordModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);

  // Pages state
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isPageModalOpen, setIsPageModalOpen] = useState<boolean>(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load dictionary words
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(searchQuery)}&limit=100`);
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries);
        setTotalRecords(data.total);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Load pages
  const loadPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages');
      const data = await res.json();
      if (data.success) {
        setPages(data.pages);
      }
    } catch (err) {
      console.error('Error loading pages:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadPages();
  }, [loadData, loadPages]);

  // Word operations
  const handleSaveWord = async (data: { arabicWord: string; yazidiWord: string; id?: string }) => {
    if (data.id) {
      const res = await fetch(`/api/dictionary/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } else {
      const res = await fetch('/api/dictionary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    }
    await loadData();
  };

  const handleDeleteWord = async (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setTotalRecords((prev) => Math.max(0, prev - 1));
    setStats((prev) => ({
      ...prev,
      totalWords: Math.max(0, prev.totalWords - 1),
      arabicCount: Math.max(0, prev.arabicCount - 1),
      yazidiCount: Math.max(0, prev.yazidiCount - 1),
    }));

    try {
      const res = await fetch(`/api/dictionary/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } catch (err) {
      console.error('Error deleting word:', err);
    } finally {
      await loadData();
    }
  };

  // Page operations
  const handleSavePage = async (data: Partial<PageItem>) => {
    if (data.id) {
      const res = await fetch(`/api/pages/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } else {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    }
    await loadPages();
  };

  const handleDeletePage = async (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } catch (err) {
      console.error('Error deleting page:', err);
    } finally {
      await loadPages();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              لوحة الإدارة والتحكم الشاملة
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            إدارة المنصة والمعجم الأيزيدي
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة المفردات، والصفحات الثابتة، واستيراد ملفات CSV، وتخصيص الموقع بالكامل.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <button
            onClick={() => setActiveTab('words')}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'words'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المفردات والـ CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pages'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>إدارة الصفحات ({pages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات الموقع</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Words & CSV Manager */}
      {activeTab === 'words' && (
        <div className="space-y-8 animate-fade-in">
          <AdminStats stats={stats} />
          <CsvImporter onSuccess={loadData} />
          <WordManager
            entries={entries}
            totalRecords={totalRecords}
            onAdd={() => {
              setEditingEntry(null);
              setIsWordModalOpen(true);
            }}
            onEdit={(entry) => {
              setEditingEntry(entry);
              setIsWordModalOpen(true);
            }}
            onDelete={handleDeleteWord}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={loadData}
          />
        </div>
      )}

      {/* Tab 2: Pages CMS */}
      {activeTab === 'pages' && (
        <div className="animate-fade-in">
          <PagesManager
            pages={pages}
            onAdd={() => {
              setEditingPage(null);
              setIsPageModalOpen(true);
            }}
            onEdit={(page) => {
              setEditingPage(page);
              setIsPageModalOpen(true);
            }}
            onDelete={handleDeletePage}
            onRefresh={loadPages}
          />
        </div>
      )}

      {/* Tab 3: Site Settings */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in">
          <SettingsManager onRefresh={loadData} />
        </div>
      )}

      {/* Word Add / Edit Modal */}
      <WordModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        onSave={handleSaveWord}
        initialEntry={editingEntry}
      />

      {/* Page Add / Edit Modal */}
      <PageModal
        isOpen={isPageModalOpen}
        onClose={() => setIsPageModalOpen(false)}
        onSave={handleSavePage}
        initialPage={editingPage}
      />

    </div>
  );
}
