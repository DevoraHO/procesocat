import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ConsentState {
  location: boolean;
  backgroundLocation: boolean;
  camera: boolean;
  notifications: boolean;
  analytics: boolean;
  emailComms: boolean;
}

const GDPRModal = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => !localStorage.getItem('gdpr_shown'));
  const [consent, setConsent] = useState<ConsentState>({
    location: true,
    backgroundLocation: false,
    camera: false,
    notifications: false,
    analytics: false,
    emailComms: false,
  });

  if (!visible) return null;

  const save = (values: ConsentState) => {
    localStorage.setItem('gdpr_consent', JSON.stringify(values));
    localStorage.setItem('gdpr_shown', 'true');
    setVisible(false);
  };

  const acceptAll = () => save({
    location: true, backgroundLocation: true, camera: true,
    notifications: true, analytics: true, emailComms: true,
  });

  const essentialOnly = () => save({
    location: true, backgroundLocation: false, camera: false,
    notifications: false, analytics: false, emailComms: false,
  });

  const toggles: { key: keyof ConsentState; label: string; desc: string; disabled?: boolean }[] = [
    { key: 'location', label: t('gdpr.locationUsage'), desc: 'Necesario para mostrar alertas cercanas', disabled: true },
    { key: 'backgroundLocation', label: t('gdpr.backgroundLocation'), desc: 'Para notificaciones cuando la app está cerrada' },
    { key: 'camera', label: t('gdpr.camera'), desc: 'Para subir fotos de los nidos' },
    { key: 'notifications', label: t('gdpr.notifications'), desc: 'Alertas de peligro en tiempo real' },
    { key: 'analytics', label: t('gdpr.analytics'), desc: 'Nos ayuda a mejorar la app' },
    { key: 'emailComms', label: t('gdpr.emailComms'), desc: 'Informes semanales de tu zona' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-card rounded-2xl p-6 max-w-[480px] w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-2xl">🌲</div>
          <h2 className="text-xl font-bold text-foreground">ProcesoCat</h2>
        </div>

        <h3 className="text-lg font-bold text-foreground text-center mb-1">{t('gdpr.title')}</h3>
        <p className="text-sm text-muted-foreground text-center mb-6">{t('gdpr.subtitle')}</p>

        {/* Toggles */}
        <div className="space-y-4 mb-6">
          {toggles.map(item => (
            <div key={item.key} className="flex items-start gap-3">
              <Switch
                checked={consent[item.key]}
                disabled={item.disabled}
                onCheckedChange={v => setConsent(prev => ({ ...prev, [item.key]: v }))}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button onClick={acceptAll} className="flex-1 h-11 rounded-xl">
            {t('gdpr.acceptAll')}
          </Button>
          <Button variant="outline" onClick={essentialOnly} className="flex-1 h-11 rounded-xl">
            {t('gdpr.essentialOnly')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GDPRModal;
