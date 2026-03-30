import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mockRanking, mockUser, mockStats } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from '@/components/UserAvatar';
import { Trophy, ChevronDown, Info, ArrowUp, ArrowDown, Copy, X } from 'lucide-react';

const RankingPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const lang = i18n.language;
  const [tab, setTab] = useState<'comarca' | 'catalunya'>('comarca');
  const [shareOpen, setShareOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);

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

  const userIdx = mockRanking.findIndex(r => r.name === mockUser.name);
  const userPos = userIdx + 1;
  const nextUser = userIdx > 0 ? mockRanking[userIdx - 1] : null;
  const ptsToNext = nextUser ? nextUser.weekly_points - mockUser.weekly_points : 0;

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

  const arrows = useMemo(() => mockRanking.map(() => Math.random() > 0.5), []);

  const whatsappMsg = lang === 'ca'
    ? `Aquesta setmana sóc el #${userPos} a ProcesoAlert 🌲 He reportat processionària a Catalunya per protegir mascotes i famílies. Uneix-te: procesoalert.es`
    : `Esta semana soy el #${userPos} en ProcesoAlert 🌲 He reportado procesionaria en Cataluña para proteger mascotas y familias. Únete: procesoalert.es`;

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
          {t('ranking.comarca')} (Barcelonès)
        </button>
        <button onClick={() => setTab('catalunya')} className={`flex-1 text-sm py-2 rounded-lg font-medium transition ${tab === 'catalunya' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
          {t('ranking.catalunya')}
        </button>
      </div>

      {/* Weekly Winner Banner */}
      <Card className="mb-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="py-3 flex items-center gap-3">
          <span className="text-3xl">👑</span>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{lang === 'ca' ? 'Campió de la setmana passada' : 'Campeón de la semana pasada'}</p>
            <div className="flex items-center gap-2 mt-1">
              <UserAvatar name={mockRanking[0].name} avatar_url={null} size="sm" />
              <div>
                <p className="text-sm font-semibold text-foreground">{mockRanking[0].name}</p>
                <p className="text-xs text-muted-foreground">{mockRanking[0].rank} · 520 pts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 pt-4 pb-6">
        {/* #2 - left */}
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-1">🥈</span>
          <UserAvatar name={mockRanking[1].name} avatar_url={null} size="md" />
          <p className="text-xs font-medium mt-1 text-foreground truncate max-w-[80px]">{mockRanking[1].name.split(' ')[0]}</p>
          <p className="text-[10px] text-muted-foreground">{mockRanking[1].rank}</p>
          <p className="text-xs text-muted-foreground">{mockRanking[1].weekly_points} pts</p>
          <div className="w-16 bg-muted rounded-t-lg mt-2" style={{ height: 80 }} />
        </div>

        {/* #1 - center */}
        <div className="flex flex-col items-center">
          <span className="text-3xl mb-1">👑</span>
          <div className="ring-2 ring-yellow-400 rounded-full">
            <UserAvatar name={mockRanking[0].name} avatar_url={null} size="lg" />
          </div>
          <p className="text-sm font-bold mt-1 text-foreground">{mockRanking[0].name.split(' ')[0]}</p>
          <p className="text-[10px] text-muted-foreground">{mockRanking[0].rank}</p>
          <p className="text-sm font-bold text-primary">{mockRanking[0].weekly_points} pts</p>
          <div className="w-20 bg-primary/20 rounded-t-lg mt-2" style={{ height: 110 }} />
        </div>

        {/* #3 - right */}
        <div className="flex flex-col items-center">
          <span className="text-2xl mb-1">🥉</span>
          <div className={mockRanking[2].name === mockUser.name ? 'ring-2 ring-primary rounded-full' : ''}>
            <UserAvatar name={mockRanking[2].name} avatar_url={null} size="md" />
          </div>
          <p className="text-xs font-medium mt-1 text-foreground truncate max-w-[80px]">{mockRanking[2].name.split(' ')[0]}</p>
          <p className="text-[10px] text-muted-foreground">{mockRanking[2].rank}</p>
          <p className="text-xs text-muted-foreground">{mockRanking[2].weekly_points} pts</p>
          <div className={`w-16 rounded-t-lg mt-2 ${mockRanking[2].name === mockUser.name ? 'bg-primary/10' : 'bg-muted'}`} style={{ height: 60 }} />
        </div>
      </div>

      {/* List positions 4-8 */}
      <div className="space-y-2 mb-4">
        {mockRanking.slice(3).map((r, i) => {
          const isUser = r.name === mockUser.name;
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
            {lang === 'ca' ? `La teva posició: #${userPos} · ${mockUser.weekly_points} pts aquesta setmana` : `Tu posición: #${userPos} · ${mockUser.weekly_points} pts esta semana`}
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
            <p className="font-bold text-lg mb-3">🌲 ProcesoAlert</p>
            <div className="flex justify-center mb-2">
              <div className="border-2 border-white rounded-full">
                <UserAvatar name={mockUser.name} avatar_url={null} size="lg" />
              </div>
            </div>
            <p className="font-bold text-lg">{mockUser.name}</p>
            <p className="text-sm opacity-90 mt-1">#{userPos} {lang === 'ca' ? 'aquesta setmana a' : 'esta semana en'} Barcelonès</p>
            <div className="border-t border-white/20 my-3" />
            <p className="text-xs opacity-80">
              {mockStats.totalReports} {lang === 'ca' ? 'reports' : 'reportes'} · {mockStats.totalValidations} {lang === 'ca' ? 'validacions' : 'validaciones'} · {mockRanking[userIdx]?.rank}
            </p>
            <span className="inline-block mt-2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">{mockUser.weekly_points} pts {lang === 'ca' ? 'aquesta setmana' : 'esta semana'}</span>
            <p className="text-[10px] opacity-60 mt-3">procesoalert.es</p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, '_blank')}>
              📱 {lang === 'ca' ? 'Compartir a WhatsApp' : 'Compartir en WhatsApp'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText('procesoalert.es'); toast({ title: lang === 'ca' ? 'Enllaç copiat!' : '¡Enlace copiado!' }); }}>
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
