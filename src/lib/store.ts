import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { DictionaryEntry, SearchMode } from './types';
import { containsYazidiScript } from './csvHelper';

// Default initial dataset
const INITIAL_DATA: Omit<DictionaryEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { arabicWord: 'الرأس', yazidiWord: '𐺑𐺦𐺍𐺨 - سَرِ' },
  { arabicWord: 'الله / الإله', yazidiWord: '𐺝𐺡𐺍𐺀 - خُدا' },
  { arabicWord: 'الماء', yazidiWord: '𐺀𐺀𐺪 - آڤ' },
  { arabicWord: 'الشمس', yazidiWord: '𐺑𐺦𐺡𐺨 - رۆژ' },
  { arabicWord: 'القمر', yazidiWord: '𐺑𐺦𐺢 - هِيڤ' },
  { arabicWord: 'الأرض', yazidiWord: '𐺀𐺦𐺍𐺨 - عَرْض / أَرْض' },
  { arabicWord: 'السماء', yazidiWord: '𐺀𐺑𐺢𐺀𐺡 - أٰسْمان' },
  { arabicWord: 'الأب', yazidiWord: '𐺁𐺀𐺁 - باب' },
  { arabicWord: 'الأم', yazidiWord: '𐺢𐺀𐺨 - دايِك' },
  { arabicWord: 'الأخ', yazidiWord: '𐺁𐺍𐺀 - بِرا' },
  { arabicWord: 'الأخت', yazidiWord: '𐺁𐺝 - خُشْك' },
  { arabicWord: 'البيت', yazidiWord: '𐺢𐺀𐺍 - مال' },
  { arabicWord: 'الخوب (الحب والوئام)', yazidiWord: '𐺝𐺡𐺁 - خُوب' },
  { arabicWord: 'العين', yazidiWord: '𐺝𐺀𐺡 - چاڤ' },
  { arabicWord: 'اليد', yazidiWord: '𐺢𐺦𐺑 - دَسْت' },
  { arabicWord: 'القلب', yazidiWord: '𐺢𐺦𐺍 - دِل' },
  { arabicWord: 'اليوم', yazidiWord: '𐺑𐺦𐺡 - إِڤرۆ' },
  { arabicWord: 'الليلة', yazidiWord: '𐺑𐺦𐺢 - شَڤ' },
  { arabicWord: 'الرجل', yazidiWord: '𐺑𐺦𐺍 - زَلام' },
  { arabicWord: 'المرأة', yazidiWord: '𐺢𐺦𐺑 - ژِن' },
  { arabicWord: 'الولد', yazidiWord: '𐺁𐺀𐺍 - كُڕ' },
  { arabicWord: 'البنت', yazidiWord: '𐺁𐺀𐺡 - كِچ' },
  { arabicWord: 'الخبز', yazidiWord: '𐺝𐺡𐺡 - نان' },
  { arabicWord: 'النار', yazidiWord: '𐺀𐺀𐺢 - ئاگِر' },
  { arabicWord: 'الجبل', yazidiWord: '𐺝𐺀𐺢 - چِيا' },
  { arabicWord: 'الشجرة', yazidiWord: '𐺢𐺀𐺑 - دار' },
  { arabicWord: 'الجميل', yazidiWord: '𐺑𐺦𐺀 - جُوان' },
  { arabicWord: 'الشيخ', yazidiWord: '𐺑𐺦𐺝 - شێخ' },
  { arabicWord: 'البايرام (الحديث والترتيل)', yazidiWord: '𐺁𐺀𐺨 - قَول' },
  { arabicWord: 'السلام والخير', yazidiWord: '𐺑𐺦𐺍 - خێر و سَلامي' },
];

const TMP_FILE = path.join('/tmp', 'qamos_entries.json');
let memoryStore: DictionaryEntry[] | null = null;
let isInitialized = false;

function getStore(): DictionaryEntry[] {
  if (memoryStore !== null) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        memoryStore = parsed;
        isInitialized = true;
        return memoryStore;
      }
    }
  } catch (e) {
    // Ignore read errors
  }

  // Only initialize default data on the very first cold startup
  if (!isInitialized) {
    memoryStore = INITIAL_DATA.map((item, index) => ({
      id: `default-${index + 1}`,
      arabicWord: item.arabicWord,
      yazidiWord: item.yazidiWord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    isInitialized = true;
    saveStore(memoryStore);
    return memoryStore;
  }

  memoryStore = [];
  return memoryStore;
}

function saveStore(entries: DictionaryEntry[]) {
  memoryStore = entries;
  isInitialized = true;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (e) {
    // Ignore write errors in restricted serverless
  }
}

// Universal get entries with query, mode, pagination
export async function getDictionaryEntries(
  query = '',
  mode: SearchMode = 'all',
  page = 1,
  limit = 12
) {
  try {
    let whereClause: any = {};
    if (query) {
      if (mode === 'arabic') {
        whereClause.arabicWord = { contains: query };
      } else if (mode === 'yazidi') {
        whereClause.yazidiWord = { contains: query };
      } else {
        whereClause.OR = [
          { arabicWord: { contains: query } },
          { yazidiWord: { contains: query } },
        ];
      }
    }

    const skip = (page - 1) * limit;
    const [entries, total, totalWords] = await Promise.all([
      prisma.dictionaryEntry.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.dictionaryEntry.count({ where: whereClause }),
      prisma.dictionaryEntry.count(),
    ]);

    if (totalWords > 0) {
      const allEntries = await prisma.dictionaryEntry.findMany({ select: { yazidiWord: true } });
      const yazidiScriptCount = allEntries.filter((e) => containsYazidiScript(e.yazidiWord)).length;

      return {
        entries: entries.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        stats: {
          totalWords,
          arabicCount: totalWords,
          yazidiCount: totalWords,
          yazidiScriptCount,
        },
      };
    }
  } catch (e) {
    // Database fallback
  }

  // Fallback Store logic
  let all = getStore();

  if (query) {
    const qLower = query.toLowerCase();
    all = all.filter((entry) => {
      if (mode === 'arabic') return entry.arabicWord.toLowerCase().includes(qLower);
      if (mode === 'yazidi') return entry.yazidiWord.toLowerCase().includes(qLower);
      return (
        entry.arabicWord.toLowerCase().includes(qLower) ||
        entry.yazidiWord.toLowerCase().includes(qLower)
      );
    });
  }

  const total = all.length;
  const skip = (page - 1) * limit;
  const paged = all.slice(skip, skip + limit);
  const yazidiScriptCount = getStore().filter((e) => containsYazidiScript(e.yazidiWord)).length;

  return {
    entries: paged,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    stats: {
      totalWords: getStore().length,
      arabicCount: getStore().length,
      yazidiCount: getStore().length,
      yazidiScriptCount,
    },
  };
}

// Bulk import
export async function bulkImportEntries(newItems: { arabicWord: string; yazidiWord: string }[]) {
  let prismaSuccess = false;
  let count = 0;

  try {
    const res = await prisma.dictionaryEntry.createMany({
      data: newItems,
    });
    prismaSuccess = true;
    count = res.count;
  } catch (e) {
    // Ignore fallback
  }

  const current = getStore();
  const createdFallback: DictionaryEntry[] = newItems.map((item, idx) => ({
    id: `import-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
    arabicWord: item.arabicWord,
    yazidiWord: item.yazidiWord,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  const updated = [...createdFallback, ...current];
  saveStore(updated);

  return { count: prismaSuccess ? count : newItems.length };
}

// Create single entry
export async function createSingleEntry(arabicWord: string, yazidiWord: string) {
  let created: any = null;
  try {
    created = await prisma.dictionaryEntry.create({
      data: { arabicWord, yazidiWord },
    });
  } catch (e) {
    // Ignore fallback
  }

  const current = getStore();
  const newEntry: DictionaryEntry = {
    id: created ? created.id : `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    arabicWord,
    yazidiWord,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveStore([newEntry, ...current]);
  return newEntry;
}

// Update single entry
export async function updateSingleEntry(id: string, arabicWord: string, yazidiWord: string) {
  try {
    await prisma.dictionaryEntry.update({
      where: { id },
      data: { arabicWord, yazidiWord },
    });
  } catch (e) {
    // Ignore fallback
  }

  const current = getStore();
  const updated = current.map((item) =>
    item.id === id
      ? { ...item, arabicWord, yazidiWord, updatedAt: new Date().toISOString() }
      : item
  );
  saveStore(updated);
  return { id, arabicWord, yazidiWord };
}

// Delete single entry
export async function deleteSingleEntry(id: string) {
  try {
    await prisma.dictionaryEntry.delete({
      where: { id },
    });
  } catch (e) {
    // Ignore fallback
  }

  const current = getStore();
  const updated = current.filter((item) => item.id !== id);
  saveStore(updated);
  return true;
}

// Bulk delete multiple entries by ID
export async function bulkDeleteEntries(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  
  try {
    await prisma.dictionaryEntry.deleteMany({
      where: { id: { in: ids } },
    });
  } catch (e) {
    // Ignore fallback
  }

  const idSet = new Set(ids);
  const current = getStore();
  const updated = current.filter((item) => !idSet.has(item.id));
  saveStore(updated);
  return ids.length;
}

// Clear all entries
export async function clearAllEntries() {
  try {
    await prisma.dictionaryEntry.deleteMany({});
  } catch (e) {
    // Ignore fallback
  }

  saveStore([]);
  return true;
}
