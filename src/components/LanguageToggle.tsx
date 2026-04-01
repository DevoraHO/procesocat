import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { safeStorage } from '@/utils/safeStorage';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('ca') ? 'ca' : 'es';

  const toggle = () => {
    const next = current === 'es' ? 'ca' : 'es';
    i18n.changeLanguage(next);
    safeStorage.setItem('procesocat_lang', next);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="font-semibold text-xs px-2 h-8 min-w-[40px]"
    >
      {current.toUpperCase()}
    </Button>
  );
};

export default LanguageToggle;
