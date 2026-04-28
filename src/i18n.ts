import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import es from './i18n/locales/es.json';
import en from './i18n/locales/en.json';

const fallbackLng = import.meta.env.VITE_DEFAULT_LOCALE || 'es';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng,
    supportedLngs: ['es', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'aura.language',
      caches: ['localStorage'],
    },
  });

export default i18n;
