'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminStats from '@/components/admin/AdminStats';
import CsvImporter from '@/components/admin/CsvImporter';
import WordManager from '@/components/admin/WordManager';
import WordModal from '@/components/admin/WordModal';
import { DictionaryEntry } from '@/lib/types';
import { Shield, Sparkles, Database, BookOpen } from 'lucide-react';

export default function AdminPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [stats, setStats] = useState({
    totalWords: 0,
    arabicCount: 0,
    yazidiCount: 0,
    yazidiScriptCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await fetch('/api/dictionary/seed', { method: 'POST' });
      await loadData();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSaveWord = async (data: { arabicWord: string; yazidiWord: string; id?: string }) => {
    if (data.id) {
      // Edit existing
      const res = await fetch(`/api/dictionary/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } else {
      // Add new
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
    // Optimistically remove from state immediately
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

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              لوحة الإدارة & محرك CSV
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            إدارة قاعدة بيانات القاموس الأيزيدي
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            استيراد وتصدير ملفات CSV ثنائية الأعمدة وإدارة كلمات القاموس بكفاءة عالية.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <AdminStats stats={stats} onSeedData={handleSeedData} isSeeding={isSeeding} />

      {/* Smart CSV Importer */}
      <CsvImporter onSuccess={loadData} />

      {/* CRUD Manager */}
      <WordManager
        entries={entries}
        totalRecords={totalRecords}
        onAdd={() => {
          setEditingEntry(null);
          setIsModalOpen(true);
        }}
        onEdit={(entry) => {
          setEditingEntry(entry);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteWord}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={loadData}
      />

      {/* Add / Edit Modal Dialog */}
      <WordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWord}
        initialEntry={editingEntry}
      />

    </div>
  );
}
