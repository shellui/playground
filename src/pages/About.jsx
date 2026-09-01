import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  return (
    <div className="font-body text-foreground">
      <h1 className="font-heading text-foreground">{t('aboutTitle')}</h1>
      <p className="text-foreground">{t('aboutText')}</p>
    </div>
  );
}
