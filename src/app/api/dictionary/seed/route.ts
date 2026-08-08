import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const initialVocabulary = [
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

export async function POST() {
  try {
    const existingCount = await prisma.dictionaryEntry.count();

    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'القاموس يحتوي بالفعل على بيانات',
        count: existingCount,
      });
    }

    const created = await prisma.dictionaryEntry.createMany({
      data: initialVocabulary,
    });

    return NextResponse.json({
      success: true,
      message: `تم البذر الابتدائي لـ ${created.count} كلمة أيزيدية-عربية`,
      count: created.count,
    });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء البذر الابتدائي' },
      { status: 500 }
    );
  }
}
