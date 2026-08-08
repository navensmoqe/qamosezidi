import { NextRequest, NextResponse } from 'next/server';
import { bulkDeleteEntries, clearAllEntries } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, all } = body;

    if (all) {
      await clearAllEntries();
      return NextResponse.json({
        success: true,
        message: 'تم تفريغ وحذف جميع كلمات القاموس بنجاح',
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'يرجى تحديد الكلمات المراد حذفها' },
        { status: 400 }
      );
    }

    const count = await bulkDeleteEntries(ids);

    return NextResponse.json({
      success: true,
      deletedCount: count,
      message: `تم حذف ${count} كلمة محددة بنجاح`,
    });
  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تنفيذ الحذف الجماعي' },
      { status: 500 }
    );
  }
}
