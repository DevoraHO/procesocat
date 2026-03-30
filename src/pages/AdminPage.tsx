import { useTranslation } from 'react-i18next';

const AdminPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">{t('nav.admin')} — Coming soon</p>
    </div>
  );
};

export default AdminPage;
