import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Info, Trophy, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'map', path: '/map', icon: Map },
  { key: 'info', path: '/info', icon: Info },
  { key: 'ranking', path: '/ranking', icon: Trophy },
  { key: 'alerts', path: '/alerts', icon: Bell },
  { key: 'profile', path: '/profile', icon: User },
];

const BottomTabBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background flex items-center justify-around md:hidden">
      {tabs.map(({ key, path, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors',
              active ? 'font-semibold' : 'text-muted-foreground'
            )}
            style={active ? { color: '#2D6A4F' } : undefined}
          >
            <Icon size={22} />
            <span>{t(`nav.${key}`)}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
