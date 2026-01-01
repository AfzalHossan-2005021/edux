/**
 * Internationalization (i18n) Configuration for EduX
 */

// Supported locales
export const locales = ['en', 'es', 'fr', 'de', 'ar', 'zh', 'hi', 'bn'];
export const defaultLocale = 'en';

// Locale display names
export const localeNames = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  zh: '中文',
  hi: 'हिन्दी',
  bn: 'বাংলা',
};

// RTL languages
export const rtlLocales = ['ar'];

/**
 * Check if locale is RTL
 */
export function isRTL(locale) {
  return rtlLocales.includes(locale);
}

/**
 * Get the direction for a locale
 */
export function getDirection(locale) {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * i18n configuration for next-i18next
 */
export const i18nConfig = {
  i18n: {
    defaultLocale,
    locales,
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

export default i18nConfig;
