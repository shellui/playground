import { useTranslation } from 'react-i18next';

export default function Languages() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('pageLanguagesTitle')}</h1>
      <p className="text-foreground">{t('pageLanguagesDescription')}</p>
    </div>
  );
}
