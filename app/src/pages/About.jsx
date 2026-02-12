import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('aboutTitle')}</h1>
      <p>{t('aboutText')}</p>
    </div>
  );
}
