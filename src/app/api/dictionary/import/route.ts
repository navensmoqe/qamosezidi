import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لا توجد بيانات صالحة للاستيراد' },
        { status: 400 }
      );
    }

    // Filter valid pairs
    const validData = entries
      .filter((e) => e.arabicWord?.trim() && e.yazidiWord?.trim())
      .map((e) => ({
        arabicWord: e.arabicWord.trim(),
        yazidiWord: e.yazidiWord.trim(),
      }));

    if (validData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على أزواج كلمات صالحة' },
        { status: 400 }
      );
    }

    // Perform bulk insertion in SQLite transaction
    const createdCount = await prisma.dictionaryEntry.createMany({
      data: validData,
    });

    return NextResponse.json({
      success: true,
      importedCount: createdCount.count,
      message: `تم استيراد ${createdCount.count} كلمة بنجاح`,
    });
  } catch (error: any) {
    console.error('Error importing CSV entries:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء استيراد البيانات' },
      { status: 500 }
    );
  }
}
