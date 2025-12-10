import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en_US from '../assets/translations/en-US.json';

/**
 * Initialize i18next for internationalization
 * Adapted from cap2cal's i18n setup
 */
export function initI18n() {
  return i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      fallbackLng: 'en-US',
      resources: {
        'en-US': en_US,
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
