'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    const pathParts = pathname.split('/');
    if (pathParts[1] && locales.includes(pathParts[1] as Locale)) {
      setCurrentLocale(pathParts[1] as Locale);
    }
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = async (newLocale: Locale) => {
    // Save to cookie for 1 year
    const cookieDate = new Date();
    cookieDate.setFullYear(cookieDate.getFullYear() + 1);
    document.cookie = `selvo-locale=${newLocale};expires=${cookieDate.toUTCString()};path=/`;
    
    // Save to DB if user is logged in
    try {
      await fetch('/api/user/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale })
      });
    } catch (e) {
      // Ignore errors - cookie still works
    }
    
    // Use the hardened absolute router to swap the locale
    router.replace(pathname, newLocale);
    setCurrentLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeFlags[currentLocale]} {localeNames[currentLocale]}</span>
        <span className="sm:hidden">{localeFlags[currentLocale]}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              onClick={() => handleLocaleChange(locale)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors ${
                currentLocale === locale ? 'bg-violet-600/20 text-violet-300' : 'text-white/70'
              }`}
            >
              <span className="text-lg">{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
              {currentLocale === locale && (
                <svg className="w-4 h-4 ml-auto text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}