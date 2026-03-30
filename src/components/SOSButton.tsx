import { useState, useRef } from 'react';
import { Phone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const SOSButton = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLongPress = () => {
    let count = 3;
    setCountdown(count);
    timerRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setCountdown(null);
        window.location.href = 'tel:112';
      } else {
        setCountdown(count);
      }
    }, 1000);
    pressRef.current = setTimeout(() => {}, 3000);
  };

  const endLongPress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(null);
    setOpen(true);
  };

  return (
    <>
      <button
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={endLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        className="fixed bottom-20 right-4 z-[9998] w-14 h-14 rounded-full flex items-center justify-center shadow-lg md:bottom-6"
        style={{ backgroundColor: '#CC0000' }}
        aria-label="SOS"
      >
        {countdown !== null ? (
          <span className="text-white text-xl font-bold">{countdown}</span>
        ) : (
          <Phone className="text-white" size={24} />
        )}
        <span className="absolute inset-0 rounded-full animate-sos-pulse" style={{ backgroundColor: '#CC0000' }} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">{t('sos.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-center text-sm text-muted-foreground">
            Tu ubicación: 41.4036, 2.1744
          </p>
          {user?.pet_name && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              🐕 {t('sos.dogSymptoms')}
            </div>
          )}
          <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">
            👶 {t('sos.childSymptoms')}
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              className="w-full"
              style={{ backgroundColor: '#CC0000' }}
              onClick={() => { window.location.href = 'tel:112'; }}
            >
              <Phone size={18} /> {t('sos.call')}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              <X size={18} /> {t('sos.cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;
