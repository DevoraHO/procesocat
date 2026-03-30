import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Map, Info, Trophy, Bell, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import LanguageToggle from './LanguageToggle';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { key: 'map', path: '/map', icon: Map, activeColor: '#2D6A4F' },
  { key: 'info', path: '/info', icon: Info, activeColor: '#2D6A4F' },
  { key: 'ranking', path: '/ranking', icon: Trophy, activeColor: '#2D6A4F' },
  { key: 'alerts', path: '/alerts', icon: Bell, activeColor: '#2D6A4F' },
  { key: 'plans', path: '/plans', icon: Shield, activeColor: '#F59E0B' },
  { key: 'profile', path: '/profile', icon: User, activeColor: '#2D6A4F' },
];

const TopNavbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="hidden md:flex items-center h-14 border-b bg-background px-6 sticky top-0 z-50">
      <span
        className="font-bold text-lg mr-8 cursor-pointer"
        style={{ color: '#2D6A4F' }}
        onClick={() => navigate('/map')}
      >
        🐛 ProcesoCat
      </span>
      <nav className="flex items-center gap-1 flex-1">
        {tabs.map(({ key, path, icon: Icon, activeColor }) => {
          const active = location.pathname === path;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors',
                active ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
              style={active ? { color: activeColor } : undefined}
            >
              <Icon size={18} />
              {t(`nav.${key}`)}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        {!user && (
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium px-3 py-1.5 rounded-md text-white"
            style={{ backgroundColor: '#2D6A4F' }}
          >
            {t('auth.login')}
          </button>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
