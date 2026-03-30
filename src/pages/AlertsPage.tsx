import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { fetchNotifications, markAllNotificationsRead } from '@/lib/supabase-queries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Shield, Lock } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';

interface Notification {
  id: string;
  type: string;
  title_es: string;
  title_ca: string;
  body_es: string;
  body_ca: string;
  read: boolean;
  created_at: string;
}

const AlertsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language;
  const isFree = user?.plan === 'free';
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user || isFree) return;
    const load = async () => {
      const data = await fetchNotifications(user.id);
      setNotifications(data as Notification[]);
    };
    load();
  }, [user, isFree]);

  if (isFree) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Bell className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('subscription.upgradePrompt')}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {t('upgrade.subtitle')}
        </p>

        <Button onClick={() => setUpgradeOpen(true)} className="w-full h-12 text-base font-semibold gap-2">
          <Shield className="h-5 w-5" />
          {t('upgrade.cta', { name: user?.pet_name || 'Max' })}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">4,99€/{t('upgrade.month')} · {t('upgrade.guarantee')}</p>

        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} trigger="alerts" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5" /> {t('nav.alerts')}
        </h1>
        <Button variant="ghost" size="sm" onClick={() => user && markAllNotificationsRead(user.id)}>{t('alerts.markAllRead')}</Button>
      </div>
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <BellOff className="mx-auto text-muted-foreground mb-3" size={40} />
          <p className="text-sm text-muted-foreground">
            {lang === 'ca' ? 'No tens notificacions encara' : 'No tienes notificaciones aún'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const title = lang === 'ca' ? n.title_ca : n.title_es;
            const body = lang === 'ca' ? n.body_ca : n.body_es;
            return (
              <Card key={n.id} className={!n.read ? 'border-primary/30 bg-primary/5' : ''}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
