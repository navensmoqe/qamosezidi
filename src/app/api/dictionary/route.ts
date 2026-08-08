import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { containsYazidiScript } from '@/lib/csvHelper';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const mode = searchParams.get('mode') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const skip = (page - 1) * limit;

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

    // Calculate Yazidi script count for stats
    const allEntries = await prisma.dictionaryEntry.findMany({
      select: { yazidiWord: true },
    });
    const yazidiScriptCount = allEntries.filter((e) => containsYazidiScript(e.yazidiWord)).length;

    return NextResponse.json({
      success: true,
      entries,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        totalWords,
        arabicCount: totalWords,
        yazidiCount: totalWords,
        yazidiScriptCount,
      },
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

    const entry = await prisma.dictionaryEntry.create({
      data: {
        arabicWord: arabicWord.trim(),
        yazidiWord: yazidiWord.trim(),
      },
    });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إضافة الكلمة إلى القاموس' },
      { status: 500 }
    );
  }
}
