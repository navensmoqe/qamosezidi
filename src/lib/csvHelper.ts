import Papa from 'papaparse';
import { CsvRowPreview } from './types';

// Regex to check if a string contains Yazidi script Unicode characters (Range: U+10E80 - U+10EBF)
export function containsYazidiScript(text: string): boolean {
  return /[\u{10E80}-\u{10EBF}]/u.test(text);
}

// Known common header names for detection
const KNOWN_ARABIC_HEADERS = ['arabic', 'arabic_word', 'arabicword', 'الرأس', 'الكلمة العربية', 'عربي', 'العربية'];
const KNOWN_YAZIDI_HEADERS = ['yazidi', 'yazidi_word', 'yazidiword', 'الأيزيدية', 'الكلمة الأيزيدية', 'ايزيدي', 'الأيزيدي', 'script', 'transliteration'];

export function parse2ColumnCsv(csvContent: string): {
  previews: CsvRowPreview[];
  validCount: number;
  invalidCount: number;
  hasHeader: boolean;
} {
  const parseResult = Papa.parse<string[]>(csvContent, {
    skipEmptyLines: 'greedy',
  });

  const rows: string[][] = (parseResult.data || []).filter(
    (r: string[]) => Array.isArray(r) && r.some((cell) => cell && cell.trim().length > 0)
  );

  if (rows.length === 0) {
    return { previews: [], validCount: 0, invalidCount: 0, hasHeader: false };
  }

  // Check if first row is a header
  const firstRowCol1 = (rows[0][0] || '').trim().toLowerCase();
  const firstRowCol2 = (rows[0][1] || '').trim().toLowerCase();

  const isHeaderCol1 = KNOWN_ARABIC_HEADERS.some((h) => firstRowCol1 === h.toLowerCase());
  const isHeaderCol2 = KNOWN_YAZIDI_HEADERS.some((h) => firstRowCol2 === h.toLowerCase());

  const hasHeader = isHeaderCol1 || isHeaderCol2;
  const startIndex = hasHeader ? 1 : 0;

  const previews: CsvRowPreview[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    const col1 = (row[0] || '').trim();
    const col2 = (row[1] || '').trim();

    const rowIndex = i + 1;

    if (!col1 && !col2) {
      previews.push({
        rowIndex,
        arabicWord: '',
        yazidiWord: '',
        isValid: false,
        error: 'سطر فارغ (Empty row)',
      });
      invalidCount++;
      continue;
    }

    if (!col1) {
      previews.push({
        rowIndex,
        arabicWord: '',
        yazidiWord: col2,
        isValid: false,
        error: 'الكلمة العربية مفقودة (Arabic word missing)',
      });
      invalidCount++;
      continue;
    }

    if (!col2) {
      previews.push({
        rowIndex,
        arabicWord: col1,
        yazidiWord: '',
        isValid: false,
        error: 'الكلمة الأيزيدية مفقودة (Yazidi word missing)',
      });
      invalidCount++;
      continue;
    }

    previews.push({
      rowIndex,
      arabicWord: col1,
      yazidiWord: col2,
      isValid: true,
    });
    validCount++;
  }

  return { previews, validCount, invalidCount, hasHeader };
}

export function generateCsv(entries: { arabicWord: string; yazidiWord: string }[]): string {
  const data = [
    ['الكلمة العربية', 'التمثيل الأيزيدي (خط / كتابة)'],
    ...entries.map((e) => [e.arabicWord, e.yazidiWord]),
  ];

  // Unparse using PapaParse
  const csvString = Papa.unparse(data);
  // Prepend UTF-8 BOM so Excel opens Arabic & Yazidi Unicode properly
  return '\uFEFF' + csvString;
}
