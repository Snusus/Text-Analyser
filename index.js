// index.js
import React from 'react';
import { createRoot } from 'react-dom/client';  // Используйте createRoot из "react-dom/client"
import './index.css';
import App from './App';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruTranslation from './translations/ru.json';
import enTranslation from './translations/en.json';

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: ruTranslation,
    },
    en: {
      translation: enTranslation,
    },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

const root = createRoot(document.getElementById('root'));  // Создание root с использованием createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
