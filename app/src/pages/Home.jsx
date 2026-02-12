import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>This is the home page.</p>
    </div>
  );
}
