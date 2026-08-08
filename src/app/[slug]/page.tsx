import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Calendar, Share2, Sparkles } from 'lucide-react';
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

  // Simple clean markdown-to-html formatter for paragraphs, headers, and bullet lists
  const formatContent = (content: string) => {
    return content.split('\n\n').map((block, idx) => {
      const trimmed = block.trim();
      
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
        return (
          <ul key={idx} className="space-y-2 my-4 pr-4 border-r-2 border-amber-500/40">
            {items.map((item, itemIdx) => {
              const cleanText = item.replace(/^[-*]\s+/, '');
              return (
                <li key={itemIdx} className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-yazidi">
                  {cleanText}
                </li>
              );
            })}
          </ul>
        );
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split('\n').filter((l) => l.trim().length > 0);
        return (
          <ol key={idx} className="space-y-2.5 my-4 pr-6 list-decimal text-slate-700 dark:text-slate-300">
            {items.map((item, itemIdx) => (
              <li key={itemIdx} className="text-base leading-relaxed">
                {item.replace(/^\d+\.\s+/, '')}
              </li>
            ))}
          </ol>
        );
      }

      return (
        <p key={idx} className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-yazidi">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <article className="max-w-4xl mx-auto py-8">
      
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
      <header className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
            صفحة توثيقية
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(page.updatedAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          {page.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          مسار الصفحة المباشر: <code className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono">/{page.slug}</code>
        </p>
      </header>

      {/* Main Content Box */}
      <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm leading-relaxed text-slate-800 dark:text-slate-200">
        <div className="prose dark:prose-invert max-w-none">
          {formatContent(page.content)}
        </div>

        {/* Back to Dictionary Button */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
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
