import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const OfflineBanner = () => {
  const { t } = useTranslation();
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[9000] bg-orange-500 text-white text-center text-sm py-1.5 font-medium">
      {t('errors.offline')}
    </div>
  );
};

export default OfflineBanner;
