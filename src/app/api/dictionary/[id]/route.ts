import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updatedEntry = await prisma.dictionaryEntry.update({
      where: { id },
      data: {
        arabicWord: arabicWord.trim(),
        yazidiWord: yazidiWord.trim(),
      },
    });

    return NextResponse.json({ success: true, entry: updatedEntry });
  } catch (error: any) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث البيانات' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.dictionaryEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف الكلمة بنجاح' });
  } catch (error: any) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف الكلمة' },
      { status: 500 }
    );
  }
}
