import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('welcome')}</h1>
      <p className="text-foreground">This is the home page.</p>
    </div>
  );
}
