import { useTranslation } from 'react-i18next';

export default function Themes() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('pageThemesTitle')}</h1>
      <p className="text-foreground">{t('pageThemesDescription')}</p>
    </div>
  );
}
