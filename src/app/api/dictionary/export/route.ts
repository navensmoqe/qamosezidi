import { NextRequest, NextResponse } from 'next/server';
import { getDictionaryEntries } from '@/lib/store';
import { generateCsv } from '@/lib/csvHelper';
import { SearchMode } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const mode = (searchParams.get('mode') || 'all') as SearchMode;

    const result = await getDictionaryEntries(q, mode, 1, 10000);
    const csvContent = generateCsv(result.entries);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="yazidi_arabic_dictionary_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تصدير الملف' },
      { status: 500 }
    );
  }
}
