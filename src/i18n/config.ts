export const locales = ['en', 'es', 'pt', 'ar', 'fr', 'de', 'hi'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const rtlLocales: Locale[] = ['ar'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português (BR)',
  ar: 'العربية',
  fr: 'Français',
  de: 'Deutsch',
  hi: 'हिन्दी',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇲🇽',
  pt: '🇧🇷',
  ar: '🇦🇪',
  fr: '🇫🇷',
  de: '🇩🇪',
  hi: '🇮🇳',
};

export const localeCurrencies: Record<Locale, { code: string; symbol: string; starterMonthly: number; proMonthly: number; lifetime: number }> = {
  en: { code: 'USD', symbol: '$',   starterMonthly: 19,    proMonthly: 39,     lifetime: 149  },
  es: { code: 'USD', symbol: '$',   starterMonthly: 19,    proMonthly: 39,     lifetime: 149  },
  pt: { code: 'BRL', symbol: 'R$',  starterMonthly: 99,    proMonthly: 199,    lifetime: 499  },
  ar: { code: 'USD', symbol: '$',   starterMonthly: 19,    proMonthly: 39,     lifetime: 149  },
  fr: { code: 'EUR', symbol: '€',   starterMonthly: 19,    proMonthly: 39,     lifetime: 149  },
  de: { code: 'EUR', symbol: '€',   starterMonthly: 19,    proMonthly: 39,     lifetime: 149  },
  hi: { code: 'USD', symbol: '$',   starterMonthly: 19,    proMonthly: 39,     lifetime: 149  },
};

export const localeCountryMap: Record<string, Locale> = {
  US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en',
  MX: 'es', CO: 'es', AR: 'es', CL: 'es', PE: 'es', ES: 'es',
  BR: 'pt',
  AE: 'ar', SA: 'ar', EG: 'ar', KW: 'ar', QA: 'ar', BH: 'ar',
  FR: 'fr', SN: 'fr', CI: 'fr', CM: 'fr',
  DE: 'de', AT: 'de', CH: 'de',
  PK: 'en', BD: 'en', IN: 'hi'
};