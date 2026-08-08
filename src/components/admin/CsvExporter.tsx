'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Check } from 'lucide-react';

interface CsvExporterProps {
  searchQuery?: string;
  searchMode?: string;
  totalRecords: number;
}

export default function CsvExporter({ searchQuery, searchMode, totalRecords }: CsvExporterProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exported, setExported] = useState<boolean>(false);

  const handleExport = () => {
    setIsExporting(true);
    setExported(false);

    const url = `/api/dictionary/export?q=${encodeURIComponent(searchQuery || '')}&mode=${encodeURIComponent(searchMode || 'all')}`;
    
    // Trigger download via anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = `ezidi_arabic_dictionary_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setIsExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 800);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || totalRecords === 0}
      type="button"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
    >
      {exported ? (
        <>
          <Check className="w-4 h-4 text-white" />
          <span>تم تحميل ملف CSV!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>تصدير CSV ({totalRecords} كلمة)</span>
        </>
      )}
    </button>
  );
}
