'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Globe, Eye, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { PageItem } from '@/lib/types';

interface PagesManagerProps {
  pages: PageItem[];
  onAdd: () => void;
  onEdit: (page: PageItem) => void;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export default function PagesManager({
  pages,
  onAdd,
  onEdit,
  onDelete,
  onRefresh,
}: PagesManagerProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف صفحة "${title}" نهائياً؟`)) {
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <span>إدارة الصفحات والمحتوى (Pages CMS)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إضافة وتعديل صفحات الموقع الثابتة والتعريفية (مثل: عن القاموس، الأبجدية، الدليل).
          </p>
        </div>

        <button
          onClick={onAdd}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء صفحة جديدة</span>
        </button>
      </div>

      {/* Pages Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500">
            <tr>
              <th className="py-3.5 px-6">عنوان الصفحة</th>
              <th className="py-3.5 px-6">رابط الصفحة (Slug)</th>
              <th className="py-3.5 px-6 text-center">حالة النشر</th>
              <th className="py-3.5 px-6 text-center">في القائمة</th>
              <th className="py-3.5 px-6 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                  لا توجد صفحات مضافة حالياً. اضغط على "إنشاء صفحة جديدة" للبدء.
                </td>
              </tr>
            ) : (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                  
                  {/* Title */}
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                    {page.title}
                  </td>

                  {/* Slug */}
                  <td className="py-4 px-6 font-mono text-xs text-amber-600 dark:text-amber-400" dir="ltr">
                    /{page.slug}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 text-center">
                    {page.isPublished ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> منشورة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        <XCircle className="w-3 h-3" /> مسودة
                      </span>
                    )}
                  </td>

                  {/* Show in Nav */}
                  <td className="py-4 px-6 text-center text-xs text-slate-500">
                    {page.showInNav ? 'نعم (بالأعلى)' : 'مخفي'}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/${page.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-600 dark:text-slate-200 transition-colors"
                        title="معاينة الصفحة"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => onEdit(page)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-600 dark:text-slate-200 transition-colors"
                        title="تعديل الصفحة"
                        type="button"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(page.id, page.title)}
                        disabled={deletingId === page.id}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-colors disabled:opacity-50"
                        title="حذف"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
