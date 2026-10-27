import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translations.json'
import es from './locales/es/translations.json'
import zh from './locales/zh/translations.json'
import ptBR from './locales/pt-BR/translations.json'

import { getStoredLanguage, getBrowserLanguage, resolveLanguage, DEFAULT_LANGUAGE } from './language'

const LANGUAGE_STORAGE_KEY = 'ocl.language'
const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'pt-BR']

// Priority: manual choice (localStorage) > browser preference > default.
const getInitialLanguage = () => {
  if(typeof window === 'undefined')
    return DEFAULT_LANGUAGE

  return resolveLanguage([
    () => getStoredLanguage(() => window.localStorage, LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES),
    () => getBrowserLanguage(window.navigator, SUPPORTED_LANGUAGES)
  ])
}

// Registered after init, so only user-triggered changes are persisted, not the detected initial language.
const persistLanguage = language => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch(_) {
    // Keep i18n usable when browser storage is unavailable.
  }
}

const applyDocumentLanguage = language => {
  if(typeof document !== 'undefined')
    document.documentElement.lang = language
}

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: getInitialLanguage(),
  resources: {
    en: {
      translations: en
    },
    es: {
      translations: es
    },
    zh: {
      translations: zh
    },
    'pt-BR': {
      translations: ptBR
    }
  },
  ns: ['translations'],
  defaultNS: 'translations'
});

i18n.languages = SUPPORTED_LANGUAGES;
applyDocumentLanguage(i18n.language)
i18n.on('languageChanged', persistLanguage)
i18n.on('languageChanged', applyDocumentLanguage)

export default i18n;
