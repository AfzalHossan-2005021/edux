/**
 * i18n Module Index
 */

export * from './config';
export * from './useTranslation';

import { i18nConfig, locales, defaultLocale } from './config';
import { useTranslation, TranslationProvider, LanguageSelector } from './useTranslation';

export { 
  i18nConfig, 
  locales, 
  defaultLocale, 
  useTranslation, 
  TranslationProvider, 
  LanguageSelector 
};
