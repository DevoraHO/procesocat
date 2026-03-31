import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './es.json';
import ca from './ca.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      ca: { translation: ca }
    },
    fallbackLng: 'es',
    load: 'languageOnly',
    debug: false,
    detection: {
      lookupLocalStorage: 'procesocat_lang',
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  }).catch((err) => {
    console.error('i18n init failed, using fallback', err);
  });

export default i18n;
