import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'This is a React app',
      home: 'Home',
      about: 'About',
      aboutTitle: 'About this app',
      aboutText: 'This is the about page. You can use this app with i18n and React Router.',
    },
  },
  fr: {
    translation: {
      welcome: "C'est une application React",
      home: 'Accueil',
      about: 'À propos',
      aboutTitle: 'À propos de cette application',
      aboutText: "Ceci est la page À propos. Vous pouvez utiliser cette application avec i18n et React Router.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
