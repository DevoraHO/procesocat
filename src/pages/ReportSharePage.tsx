import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchReportById, fetchProfile, type Report } from '@/lib/supabase-queries';
import { getDangerColor, getDangerLevel } from '@/utils/dangerScore';
import DangerBadge from '@/components/DangerBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const ReportSharePage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [reporterName, setReporterName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const data = await fetchReportById(id);
      setReport(data);
      if (data) {
        const profile = await fetchProfile(data.user_id);
        setReporterName(profile?.name || 'Anónimo');
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const daysAgo = report ? Math.floor((Date.now() - new Date(report.created_at).getTime()) / 86400000) : 0;

  useEffect(() => {
    if (!report || !mapRef.current || leafletRef.current) return;
    try {
      const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false, dragging: false }).setView([report.lat, report.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      const color = getDangerColor(report.danger_score);
      L.circleMarker([report.lat, report.lng], { radius: 12, color, fillColor: color, fillOpacity: 0.9, weight: 3 }).addTo(map);
      L.circle([report.lat, report.lng], { radius: 600, color, fillColor: color, fillOpacity: 0.15, weight: 0 }).addTo(map);
      leafletRef.current = map;
    } catch (err) {
      console.error('Share map init failed:', err);
    }
    return () => { if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; } };
  }, [report]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="bg-card rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🗺️</div>
          <h1 className="text-xl font-bold text-foreground mb-2">{t('publicReport.notFound')}</h1>
          <p className="text-muted-foreground mb-6">{t('publicReport.notFoundText')}</p>
          <Button onClick={() => navigate('/map')} className="w-full">{t('publicReport.goToMap')}</Button>
        </div>
      </div>
    );
  }

  const score = report.danger_score;
  const color = getDangerColor(score);
  const level = getDangerLevel(score);

  const getAdvice = () => {
    if (score <= 20) return { emoji: '✅', text: t('publicReport.adviceGreen') };
    if (score <= 40) return { emoji: '⚠️', text: t('publicReport.adviceYellow') };
    if (score <= 60) return { emoji: '🟠', text: t('publicReport.adviceOrange') };
    if (score <= 80) return { emoji: '🔴', text: t('publicReport.adviceRed') };
    return { emoji: '🟣', text: t('publicReport.advicePurple') };
  };

  const advice = getAdvice();
  const adviceBg = score <= 20 ? 'bg-green-50 border-green-200 text-green-800' :
    score <= 40 ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
    score <= 60 ? 'bg-orange-50 border-orange-200 text-orange-800' :
    score <= 80 ? 'bg-red-50 border-red-200 text-red-800' :
    'bg-purple-50 border-purple-200 text-purple-800';

  const shareWhatsApp = () => {
    const msg = `🔴 ${t('publicReport.whatsappText', { comarca: report.comarca, id: report.id })}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const copyLink = () => {
    try { navigator.clipboard.writeText(`${window.location.origin}/r/${report.id}`); } catch {}
    toast.success(t('publicReport.linkCopied'));
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({ title: 'ProcesoCat', text: t('publicReport.whatsappText', { comarca: report.comarca, id: report.id }), url: `${window.location.origin}/r/${report.id}` });
    }
  };

  const initials = reporterName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3 flex items-center justify-between max-w-[480px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: '#2D6A4F' }}>🌲</div>
          <span className="font-bold text-foreground">ProcesoCat</span>
        </div>
        <Button size="sm" onClick={() => navigate('/register')}>{t('publicReport.downloadApp')}</Button>
      </div>

      <div className="max-w-[480px] mx-auto p-4 space-y-4 pb-24">
        {/* Danger Hero */}
        <div className="rounded-2xl p-5 border-l-4" style={{ background: `${color}15`, borderColor: color }}>
          <div className="flex justify-center mb-3"><DangerBadge score={score} size="lg" /></div>
          <p className="text-center text-muted-foreground text-sm">{score}/100</p>
          <p className="text-center text-muted-foreground text-xs mt-1">{report.comarca} · {t('publicReport.daysAgo', { days: daysAgo })}</p>
        </div>

        {/* Mini Map */}
        <div ref={mapRef} className="w-full rounded-xl overflow-hidden" style={{ height: 250 }} />
        <button onClick={() => navigate('/map')} className="text-sm text-primary font-medium">{t('publicReport.fullMap')} →</button>

        {/* Details */}
        <div className="bg-card rounded-xl shadow-sm p-4 space-y-3">
          <p className="text-[15px] text-foreground leading-relaxed">{report.description}</p>
          <p className="text-sm text-muted-foreground">✅ {t('report.validatedBy', { count: report.validation_count })}</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#2D6A4F' }}>{initials}</div>
            <span className="text-sm text-muted-foreground">{t('publicReport.reportedBy')} {reporterName}</span>
          </div>
        </div>

        {/* Advice */}
        <div className={`rounded-xl border p-4 ${adviceBg}`}>
          <p className="font-medium">{advice.emoji} {advice.text}</p>
        </div>

        {/* Share */}
        <div className="flex gap-2">
          <Button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white">📱 WhatsApp</Button>
          <Button variant="outline" onClick={copyLink} className="flex-1">📋 {t('publicReport.copyLink')}</Button>
          {typeof navigator.share === 'function' && (
            <Button variant="outline" size="icon" onClick={shareNative}>📤</Button>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{t('publicReport.ctaQuestion')}</p>
            <p className="text-xs text-muted-foreground">4.8★ · {t('publicReport.free')} · Catalunya</p>
          </div>
          <Button size="sm" onClick={() => navigate('/register')}>{t('publicReport.joinFree')} →</Button>
        </div>
      </div>
    </div>
  );
};

export default ReportSharePage;
