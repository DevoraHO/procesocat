import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { mockMunicipiData, ALERT_TYPES } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import DangerBadge from '@/components/DangerBadge';
import { Download, Mail, ChevronLeft, ChevronRight, FileText, FileSpreadsheet, MapPin } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie,
} from 'recharts';

const MunicipiDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = i18n.language;
  const d = mockMunicipiData;
  const [weekOffset, setWeekOffset] = useState(0);

  const pctChange = d.previousWeekAvg > 0 ? Math.round(((d.avgDangerScore - d.previousWeekAvg) / d.previousWeekAvg) * 100) : 0;

  const pieData = Object.entries(d.alertTypeBreakdown).map(([key, val]) => ({
    name: lang === 'ca' ? ALERT_TYPES[key as keyof typeof ALERT_TYPES]?.name_ca : ALERT_TYPES[key as keyof typeof ALERT_TYPES]?.name_es,
    value: val,
    color: ALERT_TYPES[key as keyof typeof ALERT_TYPES]?.color || '#9ca3af',
  }));

  const hourlyChartData = d.hourlyData.map((v, i) => ({ hour: `${i}h`, value: v, peak: v >= 8 }));

  const mockToast = (msg: string) => toast({ title: msg });

  // Gauge
  const gaugeAngle = (d.avgDangerScore / 100) * 180;
  const gaugeLabel = d.avgDangerScore >= 80 ? (lang === 'ca' ? 'PERILL CRÍTIC' : 'PELIGRO CRÍTICO') :
    d.avgDangerScore >= 60 ? (lang === 'ca' ? 'PERILL ALT' : 'PELIGRO ALTO') :
    d.avgDangerScore >= 40 ? (lang === 'ca' ? 'PERILL MODERAT' : 'PELIGRO MODERADO') :
    d.avgDangerScore >= 20 ? (lang === 'ca' ? 'PRECAUCIÓ' : 'PRECAUCIÓN') :
    (lang === 'ca' ? 'SENSE PERILL' : 'SIN PELIGRO');

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="py-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold text-primary">🌲</span>
          <h1 className="text-xl font-bold text-foreground">ProcesoAlert · {lang === 'ca' ? 'Panel Municipal' : 'Panel Municipal'}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{d.municipality} — {d.comarca}</p>
        <div className="flex items-center gap-2 mt-3">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft size={16} /></Button>
          <span className="text-sm font-medium text-foreground">{t('reports.weekSelector', { week: `13/${2026 + weekOffset}` })}</span>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}><ChevronRight size={16} /></Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Ref: {d.ref}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: lang === 'ca' ? 'Total alertes' : 'Total alertas', val: d.totalAlerts, sub: `vs ${d.previousWeekAvg} ${t('reports.vsLastWeek')} ${pctChange > 0 ? '↑' : '↓'}${Math.abs(pctChange)}%`, color: 'text-foreground' },
          { label: lang === 'ca' ? 'Alertes crítiques' : 'Alertas críticas', val: d.criticalZones, sub: '🔴', color: 'text-destructive' },
          { label: lang === 'ca' ? 'Alertes resoltes' : 'Alertas resueltas', val: d.resolvedAlerts, sub: '✅', color: 'text-primary' },
          { label: lang === 'ca' ? 'Usuaris actius' : 'Usuarios activos', val: 47, sub: lang === 'ca' ? 'aquesta setmana' : 'esta semana', color: 'text-foreground' },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.val}</p>
              <p className="text-[10px] text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Danger Gauge */}
      <Card className="mb-6">
        <CardContent className="pt-6 flex flex-col items-center">
          <h4 className="text-sm font-semibold text-foreground mb-4">{t('reports.dangerGauge')}</h4>
          <div className="relative w-48 h-28">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="33%" stopColor="#eab308" />
                  <stop offset="66%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(gaugeAngle / 180) * 251.2} 251.2`} />
              <text x="100" y="85" textAnchor="middle" className="text-3xl font-bold" fill="hsl(var(--foreground))" fontSize="28">{d.avgDangerScore}</text>
              <text x="100" y="105" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="10">{gaugeLabel}</text>
            </svg>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {d.trend === 'increasing' ? '↑' : '↓'} +{d.avgDangerScore - d.previousWeekAvg} {t('reports.vsLastWeek')}
          </p>
        </CardContent>
      </Card>

      {/* Chart 1: Monthly Trend */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{lang === 'ca' ? "Tendència mensual d'alertes" : 'Tendencia mensual de alertas'}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={d.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 2: Top 5 Zones */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">{t('reports.topZones')}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.topZones} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={130} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Bar dataKey="alerts" radius={[0, 4, 4, 0]}>
                {d.topZones.map((z, i) => (
                  <Cell key={i} fill={z.avgScore >= 80 ? '#ef4444' : z.avgScore >= 60 ? '#f97316' : z.avgScore >= 40 ? '#eab308' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 3: Hourly Distribution */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-1">{t('reports.hourlyDistribution')}</h4>
          <p className="text-xs text-muted-foreground mb-3">{lang === 'ca' ? "A quina hora es reporten més alertes" : 'A qué hora se reportan más alertas'}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} interval={2} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {hourlyChartData.map((h, i) => (
                  <Cell key={i} fill={h.peak ? '#ef4444' : 'hsl(var(--primary))'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Chart 4: Alert Type Pie */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">{t('reports.alertTypes')}</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-3 justify-center flex-wrap">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                <span className="text-[11px] text-muted-foreground">{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">{lang === 'ca' ? "Alertes de la setmana" : 'Alertas de la semana'}</h4>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => mockToast(lang === 'ca' ? 'CSV exportat (mock)' : 'CSV exportado (mock)')}>
              {t('reports.exportCSV')}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{lang === 'ca' ? 'Zona' : 'Zona'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Alertes' : 'Alertas'}</TableHead>
                  <TableHead>{lang === 'ca' ? 'Nivell' : 'Nivel'}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.topZones.map(z => (
                  <TableRow key={z.name}>
                    <TableCell className="text-sm">{z.name}</TableCell>
                    <TableCell className="text-sm">{z.alerts}</TableCell>
                    <TableCell><DangerBadge score={z.avgScore} size="sm" /></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/map')}>
                        <MapPin size={14} className="mr-1" /> {lang === 'ca' ? 'Mapa' : 'Mapa'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <Button variant="default" onClick={() => mockToast(lang === 'ca' ? 'PDF generat (mock)' : 'PDF generado (mock)')}>
          <FileText size={16} className="mr-1" /> PDF {lang === 'ca' ? 'Oficial' : 'Oficial'}
        </Button>
        <Button variant="outline" onClick={() => mockToast('CSV (mock)')}>
          <FileSpreadsheet size={16} className="mr-1" /> CSV
        </Button>
        <Button variant="outline" onClick={() => mockToast('GeoJSON (mock)')}>
          🗺️ GeoJSON
        </Button>
        <Button variant="outline" onClick={() => mockToast(lang === 'ca' ? 'Email enviat (mock)' : 'Email enviado (mock)')}>
          <Mail size={16} className="mr-1" /> {t('reports.sendToTechnician')}
        </Button>
      </div>
    </div>
  );
};

export default MunicipiDashboard;
