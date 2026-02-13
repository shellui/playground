import { useTranslation } from 'react-i18next';

export default function Dialog() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('pageDialogTitle')}</h1>
      <p className="text-foreground">{t('pageDialogDescription')}</p>
    </div>
  );
}
