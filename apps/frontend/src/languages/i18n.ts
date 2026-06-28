import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import tranlationEN from "./en.json";
import translationAL from "./al.json";
import translationMK from "./mk.json";

const resources = {
  EN: {
    translation: tranlationEN,
  },
  AL: {
    translation: translationAL,
  },
  MK: {
    translation: translationMK,
  },
};

const LANGUAGE_KEY = "app_language";

const getInitialLanguage = () => {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved) return saved;
  return "AL";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "AL",
  interpolation: {
    escapeValue: false, 
    skipOnVariables: false,
  },
});

i18n.on("languageChanged", (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
});

export default i18n;
