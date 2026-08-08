'use client';

import { useState, useEffect } from 'react';
import { X, Save, FileText, Globe, Eye, Sparkles } from 'lucide-react';
import { PageItem } from '@/lib/types';

interface PageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PageItem>) => Promise<void>;
  initialPage: PageItem | null;
}

const COMMON_YAZIDI_GLYPHS = ['𐺑', '𐺦', '𐺍', '𐺨', '𐺀', '𐺁', '𐺢', '𐺝', '𐺡', '𐺑𐺦𐺍𐺨'];

export default function PageModal({
  isOpen,
  onClose,
  onSave,
  initialPage,
}: PageModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [showInNav, setShowInNav] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPage) {
      setTitle(initialPage.title);
      setSlug(initialPage.slug);
      setContent(initialPage.content);
      setIsPublished(initialPage.isPublished);
      setShowInNav(initialPage.showInNav);
    } else {
      setTitle('');
      setSlug('');
      setContent('');
      setIsPublished(true);
      setShowInNav(true);
    }
    setError(null);
  }, [initialPage, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى إدخال عنوان الصفحة');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        id: initialPage?.id,
        title: title.trim(),
        slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, '-'),
        content,
        isPublished,
        showInNav,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الصفحة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertGlyph = (glyph: string) => {
    setContent((prev) => prev + glyph);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialPage ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}
              </h3>
              <p className="text-xs text-slate-400">إدارة محتوى وعنوان ورابط الصفحة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان الصفحة <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تاريخ الخط الأيزيدي، عن المعجم..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              مسار الرابط (Slug)
            </label>
            <div className="flex items-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
              <span className="px-3 py-3 text-slate-400 font-mono text-xs bg-slate-100 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700" dir="ltr">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about, history, alphabet..."
                className="w-full px-3 py-3 bg-transparent text-slate-900 dark:text-white font-mono text-xs focus:outline-none"
                dir="ltr"
              />
            </div>
          </div>

          {/* Quick Glyphs for Content */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> إدراج أحرف أيزيدية:
            </span>
            {COMMON_YAZIDI_GLYPHS.map((g, i) => (
              <button
                key={i}
                type="button"
                onClick={() => insertGlyph(g)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 font-yazidi text-xs font-bold transition-colors"
              >
                {g}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              محتوى الصفحة (يدعم العناوين والقوائم والخط الأيزيدي)
            </label>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب محتوى الصفحة هنا... يدعم فقرات متعددة، وقوائم نقطية (- نقطة)، وعناوين (## عنوان)..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500 font-yazidi leading-relaxed"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                نشر الصفحة (إتاحتها للزوار)
              </span>
            </label>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showInNav}
                onChange={(e) => setShowInNav(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                إظهار الرابط في القائمة العلوية
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ الصفحة'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
