import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRanking } from '@/lib/supabase-queries';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from '@/components/UserAvatar';
import { Trophy, ChevronDown, Info, ArrowUp, ArrowDown, Copy, X } from 'lucide-react';

interface RankingUser {
  id: string;
  name: string;
  rank: string;
  points: number;
  weekly_points: number;
  avatar_url: string | null;
  municipality_id?: string | null;
}

const RankingPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const lang = i18n.language;
  const [tab, setTab] = useState<'comarca' | 'catalunya'>('comarca');
  const [shareOpen, setShareOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [ranking, setRanking] = useState<RankingUser[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchRanking(50);
      if (data.length > 0) {
        setRanking(data as RankingUser[]);
      }
    };
    load();
  }, []);

  // Countdown to next Monday 00:00
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const day = now.getDay();
      const daysUntil = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
      const nextMon = new Date(now);
      nextMon.setDate(now.getDate() + daysUntil);
      nextMon.setHours(0, 0, 0, 0);
      const diff = nextMon.getTime() - now.getTime();
      setCountdown({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000) });
    };
    calc();
    const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, []);

  const userIdx = ranking.findIndex(r => r.id === user?.id);
  const userPos = userIdx >= 0 ? userIdx + 1 : ranking.length + 1;
  const nextUser = userIdx > 0 ? ranking[userIdx - 1] : null;
  const ptsToNext = nextUser && user ? nextUser.weekly_points - (user.weekly_points || 0) : 0;

  const POINTS_TABLE = [
    { action: lang === 'ca' ? 'Publicar report' : 'Publicar reporte', pts: 50 },
    { action: lang === 'ca' ? 'Afegir foto' : 'Añadir foto', pts: 30 },
    { action: lang === 'ca' ? 'Validar report' : 'Validar reporte', pts: 15 },
    { action: lang === 'ca' ? 'Confirmar niu actiu' : 'Confirmar nido activo', pts: 25 },
    { action: 'Login ' + (lang === 'ca' ? 'diari' : 'diario'), pts: 15 },
    { action: lang === 'ca' ? 'Ratxa 7 dies' : 'Racha 7 días', pts: 50 },
    { action: lang === 'ca' ? 'Ratxa 30 dies' : 'Racha 30 días', pts: 100 },
    { action: lang === 'ca' ? 'Referir amic' : 'Referir amigo', pts: 25 },
    { action: lang === 'ca' ? 'Referir subscriptor' : 'Referir suscriptor', pts: 150 },
  ];

  const arrows = useMemo(() => ranking.map(() => Math.random() > 0.5), [ranking]);

  const whatsappMsg = lang === 'ca'
    ? `Aquesta setmana sóc el #${userPos} a ProcesoCat 🌲 He reportat processionària a Catalunya per protegir mascotes i famílies. Uneix-te: procesocat.es`
    : `Esta semana soy el #${userPos} en ProcesoCat 🌲 He reportado procesionaria en Cataluña para proteger mascotas y familias. Únete: procesocat.es`;

  if (ranking.length === 0) {
    return (
      <div className="pb-24 max-w-lg mx-auto px-4 py-12 text-center">
        <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
        <h2 className="text-lg font-bold text-foreground mb-2">{t('ranking.weekly')}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === 'ca' ? 'Encara no hi ha usuaris al rànquing. Sigues el primer!' : 'Aún no hay usuarios en el ranking. ¡Sé el primero!'}
        </p>
      </div>
    );
  }

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4">
      {/* Header */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="text-primary" size={24} />
          <h1 className="text-xl font-bold text-foreground">{t('ranking.weekly')}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{lang === 'ca' ? 'Punts acumulats aquesta setmana · Es reinicia el dilluns' : 'Puntos acumulados esta semana · Se reinicia el lunes'}</p>
        <p className="text-xs text-muted-foreground mt-1">⏱ {lang === 'ca' ? `Falten ${countdown.days} dies ${countdown.hours} hores per al reinici` : `Faltan ${countdown.days} días ${countdown.hours} horas para el reinicio`}</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('comarca')} className={`flex-1 text-sm py-2 rounded-lg font-medium transition ${tab === 'comarca' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {t('ranking.comarca')}
        </button>
        <button onClick={() => setTab('catalunya')} className={`flex-1 text-sm py-2 rounded-lg font-medium transition ${tab === 'catalunya' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {t('ranking.catalunya')}
        </button>
      </div>

      {/* Weekly Winner Banner */}
      {top3.length > 0 && (
        <Card className="mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="py-3 flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{lang === 'ca' ? 'Campió de la setmana passada' : 'Campeón de la semana pasada'}</p>
              <div className="flex items-center gap-2 mt-1">
                <UserAvatar name={top3[0].name} avatar_url={top3[0].avatar_url} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{top3[0].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[0].rank} · {top3[0].weekly_points} pts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 pt-4 pb-6">
        {/* #2 - left */}
        {top3[1] && (
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🥈</span>
            <UserAvatar name={top3[1].name} avatar_url={top3[1].avatar_url} size="md" />
            <p className="text-xs font-medium mt-1 text-foreground truncate max-w-[80px]">{top3[1].name.split(' ')[0]}</p>
            <p className="text-[10px] text-muted-foreground">{top3[1].rank}</p>
            <p className="text-xs text-muted-foreground">{top3[1].weekly_points} pts</p>
            <div className="w-16 bg-muted rounded-t-lg mt-2" style={{ height: 80 }} />
          </div>
        )}

        {/* #1 - center */}
        {top3[0] && (
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">👑</span>
            <div className="ring-2 ring-yellow-400 rounded-full">
              <UserAvatar name={top3[0].name} avatar_url={top3[0].avatar_url} size="lg" />
            </div>
            <p className="text-sm font-bold mt-1 text-foreground">{top3[0].name.split(' ')[0]}</p>
            <p className="text-[10px] text-muted-foreground">{top3[0].rank}</p>
            <p className="text-sm font-bold text-primary">{top3[0].weekly_points} pts</p>
            <div className="w-20 bg-primary/20 rounded-t-lg mt-2" style={{ height: 110 }} />
          </div>
        )}

        {/* #3 - right */}
        {top3[2] && (
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🥉</span>
            <div className={top3[2].id === user?.id ? 'ring-2 ring-primary rounded-full' : ''}>
              <UserAvatar name={top3[2].name} avatar_url={top3[2].avatar_url} size="md" />
            </div>
            <p className="text-xs font-medium mt-1 text-foreground truncate max-w-[80px]">{top3[2].name.split(' ')[0]}</p>
            <p className="text-[10px] text-muted-foreground">{top3[2].rank}</p>
            <p className="text-xs text-muted-foreground">{top3[2].weekly_points} pts</p>
            <div className={`w-16 rounded-t-lg mt-2 ${top3[2].id === user?.id ? 'bg-primary/10' : 'bg-muted'}`} style={{ height: 60 }} />
          </div>
        )}
      </div>

      {/* List positions 4+ */}
      <div className="space-y-2 mb-4">
        {rest.map((r, i) => {
          const isUser = r.id === user?.id;
          return (
            <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl transition ${isUser ? 'bg-primary/10 border border-primary/20' : 'bg-card border'}`}>
              <span className="text-sm font-bold text-muted-foreground w-6">#{i + 4}</span>
              <UserAvatar name={r.name} avatar_url={r.avatar_url} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {r.name} {isUser && <span className="text-primary">⭐ {lang === 'ca' ? 'Tu' : 'Tú'}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{r.rank}</p>
              </div>
              {arrows[i + 3] ? <ArrowUp size={14} className="text-green-500" /> : <ArrowDown size={14} className="text-red-400" />}
              <span className="text-sm font-bold text-primary">{r.weekly_points}</span>
            </div>
          );
        })}
      </div>

      {/* User position card */}
      <Card className="bg-primary/5 border-primary/20 mb-4">
        <CardContent className="py-3 text-center">
          {userPos <= 3 ? (
            <p className="text-sm font-medium text-primary">🎉 {lang === 'ca' ? 'Ets al podi aquesta setmana!' : '¡Estás en el podio esta semana!'}</p>
          ) : null}
          <p className="text-sm font-medium text-foreground">
            {lang === 'ca' ? `La teva posició: #${userPos} · ${user?.weekly_points || 0} pts aquesta setmana` : `Tu posición: #${userPos} · ${user?.weekly_points || 0} pts esta semana`}
          </p>
          {nextUser && (
            <p className="text-xs text-muted-foreground mt-1">
              {lang === 'ca' ? `Necessites ${ptsToNext} pts més per superar ${nextUser.name}` : `Necesitas ${ptsToNext} pts más para superar a ${nextUser.name}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Share button */}
      <Button className="w-full mb-4" onClick={() => setShareOpen(true)}>📤 {t('ranking.share')}</Button>

      {/* How points work */}
      <Collapsible open={pointsOpen} onOpenChange={setPointsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground w-full py-2">
          <Info size={16} />
          <span>{lang === 'ca' ? 'Com es guanyen punts?' : '¿Cómo se ganan puntos?'}</span>
          <ChevronDown size={14} className={`ml-auto transition ${pointsOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2">
            <CardContent className="pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-muted-foreground font-medium">{lang === 'ca' ? 'Acció' : 'Acción'}</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">{lang === 'ca' ? 'Punts' : 'Puntos'}</th>
                  </tr>
                </thead>
                <tbody>
                  {POINTS_TABLE.map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-foreground">{r.action}</td>
                      <td className="py-2 text-right text-primary font-medium">+{r.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-3">
                {lang === 'ca' ? 'El rànquing setmanal es reinicia cada dilluns a les 00:00. Els punts totals mai es perden.' : 'El ranking semanal se reinicia cada lunes a las 00:00. Los puntos totales nunca se pierden.'}
              </p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Share Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('ranking.share')}</DialogTitle>
            <DialogDescription>{lang === 'ca' ? 'Comparteix el teu rànquing' : 'Comparte tu ranking'}</DialogDescription>
          </DialogHeader>

          {/* Preview card */}
          <div className="rounded-xl p-5 text-center text-white" style={{ background: '#1B4332' }}>
            <p className="font-bold text-lg mb-3">🌲 ProcesoCat</p>
            <div className="flex justify-center mb-2">
              <div className="border-2 border-white rounded-full">
                <UserAvatar name={user?.name || ''} avatar_url={user?.avatar_url || null} size="lg" />
              </div>
            </div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-sm opacity-90 mt-1">#{userPos} {lang === 'ca' ? 'aquesta setmana' : 'esta semana'}</p>
            <div className="border-t border-white/20 my-3" />
            <p className="text-xs opacity-80">{user?.rank}</p>
            <span className="inline-block mt-2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">{user?.weekly_points || 0} pts {lang === 'ca' ? 'aquesta setmana' : 'esta semana'}</span>
            <p className="text-[10px] opacity-60 mt-3">procesocat.es</p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, '_blank')}>
              📱 {lang === 'ca' ? 'Compartir a WhatsApp' : 'Compartir en WhatsApp'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText('procesocat.es'); toast({ title: lang === 'ca' ? 'Enllaç copiat!' : '¡Enlace copiado!' }); }}>
              <Copy size={14} /> {lang === 'ca' ? 'Copiar enllaç' : 'Copiar enlace'}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShareOpen(false)}>
              <X size={14} /> {lang === 'ca' ? 'Tancar' : 'Cerrar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RankingPage;
