import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'قاموس الأيزيدية - العربية | Yazidi-Arabic Dictionary',
  description: 'منصة رقمية حديثة لمعجم المفردات ثنائية العمود باللغتين الأيزيدية والعربية بالخطين الأصلي والصوتي.',
  keywords: ['قاموس أيزيدي', 'اللغة الأيزيدية', 'الخط الأيزيدي', 'Yazidi Script', 'Yazidi Dictionary', 'عربي أيزيدي'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen flex flex-col antialiased selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">𐺑</span>
              <span>قاموس الأيزيدية - العربية الرقمي</span>
            </div>
            
            <div className="flex items-center gap-4">
              <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
