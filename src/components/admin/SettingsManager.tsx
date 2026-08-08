'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertTriangle, Globe, Sparkles, Mail } from 'lucide-react';
import { SiteSettings } from '@/lib/types';

interface SettingsManagerProps {
  initialSettings?: SiteSettings;
  onRefresh?: () => void;
}

export default function SettingsManager({ initialSettings, onRefresh }: SettingsManagerProps) {
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: 'قاموس الأيزيدية',
    siteSubtitle: 'المنصة الرقمية لمعجم الكلمات والمفردات الأيزيدية-العربية',
    heroBadge: 'محرك بحث ثنائي اللغة فوري (عربي - 𐺑𐺦𐺍𐺨)',
    heroTitle: 'ابحث في القاموس الأيزيدي بكل سهولة',
    heroSubtitle: 'استكشف آلاف المفردات بالأبجدية الأيزيدية الأصلية والترجمة العربية الدقيقة.',
    footerText: 'قاموس الأيزيدية - العربية الرقمي • منصة التوثيق والمعجم المفتوح',
    contactEmail: 'contact@ezidi-dictionary.org',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'تم حفظ إعدادات الموقع بنجاح!' });
        if (onRefresh) onRefresh();
        setTimeout(() => setMessage(null), 3500);
      } else {
        setMessage({ type: 'error', text: data.error || 'فشل حفظ الإعدادات' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء الاتصال بالسيرفر' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>إعدادات وتخصيص الموقع (Site Customization)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تعديل النصوص والعناوين الرئيسية والوصف وبيانات الاتصال بالموقع.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Brand Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              اسم الموقع (Site Title)
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => handleChange('siteTitle', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              وصف الموقع في الهيدر (Subtitle)
            </label>
            <input
              type="text"
              value={settings.siteSubtitle}
              onChange={(e) => handleChange('siteSubtitle', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Hero Section Texts */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>نصوص الواجهة الرئيسية (Hero Section)</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              شارة الواجهة (Hero Badge)
            </label>
            <input
              type="text"
              value={settings.heroBadge}
              onChange={(e) => handleChange('heroBadge', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              العنوان الرئيسي للبحث (Hero Title)
            </label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              النص التوضيحي تحت البحث (Hero Subtitle)
            </label>
            <textarea
              rows={2}
              value={settings.heroSubtitle}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              نص الفوتر السفلي (Footer Text)
            </label>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              بريد التواصل (Contact Email)
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-500"
              dir="ltr"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جاري حفظ الإعدادات...' : 'حفظ وتحديث إعدادات الموقع'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
