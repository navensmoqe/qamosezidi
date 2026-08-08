'use client';

import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Sparkles, CheckSquare, Square, MinusSquare, AlertOctagon, Check } from 'lucide-react';
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
  onRefresh,
}: WordManagerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  // Single delete
  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذه الكلمة من القاموس؟')) {
      setDeletingId(id);
      try {
        await onDelete(id);
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all visible
  const isAllSelected = entries.length > 0 && entries.every((e) => selectedIds.has(e.id));
  const isSomeSelected = entries.some((e) => selectedIds.has(e.id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(entries.map((e) => e.id));
      setSelectedIds(allIds);
    }
  };

  // Bulk delete selected
  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length === 0) return;

    if (
      confirm(
        `هل أنت متأكد من رغبتك في حذف ${idsToDelete.length} كلمة محددة نهائياً من قاعدة البيانات؟`
      )
    ) {
      setIsBulkDeleting(true);
      setBulkMessage(null);
      try {
        const res = await fetch('/api/dictionary/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: idsToDelete }),
        });
        const data = await res.json();
        if (data.success) {
          setSelectedIds(new Set());
          setBulkMessage(`تم حذف ${idsToDelete.length} كلمة محددة بنجاح!`);
          setTimeout(() => setBulkMessage(null), 3000);
          onRefresh();
        } else {
          alert(data.error || 'فشل حذف الكلمات المحددة');
        }
      } catch (err) {
        alert('حدث خطأ أثناء الاتصال بالسيرفر');
      } finally {
        setIsBulkDeleting(false);
      }
    }
  };

  // Clear entire dictionary
  const handleClearAll = async () => {
    if (
      confirm(
        '⚠️ تحذير شديد: هل أنت متأكد من رغبتك في تفريغ وحذف جميع كلمات القاموس بالكامل؟ هذا الإجراء لا يمكن التراجع عنه!'
      )
    ) {
      setIsBulkDeleting(true);
      try {
        const res = await fetch('/api/dictionary/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ all: true }),
        });
        const data = await res.json();
        if (data.success) {
          setSelectedIds(new Set());
          setBulkMessage('تم تفريغ وحذف جميع كلمات القاموس بنجاح');
          setTimeout(() => setBulkMessage(null), 3000);
          onRefresh();
        }
      } finally {
        setIsBulkDeleting(false);
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
            عرض وتحديد وتعديل وحذف مفردات القاموس ثنائية العمود.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
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
      <div className="relative mb-4">
        <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="تصفية المفردات بالبحث في العربي أو الأيزيدي..."
          className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Bulk Action Controls Bar (Active when items are selected) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 mb-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
        
        {/* Selection Count Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            type="button"
            className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-amber-500" />
            ) : isSomeSelected ? (
              <MinusSquare className="w-4 h-4 text-amber-500" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{isAllSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل (Select All)'}</span>
          </button>

          {selectedIds.size > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              تم تحديد {selectedIds.size} كلمة
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBulkDeleting ? 'جاري الحذف...' : `حذف المحدد (${selectedIds.size})`}</span>
              </button>

              <button
                onClick={() => setSelectedIds(new Set())}
                type="button"
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs transition-colors"
              >
                إلغاء التحديد
              </button>
            </>
          )}

          {totalRecords > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isBulkDeleting}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 font-bold text-xs transition-all disabled:opacity-50 me-0"
              title="تفريغ وحذف جميع كلمات القاموس"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>تفريغ القاموس بالكامل</span>
            </button>
          )}
        </div>

      </div>

      {/* Success Notification */}
      {bulkMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{bulkMessage}</span>
        </div>
      )}

      {/* Data Table with Checkboxes */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">
                <button
                  onClick={toggleSelectAll}
                  type="button"
                  className="text-slate-400 hover:text-amber-500 transition-colors"
                  title="تحديد الكل"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                  ) : isSomeSelected ? (
                    <MinusSquare className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3.5 px-6">الكلمة العربية</th>
              <th className="py-3.5 px-6">التمثيل الأيزيدي</th>
              <th className="py-3.5 px-6">ترميز الخط</th>
              <th className="py-3.5 px-6 text-center">إجراءات الإدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                  لا توجد كلمات مطابقة للبحث حالياً.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isSelected = selectedIds.has(entry.id);
                const hasScript = containsYazidiScript(entry.yazidiWord);

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/15'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleSelect(entry.id)}
                        type="button"
                        className="text-slate-400 hover:text-amber-500 transition-colors"
                        title={isSelected ? 'إلغاء التحديد' : 'تحديد'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {entry.arabicWord}
                    </td>

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
