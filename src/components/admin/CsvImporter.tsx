'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Sparkles, X, Database } from 'lucide-react';
import { parse2ColumnCsv } from '@/lib/csvHelper';
import { CsvRowPreview } from '@/lib/types';

interface CsvImporterProps {
  onSuccess: () => void;
}

export default function CsvImporter({ onSuccess }: CsvImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<CsvRowPreview[]>([]);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  const [hasHeader, setHasHeader] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (fileToProcess: File) => {
    if (!fileToProcess.name.endsWith('.csv')) {
      setImportResult({ success: false, message: 'يرجى رفع ملف بصيغة .csv فقط' });
      return;
    }

    setFile(fileToProcess);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsed = parse2ColumnCsv(content);
        setPreviews(parsed.previews);
        setValidCount(parsed.validCount);
        setInvalidCount(parsed.invalidCount);
        setHasHeader(parsed.hasHeader);
      }
    };
    reader.readAsText(fileToProcess, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCommitImport = async () => {
    const validEntries = previews
      .filter((p) => p.isValid)
      .map((p) => ({ arabicWord: p.arabicWord, yazidiWord: p.yazidiWord }));

    if (validEntries.length === 0) {
      setImportResult({ success: false, message: 'لا توجد أسطر صالحة للاستيراد' });
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch('/api/dictionary/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: validEntries }),
      });

      const data = await res.json();
      if (data.success) {
        setImportResult({ success: true, message: data.message });
        setPreviews([]);
        setFile(null);
        onSuccess();
      } else {
        setImportResult({ success: false, message: data.error || 'فشل الاستيراد' });
      }
    } catch (err) {
      setImportResult({ success: false, message: 'حدث خطأ في الاتصال بالسيرفر' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm mb-8">
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-500" />
            استيراد ملف CSV ثنائي الأعمدة (Smart 2-Column CSV Import)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            يدعم الملفات التي تحتوي على رأس (Header) أو أسطر بيانات مباشرة بدون رأس، بترميز UTF-8.
          </p>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/30 group"
        >
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="hidden"
          />

          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            اسحب ملف CSV هنا أو اضغط للاختيار
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تأكد من أن الملف يتكون من عمودين: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">الكلمة العربية</code> و <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">التمثيل الأيزيدي (خط / كتابة)</code>
          </p>
        </div>
      ) : (
        /* Preview & Confirmation Modal/Panel */
        <div className="space-y-4">
          
          <div className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-500" />
              <div>
                <h4 className="font-bold text-sm">{file.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  حجم الملف: {(file.size / 1024).toFixed(1)} KB • {hasHeader ? 'تم كشف سطر رأس (Header Detected)' : 'بدون سطر رأس (No Header)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {validCount} سطر صالحة
              </span>
              {invalidCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  {invalidCount} سطر فيه خطأ
                </span>
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPreviews([]);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="إلغاء الملف"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <tr>
                  <th className="py-2.5 px-4"># السطر</th>
                  <th className="py-2.5 px-4">العمود 1: الكلمة العربية</th>
                  <th className="py-2.5 px-4">العمود 2: التمثيل الأيزيدي</th>
                  <th className="py-2.5 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {previews.slice(0, 50).map((preview, i) => (
                  <tr key={i} className={preview.isValid ? '' : 'bg-red-500/5'}>
                    <td className="py-2 px-4 font-mono text-slate-400">{preview.rowIndex}</td>
                    <td className="py-2 px-4 font-bold text-slate-900 dark:text-white">{preview.arabicWord || '-'}</td>
                    <td className="py-2 px-4 font-bold text-amber-600 dark:text-amber-400 font-yazidi">{preview.yazidiWord || '-'}</td>
                    <td className="py-2 px-4">
                      {preview.isValid ? (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> جاهز
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {preview.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              سيتم إدراج <strong className="text-amber-500">{validCount}</strong> مفردة مفحوصة في قاعدة البيانات.
            </p>

            <button
              onClick={handleCommitImport}
              disabled={isImporting || validCount === 0}
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>{isImporting ? 'جاري الاستيراد...' : 'تأكيد وحفظ الكلمات بالحاعدة'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Result Status Message */}
      {importResult && (
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
            importResult.success
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {importResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{importResult.message}</span>
        </div>
      )}

    </div>
  );
}
