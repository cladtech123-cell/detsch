/**
 * i18n configuration for DeutschMastery.
 * Supported languages: Uzbek (uz), Russian (ru), German (de)
 * Language is persisted in localStorage via i18next-browser-languagedetector.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uz from '@/locales/uz.json';
import ru from '@/locales/ru.json';
import de from '@/locales/de.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      de: { translation: de },
    },
    fallbackLng: 'uz',
    supportedLngs: ['uz', 'ru', 'de'],
    detection: {
      // Persist language in localStorage
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dm_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
