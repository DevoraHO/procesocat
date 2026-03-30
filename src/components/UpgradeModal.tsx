import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, Bell, MapPin, Route, FileText, Video, X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger?: string;
}

const UpgradeModal = ({ open, onClose, trigger }: UpgradeModalProps) => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const petName = user?.pet_name || 'Max';

  const features = [
    { icon: Bell, key: 'upgrade.feat1' },
    { icon: Route, key: 'upgrade.feat2' },
    { icon: MapPin, key: 'upgrade.feat3' },
    { icon: Video, key: 'upgrade.feat4' },
    { icon: FileText, key: 'upgrade.feat5' },
  ];

  const handleUpgrade = () => {
    updateProfile({ plan: 'familiar' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(153,51%,25%)] px-6 pt-8 pb-6 text-center relative">
          <button onClick={onClose} className="absolute top-3 right-3 text-white/60 hover:text-white">
            <X size={20} />
          </button>
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-white text-xl font-bold">
              {t('upgrade.title', { name: petName })}
            </DialogTitle>
            <DialogDescription className="text-white/80 text-sm">
              {t('upgrade.subtitle')}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Trigger context */}
        {trigger && (
          <div className="mx-6 mt-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
            🔒 {t(`upgrade.trigger_${trigger}`)}
          </div>
        )}

        {/* Features */}
        <div className="px-6 py-4 space-y-3">
          {features.map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">{t(key)}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="px-6 pb-6 space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold text-foreground">4,99€</span>
            <span className="text-muted-foreground text-sm">/{t('upgrade.month')}</span>
          </div>

          <Button onClick={handleUpgrade} className="w-full h-12 text-base font-semibold gap-2">
            <Shield className="h-5 w-5" />
            {t('upgrade.cta', { name: petName })}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t('upgrade.guarantee')}
          </p>

          <button onClick={onClose} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition">
            {t('upgrade.later')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
