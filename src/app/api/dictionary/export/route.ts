import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCsv } from '@/lib/csvHelper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const mode = searchParams.get('mode') || 'all';

    let whereClause: any = {};

    if (q) {
      if (mode === 'arabic') {
        whereClause.arabicWord = { contains: q };
      } else if (mode === 'yazidi') {
        whereClause.yazidiWord = { contains: q };
      } else {
        whereClause.OR = [
          { arabicWord: { contains: q } },
          { yazidiWord: { contains: q } },
        ];
      }
    }

    const entries = await prisma.dictionaryEntry.findMany({
      where: whereClause,
      select: {
        arabicWord: true,
        yazidiWord: true,
      },
      orderBy: { arabicWord: 'asc' },
    });

    const csvContent = generateCsv(entries);

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
