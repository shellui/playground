import { useTranslation } from 'react-i18next';

export default function Toaster() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('pageToasterTitle')}</h1>
      <p className="text-foreground">{t('pageToasterDescription')}</p>
    </div>
  );
}
