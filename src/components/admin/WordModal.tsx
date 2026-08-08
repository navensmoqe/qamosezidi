'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Edit, Sparkles } from 'lucide-react';
import { DictionaryEntry } from '@/lib/types';

interface WordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { arabicWord: string; yazidiWord: string; id?: string }) => Promise<void>;
  initialEntry?: DictionaryEntry | null;
}

const YAZIDI_KEYS = ['𐺑', '𐺦', '𐺍', '𐺨', '𐺀', '𐺁', '𐺢', '𐺝', '𐺡', '𐺑𐺦𐺍𐺨'];

export default function WordModal({ isOpen, onClose, onSave, initialEntry }: WordModalProps) {
  const [arabicWord, setArabicWord] = useState<string>('');
  const [yazidiWord, setYazidiWord] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEntry) {
      setArabicWord(initialEntry.arabicWord);
      setYazidiWord(initialEntry.yazidiWord);
    } else {
      setArabicWord('');
      setYazidiWord('');
    }
    setError(null);
  }, [initialEntry, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arabicWord.trim()) {
      setError('يرجى إدخال الكلمة العربية');
      return;
    }
    if (!yazidiWord.trim()) {
      setError('يرجى إدخال التمثيل الأيزيدي');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        id: initialEntry?.id,
        arabicWord: arabicWord.trim(),
        yazidiWord: yazidiWord.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const addYazidiGlyph = (glyph: string) => {
    setYazidiWord((prev) => prev + glyph);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              {initialEntry ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {initialEntry ? 'تعديل مفردة قاموسية' : 'إضافة مفردة جديدة'}
              </h3>
              <p className="text-xs text-slate-500">سجل ثنائي العمود (Arabic - Yazidi)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Column 1: Arabic Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. الكلمة العربية (Arabic Word)
            </label>
            <input
              type="text"
              value={arabicWord}
              onChange={(e) => setArabicWord(e.target.value)}
              placeholder="مثال: الرأس، الشمس، الله"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-sm font-semibold"
              required
            />
          </div>

          {/* Column 2: Yazidi Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-amber-600 dark:text-amber-400">
                2. التمثيل الأيزيدي (Yazidi Script / Transliteration)
              </label>
              <span className="text-[11px] text-slate-400">يدعم UTF-8</span>
            </div>
            <input
              type="text"
              value={yazidiWord}
              onChange={(e) => setYazidiWord(e.target.value)}
              placeholder="مثال: 𐺑𐺦𐺍𐺨 أو سَرِ"
              className="w-full px-4 py-3 rounded-xl bg-amber-500/5 dark:bg-slate-800 border border-amber-500/30 dark:border-amber-500/30 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 text-base font-bold font-yazidi me-0"
              required
            />

            {/* Quick Yazidi Keys */}
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <span className="text-[11px] text-slate-400 me-1">أدوات إدخال الخط الأيزيدي:</span>
              {YAZIDI_KEYS.map((k, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addYazidiGlyph(k)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold text-xs hover:bg-amber-500 hover:text-slate-950 transition-colors"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ الكلمة'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
