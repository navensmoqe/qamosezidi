import { NextRequest, NextResponse } from 'next/server';
import { updatePage, deletePage } from '@/lib/store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updatePage(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على الصفحة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page: updated });
  } catch (error: any) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الصفحة' },
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
    await deletePage(id);
    return NextResponse.json({ success: true, message: 'تم حذف الصفحة بنجاح' });
  } catch (error: any) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في حذف الصفحة' },
      { status: 500 }
    );
  }
}
