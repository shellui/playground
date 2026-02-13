import { useTranslation } from 'react-i18next';

export default function Layout() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('pageLayoutTitle')}</h1>
      <p className="text-foreground">{t('pageLayoutDescription')}</p>
    </div>
  );
}
