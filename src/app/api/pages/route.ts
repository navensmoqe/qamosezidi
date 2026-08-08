import { NextRequest, NextResponse } from 'next/server';
import { getAllPages, createPage } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published') === 'true';

    const pages = await getAllPages(published);
    return NextResponse.json({ success: true, pages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب قائمة الصفحات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, content, isPublished, showInNav, order } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'عنوان الصفحة مطلوب' },
        { status: 400 }
      );
    }

    const newPage = await createPage({
      title: title.trim(),
      slug: slug?.trim() || title.trim(),
      content: content || '',
      isPublished: isPublished ?? true,
      showInNav: showInNav ?? true,
      order: typeof order === 'number' ? order : 1,
    });

    return NextResponse.json({ success: true, page: newPage }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الصفحة' },
      { status: 500 }
    );
  }
}
