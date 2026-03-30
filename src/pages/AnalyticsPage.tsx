import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  mockWeeklyReports, mockTemporalHeatmap, mockAlertDistribution,
  mockMunicipalWeekly, mockDangerEvolution, ALERT_TYPES
} from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import UpgradeModal from '@/components/UpgradeModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, Lock, Download, TrendingUp, Clock, PieChart as PieIcon, Shield } from 'lucide-react';

const COLORS = ['#a855f7', '#ef4444', '#f97316', '#6b7280'];

const AnalyticsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = i18n.language;
  const plan = user?.plan || 'free';
  const isFree = plan === 'free';
  const isMunicipality = plan === 'municipi';
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const alertName = (type: string) => {
    const at = ALERT_TYPES[type as keyof typeof ALERT_TYPES];
    return at ? (lang === 'ca' ? at.name_ca : at.name_es) : type;
  };

  const pieData = mockAlertDistribution.map(d => ({
    name: alertName(d.type),
    value: d.count,
    icon: ALERT_TYPES[d.type as keyof typeof ALERT_TYPES]?.icon || '📍',
  }));

  const DAYS = lang === 'ca'
    ? ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']
    : ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  const BlurOverlay = ({ children, showUpgrade = true }: { children: React.ReactNode; showUpgrade?: boolean }) => (
    <div className="relative">
      <div className="filter blur-md pointer-events-none select-none opacity-60">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm rounded-lg">
        <Lock className="h-8 w-8 text-primary mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">{t('analytics.locked')}</p>
        <p className="text-xs text-muted-foreground mb-3">{t('analytics.unlockWith')}</p>
        {showUpgrade && (
          <Button size="sm" onClick={() => setUpgradeOpen(true)} className="gap-1">
            <Shield className="h-4 w-4" />
            {t('analytics.upgradeCta')}
          </Button>
        )}
      </div>
    </div>
  );

  const WeeklyBarChart = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t('analytics.weeklyReports')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={mockWeeklyReports}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="procesionaria" name={alertName('procesionaria')} fill="#a855f7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="veneno" name={alertName('veneno')} fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="trampa" name={alertName('trampa')} fill="#f97316" radius={[4, 4, 0, 0]} />
            <Bar dataKey="basura" name={alertName('basura')} fill="#6b7280" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const DistributionPie = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-primary" />
          {t('analytics.distribution')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TemporalHeatmapChart = () => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    mockTemporalHeatmap.forEach(d => { grid[d.day][d.hour] = d.intensity; });

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {t('analytics.temporalHeatmap')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[500px]">
              <div className="flex gap-0.5 mb-1 ml-8">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className="flex-1 text-[9px] text-center text-muted-foreground">
                    {h % 3 === 0 ? `${h}h` : ''}
                  </div>
                ))}
              </div>
              {DAYS.map((day, di) => (
                <div key={di} className="flex gap-0.5 items-center">
                  <span className="text-xs text-muted-foreground w-7 text-right mr-1">{day}</span>
                  {Array.from({ length: 24 }, (_, h) => {
                    const v = grid[di][h];
                    const opacity = v / 100;
                    return (
                      <div
                        key={h}
                        className="flex-1 h-5 rounded-sm transition-colors"
                        style={{ backgroundColor: v > 0 ? `rgba(45, 106, 79, ${opacity})` : 'hsl(var(--muted))' }}
                        title={`${day} ${h}:00 — ${v}%`}
                      />
                    );
                  })}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 justify-center">
                <span className="text-xs text-muted-foreground">{t('analytics.less')}</span>
                {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
                  <div key={o} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(45, 106, 79, ${o})` }} />
                ))}
                <span className="text-xs text-muted-foreground">{t('analytics.more')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DangerTrendChart = () => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {t('analytics.dangerTrend')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockDangerEvolution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip />
            <defs>
              <linearGradient id="dangerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="score" stroke="#ef4444" fill="url(#dangerGrad)" strokeWidth={2} name={t('analytics.dangerScore')} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const MunicipalCharts = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('analytics.municipalReports')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mockMunicipalWeekly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="reportes" name={t('analytics.totalReports')} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resueltos" name={t('analytics.resolved')} fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('analytics.avgResponseTime')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockMunicipalWeekly}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis unit="h" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip />
              <Line type="monotone" dataKey="tiempo_medio_h" stroke="#f59e0b" strokeWidth={2} name={t('analytics.hoursAvg')} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => toast({ title: t('analytics.exportMock') })}>
          <Download className="h-4 w-4" /> CSV
        </Button>
        <Button variant="outline" className="flex-1 gap-2" onClick={() => toast({ title: t('analytics.exportMock') })}>
          <Download className="h-4 w-4" /> GeoJSON
        </Button>
        <Button className="flex-1 gap-2" onClick={() => toast({ title: t('analytics.pdfMock') })}>
          <Download className="h-4 w-4" /> PDF
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          {t('analytics.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('analytics.subtitle')}</p>
      </div>

      {isMunicipality ? (
        <Tabs defaultValue="personal">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="personal">{t('analytics.personal')}</TabsTrigger>
            <TabsTrigger value="municipal">{t('analytics.municipal')}</TabsTrigger>
          </TabsList>
          <TabsContent value="personal" className="space-y-4 mt-4">
            <WeeklyBarChart />
            <DistributionPie />
            <TemporalHeatmapChart />
            <DangerTrendChart />
          </TabsContent>
          <TabsContent value="municipal" className="space-y-4 mt-4">
            <MunicipalCharts />
          </TabsContent>
        </Tabs>
      ) : isFree ? (
        <div className="space-y-4">
          {/* Show blurred preview for free users */}
          <BlurOverlay><WeeklyBarChart /></BlurOverlay>
          <BlurOverlay><DistributionPie /></BlurOverlay>
          <BlurOverlay><TemporalHeatmapChart /></BlurOverlay>
          <BlurOverlay><DangerTrendChart /></BlurOverlay>
        </div>
      ) : (
        <div className="space-y-4">
          <WeeklyBarChart />
          <DistributionPie />
          <TemporalHeatmapChart />
          <DangerTrendChart />
          <Button className="w-full gap-2" onClick={() => toast({ title: t('analytics.pdfMock') })}>
            <Download className="h-4 w-4" />
            {t('analytics.downloadPdf')}
          </Button>
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} trigger="analytics" />
    </div>
  );
};

export default AnalyticsPage;
