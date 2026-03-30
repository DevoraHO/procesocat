import { useTranslation } from 'react-i18next';

const AlertsPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">{t('nav.alerts')} — Coming soon</p>
    </div>
  );
};

export default AlertsPage;
