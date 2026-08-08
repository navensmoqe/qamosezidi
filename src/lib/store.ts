import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { DictionaryEntry, SearchMode, PageItem, SiteSettings } from './types';
import { containsYazidiScript } from './csvHelper';

// Default initial dictionary entries
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

// Initial default custom pages
const INITIAL_PAGES: PageItem[] = [
  {
    id: 'page-about',
    title: 'عن القاموس الأيزيدي',
    slug: 'about',
    content: `## مرحباً بكم في قاموس الأيزيدية الرقمي
يُعد هذا القاموس منصة رائدة تهدف إلى توثيق وحفظ وإتاحة المفردات والكلمات الأيزيدية وترجمتها الدقيقة إلى اللغة العربية.

### 🎯 أهداف المشروع:
1. **حفظ التراث اللغوي الأيزيدي:** توثيق الكلمات بالخط الأيزيدي الأصلي (Yezidi Script UTF-8) إلى جانب التمثيل الصوتي.
2. **محرك بحث فوري وسلس:** تمكين الباحثين والمهتمين من البحث اللحظي باللغتين العربية والأيزيدية.
3. **أداة استيراد وتصدير مفتوحة:** دعم ملفات CSV ثنائية الأعمدة لتسهيل تبادل المعاجم وتوسيع قاعدة البيانات.

نرحب بجميع المساهمات اللغوية والأكاديمية لتطوير هذا المعجم القيم.`,
    isPublished: true,
    showInNav: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-alphabet',
    title: 'الأبجدية والخط الأيزيدي',
    slug: 'alphabet',
    content: `## الأبجدية الأيزيدية الأصيلة (𐺀𐺐𐺦𐺝)
تتميز اللغة والتراث الأيزيدي بخط تاريخي فريد تم اعتماده رسمياً في معيار يونيكود العالمي (Unicode Yezidi Block U+10E80..U+10EBF).

### 🔤 جدول أهم الحروف الأيزيدية ونطقها:
- **𐺀 (ئـ / A):** الألف والهمزة الأولية.
- **𐺁 (B):** حرف الباء.
- **𐺢 (D):** حرف الدال.
- **𐺑 (R):** حرف الراء.
- **𐺦 (E / Ê):** حرف الياء الممالة / الكسرة الطويلة.
- **𐺍 (L):** حرف اللام.
- **𐺨 (I / Î):** حرف الياء الخفيفة.
- **𐺝 (X / Kh):** حرف الخاء.
- **𐺡 (J / Zh):** حرف الژاي أو الجيم.
- **𐺪 (V / W):** حرف الفاء المثلثة (ڤ).

يمكنك استخدام لوحة المفاتيح المدمجة في الصفحة الرئيسية للبحث بأي من هذه الحروف مباشرة!`,
    isPublished: true,
    showInNav: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-guide',
    title: 'دليل الاستخدام واستيراد CSV',
    slug: 'guide',
    content: `## دليل إدارة وتصدير القاموس
تم تصميم هذا النظام ليتعامل بسلاسة فائقة مع ملفات البيانات ثنائية الأعمدة (2-Column Architecture).

### 📋 كيفية إعداد ملف CSV للاستيراد:
1. أنشئ جدولاً في برنامج Excel أو Google Sheets يتكون من **عمودين فقط**:
   - **العمود 1:** الكلمة العربية (مثال: "الرأس")
   - **العمود 2:** التمثيل الأيزيدي (مثال: "𐺑𐺦𐺍𐺨 - سَرِ")
2. احفظ الملف بصيغة **CSV UTF-8 (Comma delimited) (.csv)**.
3. ادخل إلى لوحة الإدارة واسحب الملف في منطقة الاستيراد الذكية.
4. افحص المعاينة واضغط على **"تأكيد وحفظ الكلمات بالحاعدة"**.

### 📥 تصدير البيانات:
يمكنك في أي وقت تصدير كامل قاعدة البيانات أو نتائج البحث المصفاة بنقرة واحدة عبر زر **تصدير CSV**.`,
    isPublished: true,
    showInNav: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initial default site settings
const INITIAL_SETTINGS: SiteSettings = {
  siteTitle: 'قاموس الأيزيدية',
  siteSubtitle: 'المنصة الرقمية لمعجم الكلمات والمفردات الأيزيدية-العربية',
  heroBadge: 'محرك بحث ثنائي اللغة فوري (عربي - 𐺑𐺦𐺍𐺨)',
  heroTitle: 'ابحث في القاموس الأيزيدي بكل سهولة',
  heroSubtitle: 'استكشف آلاف المفردات بالأبجدية الأيزيدية الأصلية والترجمة العربية الدقيقة.',
  footerText: 'قاموس الأيزيدية - العربية الرقمي • منصة التوثيق والمعجم المفتوح',
  contactEmail: 'contact@ezidi-dictionary.org',
};

const TMP_FILE = path.join('/tmp', 'qamos_entries.json');
const TMP_PAGES_FILE = path.join('/tmp', 'qamos_pages.json');
const TMP_SETTINGS_FILE = path.join('/tmp', 'qamos_settings.json');

let memoryStore: DictionaryEntry[] | null = null;
let pagesStore: PageItem[] | null = null;
let settingsStore: SiteSettings | null = null;
let isInitialized = false;

// ==================== DICTIONARY STORE ====================

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
    // Ignore
  }
}

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
    // Fallback
  }

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
    // Ignore
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

export async function createSingleEntry(arabicWord: string, yazidiWord: string) {
  let created: any = null;
  try {
    created = await prisma.dictionaryEntry.create({
      data: { arabicWord, yazidiWord },
    });
  } catch (e) {
    // Ignore
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

export async function updateSingleEntry(id: string, arabicWord: string, yazidiWord: string) {
  try {
    await prisma.dictionaryEntry.update({
      where: { id },
      data: { arabicWord, yazidiWord },
    });
  } catch (e) {
    // Ignore
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

export async function deleteSingleEntry(id: string) {
  try {
    await prisma.dictionaryEntry.delete({
      where: { id },
    });
  } catch (e) {
    // Ignore
  }

  const current = getStore();
  const updated = current.filter((item) => item.id !== id);
  saveStore(updated);
  return true;
}

export async function bulkDeleteEntries(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  
  try {
    await prisma.dictionaryEntry.deleteMany({
      where: { id: { in: ids } },
    });
  } catch (e) {
    // Ignore
  }

  const idSet = new Set(ids);
  const current = getStore();
  const updated = current.filter((item) => !idSet.has(item.id));
  saveStore(updated);
  return ids.length;
}

export async function clearAllEntries() {
  try {
    await prisma.dictionaryEntry.deleteMany({});
  } catch (e) {
    // Ignore
  }

  saveStore([]);
  return true;
}

// ==================== PAGES CMS STORE ====================

function getPagesStore(): PageItem[] {
  if (pagesStore !== null) {
    return pagesStore;
  }

  try {
    if (fs.existsSync(TMP_PAGES_FILE)) {
      const data = fs.readFileSync(TMP_PAGES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        pagesStore = parsed;
        return pagesStore;
      }
    }
  } catch (e) {
    // Ignore read errors
  }

  pagesStore = [...INITIAL_PAGES];
  savePagesStore(pagesStore);
  return pagesStore;
}

function savePagesStore(pages: PageItem[]) {
  pagesStore = pages;
  try {
    fs.writeFileSync(TMP_PAGES_FILE, JSON.stringify(pages, null, 2), 'utf-8');
  } catch (e) {
    // Ignore
  }
}

export async function getAllPages(onlyPublished = false): Promise<PageItem[]> {
  const pages = getPagesStore();
  const sorted = [...pages].sort((a, b) => a.order - b.order);
  if (onlyPublished) {
    return sorted.filter((p) => p.isPublished);
  }
  return sorted;
}

export async function getPageBySlug(slug: string): Promise<PageItem | null> {
  const pages = getPagesStore();
  return pages.find((p) => p.slug.toLowerCase() === slug.toLowerCase() && p.isPublished) || null;
}

export async function createPage(data: Omit<PageItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageItem> {
  const current = getPagesStore();
  const slug = (data.slug || data.title.trim().toLowerCase().replace(/\s+/g, '-')).replace(/[^a-zA-Z0-9-_\u0600-\u06FF]/g, '');

  const newPage: PageItem = {
    id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    slug,
    content: data.content || '',
    isPublished: data.isPublished ?? true,
    showInNav: data.showInNav ?? true,
    order: data.order ?? current.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [...current, newPage];
  savePagesStore(updated);
  return newPage;
}

export async function updatePage(id: string, data: Partial<PageItem>): Promise<PageItem | null> {
  const current = getPagesStore();
  let updatedPage: PageItem | null = null;

  const updated = current.map((p) => {
    if (p.id === id) {
      updatedPage = {
        ...p,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return updatedPage;
    }
    return p;
  });

  if (updatedPage) {
    savePagesStore(updated);
  }

  return updatedPage;
}

export async function deletePage(id: string): Promise<boolean> {
  const current = getPagesStore();
  const updated = current.filter((p) => p.id !== id);
  savePagesStore(updated);
  return true;
}

// ==================== SITE SETTINGS STORE ====================

function getSettingsStore(): SiteSettings {
  if (settingsStore !== null) {
    return settingsStore;
  }

  try {
    if (fs.existsSync(TMP_SETTINGS_FILE)) {
      const data = fs.readFileSync(TMP_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        const merged: SiteSettings = { ...INITIAL_SETTINGS, ...parsed };
        settingsStore = merged;
        return merged;
      }
    }
  } catch (e) {
    // Ignore read errors
  }

  const initial: SiteSettings = { ...INITIAL_SETTINGS };
  settingsStore = initial;
  saveSettingsStore(initial);
  return initial;
}

function saveSettingsStore(settings: SiteSettings) {
  settingsStore = settings;
  try {
    fs.writeFileSync(TMP_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    // Ignore
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return getSettingsStore();
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getSettingsStore();
  const updated: SiteSettings = {
    ...current,
    ...data,
  };
  saveSettingsStore(updated);
  return updated;
}
