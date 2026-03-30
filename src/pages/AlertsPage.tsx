import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { mockNotifications } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Shield, Lock } from 'lucide-react';
import UpgradeModal from '@/components/UpgradeModal';

const AlertsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isFree = user?.plan === 'free';
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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

        {/* Preview of what they'd get */}
        <div className="space-y-3 mb-8">
          {mockNotifications.slice(0, 3).map((n, i) => {
            const title = t(`lang`) === 'ca' ? n.title_ca : n.title_es;
            const body = t(`lang`) === 'ca' ? n.body_ca : n.body_es;
            return (
              <Card key={n.id} className={`text-left relative overflow-hidden ${i > 0 ? 'opacity-60' : ''}`}>
                <CardContent className="py-3 px-4">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 flex items-end justify-center pb-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>

        <Button onClick={() => setUpgradeOpen(true)} className="w-full h-12 text-base font-semibold gap-2">
          <Shield className="h-5 w-5" />
          {t('upgrade.cta', { name: user?.pet_name || 'Max' })}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">4,99€/{t('upgrade.month')} · {t('upgrade.guarantee')}</p>

        <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} trigger="alerts" />
      </div>
    );
  }

  // Premium users would see full notifications here
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5" /> {t('nav.alerts')}
        </h1>
        <Button variant="ghost" size="sm">{t('alerts.markAllRead')}</Button>
      </div>
      <div className="space-y-3">
        {mockNotifications.map(n => {
          const lang = t('nav.map') === 'Mapa' && t('nav.alerts') === 'Alertas' ? 'es' : 'ca';
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
    </div>
  );
};

export default AlertsPage;
