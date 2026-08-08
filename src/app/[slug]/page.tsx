import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Calendar, Sparkles, CheckCircle2, FileText } from 'lucide-react';
import { getPageBySlug, getAllPages } from '@/lib/store';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const pages = await getAllPages(true);
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: 'الصفحة غير موجودة | قاموس الأيزيدية',
    };
  }

  return {
    title: `${page.title} | قاموس الأيزيدية - العربية`,
    description: page.content.slice(0, 160).replace(/[#*`]/g, ''),
  };
}

export default async function CustomPageView({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Parse inline bold markdown (**text** -> <strong>) and glyph highlights
  const renderInlineFormatted = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanBold = part.slice(2, -2);
        return (
          <strong key={i} className="font-bold text-slate-950 dark:text-amber-400">
            {cleanBold}
          </strong>
        );
      }
      return part;
    });
  };

  // Rich markdown parser for headers, lists, cards, and paragraphs
  const formatContent = (content: string) => {
    const blocks = content.split('\n\n');

    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H3
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-2"
          >
            <span className="w-2 h-6 rounded-full bg-amber-500 inline-block"></span>
            <span>{trimmed.replace('### ', '')}</span>
          </h3>
        );
      }

      // H2
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Bullet Lists (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
        return (
          <div key={idx} className="my-6 space-y-3">
            {items.map((item, itemIdx) => {
              const cleanText = item.replace(/^[-*]\s+/, '');
              return (
                <div
                  key={itemIdx}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 transition-all hover:border-amber-500/30"
                >
                  <div className="mt-1 w-5 h-5 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-yazidi">
                    {renderInlineFormatted(cleanText)}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Numbered Lists (1. 2. 3.)
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
        return (
          <div key={idx} className="my-6 space-y-3">
            {items.map((item, itemIdx) => {
              const match = item.match(/^(\d+)\.\s+(.*)/);
              const number = match ? match[1] : `${itemIdx + 1}`;
              const cleanText = match ? match[2] : item;

              return (
                <div
                  key={itemIdx}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 transition-all hover:border-amber-500/30"
                >
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                    {number}
                  </span>
                  <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-yazidi">
                    {renderInlineFormatted(cleanText)}
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // Regular Paragraph
      return (
        <p
          key={idx}
          className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-yazidi"
        >
          {renderInlineFormatted(trimmed)}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto py-6">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>الرئيسية</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200">{page.title}</span>
      </nav>

      {/* Hero Header */}
      <header className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 mb-8 shadow-sm text-center sm:text-right">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20">
            صفحة توثيقية
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            {new Date(page.updatedAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {page.title}
        </h1>
      </header>

      {/* Main Content Box */}
      <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm leading-relaxed text-slate-800 dark:text-slate-200">
        <div className="space-y-2">
          {formatContent(page.content)}
        </div>

        {/* Back to Dictionary Action */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all group"
          >
            <span>العودة للبحث في القاموس</span>
            <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>

          <span className="text-xs text-slate-400">
            قاموس الأيزيدية - منصة التوثيق والمعجم المفتوح
          </span>
        </div>
      </div>

    </article>
  );
}
