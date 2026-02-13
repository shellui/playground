import { useTranslation } from 'react-i18next';

export default function Modal() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('pageModalDrawerTitle')}</h1>
      <p className="text-foreground">{t('pageModalDrawerDescription')}</p>
    </div>
  );
}
