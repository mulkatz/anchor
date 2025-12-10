import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enUS from '../assets/translations/en-US.json';
import deDE from '../assets/translations/de-DE.json';

/**
 * Initialize i18next for internationalization
 * Supports: English (en-US), German (de-DE)
 */
export function initI18n() {
  return i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'language',
      },
      fallbackLng: 'en-US',
      supportedLngs: ['en-US', 'de-DE'],
      resources: {
        'en-US': enUS,
        'de-DE': deDE,
      },
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18next;
