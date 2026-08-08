import { NextRequest, NextResponse } from 'next/server';
import { getDictionaryEntries, createSingleEntry } from '@/lib/store';
import { SearchMode } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const mode = (searchParams.get('mode') || 'all') as SearchMode;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const result = await getDictionaryEntries(q, mode, page, limit);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Error fetching dictionary entries:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { arabicWord, yazidiWord } = body;

    if (!arabicWord || !arabicWord.trim()) {
      return NextResponse.json(
        { success: false, error: 'الكلمة العربية مطلوبة' },
        { status: 400 }
      );
    }

    if (!yazidiWord || !yazidiWord.trim()) {
      return NextResponse.json(
        { success: false, error: 'الكلمة الأيزيدية مطلوبة' },
        { status: 400 }
      );
    }

    const entry = await createSingleEntry(arabicWord.trim(), yazidiWord.trim());

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إضافة الكلمة إلى القاموس' },
      { status: 500 }
    );
  }
}
