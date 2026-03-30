import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import Confetti from '@/components/Confetti';

interface Badge {
  id: string;
  name_es: string;
  name_ca: string;
  icon: string;
  points_bonus: number;
  requirement_es: string;
  requirement_ca: string;
  rarity?: string;
  rarity_color?: string;
}

interface BadgeUnlockModalProps {
  badge: Badge | null;
  onClose: () => void;
}

const RARITY_LEVELS = ['comú', 'inedit', 'rar', 'epic', 'llegenda'];

const BadgeUnlockModal = ({ badge, onClose }: BadgeUnlockModalProps) => {
  const { t, i18n } = useTranslation();
  if (!badge) return null;

  const lang = i18n.language;
  const name = lang === 'ca' ? badge.name_ca : badge.name_es;
  const desc = lang === 'ca' ? badge.requirement_ca : badge.requirement_es;
  const rarity = badge.rarity || 'comú';
  const rarityIdx = RARITY_LEVELS.indexOf(rarity);

  const confettiCount = rarity === 'comú' ? 10 : rarity === 'inedit' ? 20 : rarity === 'rar' ? 40 : rarity === 'epic' ? 60 : 80;
  const isEpicOrHigher = rarityIdx >= 3;
  const isLlegenda = rarity === 'llegenda';

  const shareWhatsApp = () => {
    const msg = lang === 'ca'
      ? `He aconseguit la medalla ${badge.icon} ${name} a ProcesoCat! 🏅 procesocat.es`
      : `¡He conseguido la medalla ${badge.icon} ${name} en ProcesoCat! 🏅 procesocat.es`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const bgColor = isLlegenda ? '#1B4332' : isEpicOrHigher ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)';
  const titleColor = isLlegenda ? '#f59e0b' : rarity === 'epic' ? '#a855f7' : rarity === 'rar' ? '#3b82f6' : rarity === 'inedit' ? '#22c55e' : undefined;
  const rarityLabel = rarity === 'comú' ? 'COMÚ' : rarity === 'inedit' ? 'INÈDIT' : rarity === 'rar' ? 'RAR' : rarity === 'epic' ? 'ÈPIC' : 'LLEGENDA';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose} style={{ backgroundColor: bgColor }}>
      <Confetti count={confettiCount} colors={isLlegenda ? ['#f59e0b', '#fbbf24', '#d97706', '#b45309', '#92400e'] : undefined} />

      {isLlegenda && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute text-2xl" style={{
              left: `${Math.random() * 100}%`,
              animation: `confetti-fall ${2 + Math.random() * 3}s ease-in forwards`,
              animationDelay: `${Math.random()}s`,
              top: '-30px',
            }}>✨</div>
          ))}
        </div>
      )}

      {rarity === 'epic' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute text-lg" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: 'pulse 2s infinite',
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.5,
            }}>⭐</div>
          ))}
        </div>
      )}

      <div
        className="relative z-10 bg-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className={`text-7xl mb-4 ${isEpicOrHigher ? 'animate-bounce' : ''}`} style={isEpicOrHigher ? { filter: `drop-shadow(0 0 12px ${badge.rarity_color || '#a855f7'})` } : {}}>
          {badge.icon}
        </div>

        {isLlegenda && (
          <p className="text-4xl mb-2">👑</p>
        )}

        <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold mb-2" style={{ backgroundColor: badge.rarity_color || '#9ca3af', color: 'white' }}>
          {rarityLabel}
        </span>

        <p className="text-xl font-bold mb-1" style={{ color: titleColor }}>
          {isLlegenda ? '👑 LLEGENDA DE CATALUNYA' : isEpicOrHigher ? `⚡ ${t('badges.newUnlocked').toUpperCase()}` : t('badges.newUnlocked')}
        </p>
        <p className="text-lg font-semibold text-foreground mb-1">{name}</p>
        <p className="text-sm text-muted-foreground mb-3">{desc}</p>
        {isLlegenda && <p className="text-sm text-amber-500 italic mb-3">Ets a l'Hall of Fame de ProcesoCat</p>}
        {badge.points_bonus > 0 && (
          <p className="text-orange-500 font-bold mb-4">+{badge.points_bonus} {lang === 'ca' ? 'punts bonus' : 'puntos bonus'}</p>
        )}
        <div className="space-y-2">
          <Button className="w-full" style={isLlegenda ? { backgroundColor: '#f59e0b', color: '#000' } : rarity === 'epic' ? { backgroundColor: '#a855f7' } : {}} onClick={shareWhatsApp}>
            {t('profile.shareWhatsApp')}
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            {t('profile.continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BadgeUnlockModal;
