import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface Badge {
  id: string;
  name_es: string;
  name_ca: string;
  icon: string;
  points_bonus: number;
  requirement_es: string;
  requirement_ca: string;
}

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
}

const BadgeUnlockModal = ({ badge, onClose }: BadgeUnlockModalProps) => {
  const { t, i18n } = useTranslation();
  if (!badge) return null;

  const lang = i18n.language;
  const name = lang === 'ca' ? badge.name_ca : badge.name_es;
  const desc = lang === 'ca' ? badge.requirement_ca : badge.requirement_es;

  const shareWhatsApp = () => {
    const msg = `¡He conseguido la medalla ${name} en ProcesoAlert! 🏅 procesoalert.es`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#2D6A4F', '#eab308', '#ef4444', '#3b82f6', '#a855f7', '#f97316'][i % 6],
              animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in forwards`,
              animationDelay: `${Math.random() * 0.5}s`,
              top: '-10px',
            }}
          />
        ))}
      </div>
      <div
        className="relative z-10 bg-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-7xl mb-4 animate-bounce">{badge.icon}</div>
        <p className="text-xl font-bold text-primary mb-1">{t('badges.newUnlocked')}</p>
        <p className="text-lg font-semibold text-foreground mb-1">{name}</p>
        <p className="text-sm text-muted-foreground mb-3">{desc}</p>
        {badge.points_bonus > 0 && (
          <p className="text-orange-500 font-bold mb-4">+{badge.points_bonus} {lang === 'ca' ? 'punts bonus' : 'puntos bonus'}</p>
        )}
        <div className="space-y-2">
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={shareWhatsApp}>
            {t('profile.shareWhatsApp')}
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('profile.continue')}
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default BadgeUnlockModal;
