/**
 * useTranslation Hook for EduX
 * Client-side translation utilities
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { defaultLocale, locales, isRTL, getDirection, localeNames } from './config';

// Translation context
const TranslationContext = createContext(null);

// Translation cache
const translationCache = new Map();

/**
 * Load translations for a locale
 */
async function loadTranslations(locale, namespace = 'common') {
  const cacheKey = `${locale}:${namespace}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const response = await fetch(`/locales/${locale}/${namespace}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${locale}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid content type for translations: ${contentType}`);
    }
    const translations = await response.json();
    translationCache.set(cacheKey, translations);
    return translations;
  } catch (error) {
    console.error(`Error loading translations:`, error);
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return loadTranslations(defaultLocale, namespace);
    }
    return {};
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

/**
 * Interpolate variables in translation string
 */
function interpolate(str, params) {
  if (!params || typeof str !== 'string') return str;
  
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

/**
 * Translation Provider Component
 */
export function TranslationProvider({ children, initialLocale = defaultLocale }) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    setIsLoading(true);
    loadTranslations(locale)
      .then(setTranslations)
      .finally(() => setIsLoading(false));
  }, [locale]);

  // Update document direction for RTL languages
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = getDirection(locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Save locale preference
  const setLocale = useCallback((newLocale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('edux-locale', newLocale);
      }
    }
  }, []);

  // Translation function
  const t = useCallback((key, params) => {
    const value = getNestedValue(translations, key);
    if (value === undefined) {
      console.warn(`Translation missing: ${key}`);
      return key;
    }
    return interpolate(value, params);
  }, [translations]);

  const value = {
    locale,
    setLocale,
    t,
    isLoading,
    isRTL: isRTL(locale),
    direction: getDirection(locale),
    locales,
    localeNames,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * useTranslation Hook
 */
export function useTranslation(namespace = 'common') {
  const context = useContext(TranslationContext);
  
  if (!context) {
    // Fallback for when provider is not available
    return {
      t: (key) => key,
      locale: defaultLocale,
      setLocale: () => {},
      isLoading: false,
      isRTL: false,
      direction: 'ltr',
      locales,
      localeNames,
    };
  }

  return context;
}

/**
 * Language Selector Component
 */
export function LanguageSelector({ className = '' }) {
  const { locale, setLocale, localeNames } = useTranslation();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className={`px-3 py-2 border rounded-lg bg-white ${className}`}
      aria-label="Select language"
    >
      {Object.entries(localeNames).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  );
}

/**
 * Trans Component for complex translations with JSX
 */
export function Trans({ i18nKey, components = {}, values = {} }) {
  const { t } = useTranslation();
  const translation = t(i18nKey, values);

  // Simple implementation - replace <n> tags with components
  let result = translation;
  Object.entries(components).forEach(([key, Component]) => {
    const regex = new RegExp(`<${key}>(.*?)</${key}>`, 'g');
    result = result.replace(regex, (match, content) => {
      return `__COMPONENT_${key}__${content}__END__`;
    });
  });

  // For now, return plain text (full JSX replacement would need more complex parsing)
  return <>{result.replace(/__COMPONENT_\w+__|__END__/g, '')}</>;
}

export default useTranslation;
