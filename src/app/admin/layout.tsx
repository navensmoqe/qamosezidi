'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, BookOpen, LogOut, KeyRound, Check, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    // If on login page, let it render directly
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    // Check if session token exists
    const session = localStorage.getItem('qamos_admin_session');
    if (session && session.startsWith('authenticated_')) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('qamos_admin_session');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  const handleChangeKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKey.trim()) {
      localStorage.setItem('qamos_admin_key', newKey.trim());
      setKeySaved(true);
      setTimeout(() => {
        setKeySaved(false);
        setIsKeyModalOpen(false);
        setNewKey('');
      }, 1500);
    }
  };

  // If on login page, render children directly without dashboard header
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading authentication check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">التحقق من تصريح دخول لوحة الإدارة...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      
      {/* Dedicated Admin Portal Topbar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        {/* Left / Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
            𐺑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base tracking-tight">لوحة تحكم القاموس الأيزيدي</h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                جلسة نشطة (Admin Active)
              </span>
            </div>
            <p className="text-xs text-slate-400">بوابة الإدارة المستقلة • إدارة الكلمات والـ CSV</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>معاينة القاموس العام</span>
          </Link>

          <button
            onClick={() => setIsKeyModalOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="تغيير رمز مرور الإدارة"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">تغيير رمز المرور</span>
          </button>

          <button
            onClick={handleLogout}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 transition-all"
            title="تسجيل الخروج من لوحة التحكم"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>

        </div>

      </div>

      {/* Main Admin Content */}
      {children}

      {/* Change Password Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              تغيير رمز مرور الإدارة
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              أدخل رمز المرور الجديد لحماية لوحة التحكم المستقلة.
            </p>

            <form onSubmit={handleChangeKey} className="space-y-4">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="أدخل الرمز الجديد..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                required
              />

              {keySaved && (
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> تم تحديث الرمز بنجاح!
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  حفظ الرمز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
