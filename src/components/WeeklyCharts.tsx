import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { mockWeeklyData, ALERT_TYPES } from '@/data/mockData';
import { usePlanFeature } from '@/hooks/usePlanFeature';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lock, Download, BarChart3 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';

const DAYS_CA = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const DAYS_ES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const PIE_COLORS: Record<string, string> = {
  procesionaria: '#a855f7',
  veneno: '#ef4444',
  trampa: '#f97316',
  basura: '#eab308',
};

const BAR_COLORS: Record<number, string> = {
  35: '#22c55e',
  42: '#eab308',
  58: '#f97316',
  67: '#ef4444',
};

const WeeklyCharts = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canAccess } = usePlanFeature();
  const lang = i18n.language;
  const [pdfLoading, setPdfLoading] = useState(false);

  const hasAccess = canAccess('charts');
  const days = lang === 'ca' ? DAYS_CA : DAYS_ES;
  const d = mockWeeklyData;

  // Line chart data
  const lineData = days.map((day, i) => {
    const point: Record<string, any> = { day };
    d.zones.forEach(z => { point[z.name] = z.data[i]; });
    return point;
  });

  // Pie chart data
  const totalAlerts = Object.values(d.alertTypes).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(d.alertTypes).map(([key, val]) => ({
    name: lang === 'ca' ? ALERT_TYPES[key as keyof typeof ALERT_TYPES]?.name_ca : ALERT_TYPES[key as keyof typeof ALERT_TYPES]?.name_es,
    value: val,
    color: PIE_COLORS[key] || '#9ca3af',
  }));

  // Activity bars
  const activityData = [
    { name: 'Reports', value: d.personalActivity.reports, fill: '#2D6A4F' },
    { name: lang === 'ca' ? 'Validacions' : 'Validaciones', value: d.personalActivity.validations, fill: '#3b82f6' },
    { name: lang === 'ca' ? 'Fotos' : 'Fotos', value: d.personalActivity.photos, fill: '#f97316' },
    { name: lang === 'ca' ? 'Compartits' : 'Compartidos', value: d.personalActivity.shares, fill: '#25D366' },
  ];

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    setTimeout(() => {
      setPdfLoading(false);
      toast({ title: t('reports.generated'), description: lang === 'ca' ? 'En producció es descarregarà automàticament.' : 'En producción se descargará automáticamente.' });
    }, 2000);
  };

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} className="text-primary" />
            <h3 className="font-semibold text-foreground">📊 {t('reports.title')}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {lang === 'ca' ? 'Gràfica d\'activitat setmanal · Tipus d\'alerta · Evolució mensual' : 'Gráfica de actividad semanal · Tipos de alerta · Evolución mensual'}
          </p>
          <div className="relative">
            <div className="filter blur-[6px] pointer-events-none select-none opacity-60">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={lineData}>
                  <Line type="monotone" dataKey={d.zones[0].name} stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey={d.zones[1].name} stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 bg-background/40 flex flex-col items-center justify-center rounded-lg">
              <Lock className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm font-semibold text-foreground text-center">{t('reports.blurredTitle')}</p>
              <p className="text-xs text-muted-foreground text-center mb-3">{t('reports.blurredSubtitle')}</p>
              <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => navigate('/pricing')}>
                ⚡ {t('reports.unlockButton')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" />
        <h3 className="font-semibold text-foreground">📊 {t('reports.title')}</h3>
        <span className="text-xs text-muted-foreground ml-auto">{d.week}</span>
      </div>

      {/* Chart 1: Weekly Zone Activity */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{t('reports.weeklyActivity')}</h4>
          <p className="text-xs text-muted-foreground mb-3">{lang === 'ca' ? 'Nivell de perill dels últims 7 dies' : 'Nivel de peligro de los últimos 7 días'}</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              {d.zones.map(z => (
                <Line key={z.name} type="monotone" dataKey={z.name} stroke={z.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Alert Types Donut */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{t('reports.alertTypes')}</h4>
          <p className="text-xs text-muted-foreground mb-3">{lang === 'ca' ? 'Aquesta setmana a les teves zones' : 'Esta semana en tus zonas'}</p>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-xl font-bold text-foreground">{totalAlerts}</p>
              <p className="text-[10px] text-muted-foreground">total</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap mt-2">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                <span className="text-[11px] text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Monthly Comparison */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{t('reports.monthlyEvolution')}</h4>
          <p className="text-xs text-muted-foreground mb-3">{lang === 'ca' ? 'Comparativa últimes 4 setmanes' : 'Comparativa últimas 4 semanas'}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={d.weeklyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {d.weeklyComparison.map((entry, i) => (
                  <Cell key={i} fill={BAR_COLORS[entry.avg] || (entry.avg < 40 ? '#22c55e' : entry.avg < 55 ? '#eab308' : entry.avg < 65 ? '#f97316' : '#ef4444')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Personal Activity */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{t('reports.personalActivity')}</h4>
          <p className="text-xs text-muted-foreground mb-3">{lang === 'ca' ? 'Aquesta setmana' : 'Esta semana'}</p>
          <div className="space-y-3">
            {activityData.map(item => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 text-right">{item.name}</span>
                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((item.value / 25) * 100, 100)}%`, backgroundColor: item.fill }}
                  >
                    <span className="text-[11px] font-semibold text-white">{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Download PDF */}
      <Button variant="outline" className="w-full border-primary text-primary" onClick={handleDownloadPDF} disabled={pdfLoading}>
        {pdfLoading ? (
          <><span className="animate-spin mr-2">⏳</span> {t('reports.generating')}</>
        ) : (
          <><Download size={16} className="mr-2" /> {t('reports.downloadPDF')}</>
        )}
      </Button>

      {/* Links */}
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" className="text-xs text-primary flex-1" onClick={() => navigate('/reports')}>
          📊 {t('reports.fullReport')}
        </Button>
      </div>
    </div>
  );
};

export default WeeklyCharts;
