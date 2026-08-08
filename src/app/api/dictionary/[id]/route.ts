import { NextRequest, NextResponse } from 'next/server';
import { updateSingleEntry, deleteSingleEntry } from '@/lib/store';

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

    const updatedEntry = await updateSingleEntry(id, arabicWord.trim(), yazidiWord.trim());

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
    await deleteSingleEntry(id);
    return NextResponse.json({ success: true, message: 'تم حذف الكلمة بنجاح' });
  } catch (error: any) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف الكلمة' },
      { status: 500 }
    );
  }
}
