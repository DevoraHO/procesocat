import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import WeeklyCharts from '@/components/WeeklyCharts';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockBadges, mockRouteHistory, mockDangerEvolution, ALERT_TYPES } from '@/data/mockData';
import { fetchSavedZones, createSavedZone, deleteSavedZone, fetchUserBadges, fetchRanking, fetchUserReports } from '@/lib/supabase-queries';
import { searchMunicipalities, getMunicipalityById, Municipality } from '@/data/municipalData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import UserAvatar from '@/components/UserAvatar';
import DangerBadge from '@/components/DangerBadge';
import BadgeUnlockModal from '@/components/BadgeUnlockModal';
import UpgradeModal from '@/components/UpgradeModal';
import { Pencil, Camera, TrendingUp, ChevronDown, ChevronUp, MapPin, Trash2, Lock, Shield, Route, Search, BarChart3, LayoutDashboard, Award, MapPinned, Trophy, Settings, Monitor, Smartphone, ShieldCheck, Eye as EyeIcon } from 'lucide-react';
import { getActiveSessions, removeSession, getSecurityLogs, logSecurityEvent, validatePassword, mockSessions, type SessionInfo, type SecurityLog } from '@/utils/security';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const RANKS_ES = [
  { name: 'Observador', min: 0, max: 500 },
  { name: 'Explorador', min: 501, max: 1500 },
  { name: 'Reportador', min: 1501, max: 3000 },
  { name: 'Verificador', min: 3001, max: 5000 },
  { name: 'Protector', min: 5001, max: 8000 },
  { name: 'Guardián', min: 8001, max: 12000 },
  { name: 'Vigilante', min: 12001, max: 18000 },
  { name: 'Defensor', min: 18001, max: 25000 },
  { name: 'Experto', min: 25001, max: 35000 },
  { name: 'Investigador', min: 35001, max: 50000 },
  { name: 'Guardián Sénior', min: 50001, max: 65000 },
  { name: 'Maestro', min: 65001, max: 80000 },
  { name: 'Élite de Cataluña', min: 80001, max: 90000 },
  { name: 'Héroe de Cataluña', min: 90001, max: 99999 },
  { name: 'Leyenda de Cataluña', min: 100000, max: 100000 },
];

const RANKS_CA = [
  { name: 'Observador', min: 0, max: 500 },
  { name: 'Explorador', min: 501, max: 1500 },
  { name: 'Reportador', min: 1501, max: 3000 },
  { name: 'Verificador', min: 3001, max: 5000 },
  { name: 'Protector', min: 5001, max: 8000 },
  { name: 'Guardià', min: 8001, max: 12000 },
  { name: 'Vigilant', min: 12001, max: 18000 },
  { name: 'Defensor', min: 18001, max: 25000 },
  { name: 'Expert', min: 25001, max: 35000 },
  { name: 'Investigador', min: 35001, max: 50000 },
  { name: 'Guardià Sènior', min: 50001, max: 65000 },
  { name: 'Mestre', min: 65001, max: 80000 },
  { name: 'Èlit de Catalunya', min: 80001, max: 90000 },
  { name: 'Heroi de Catalunya', min: 90001, max: 99999 },
  { name: 'Llegenda de Catalunya', min: 100000, max: 100000 },
];

const BANNER_COLORS = ['#2D6A4F', '#1B4332', '#CC0000', '#1a3a5c', '#4a1d96', '#7f1d1d', '#0f4c5c', '#c1692a'];

const BADGE_CATEGORIES = ['all', 'explorador', 'validador', 'fotograf', 'ratxa', 'heroi', 'alerta', 'comunitat', 'especial'] as const;
const RARITY_FILTERS = ['all', 'comú', 'inedit', 'rar', 'epic', 'llegenda'] as const;
const RARITY_LABELS: Record<string, string> = { 'comú': 'COMÚ', 'inedit': 'INÈDIT', 'rar': 'RAR', 'epic': 'ÈPIC', 'llegenda': 'LLEGENDA' };
const RARITY_COLORS: Record<string, string> = { 'comú': '#9ca3af', 'inedit': '#22c55e', 'rar': '#3b82f6', 'epic': '#a855f7', 'llegenda': '#f59e0b' };

const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = i18n.language;

  const RANKS = lang === 'ca' ? RANKS_CA : RANKS_ES;

  const MOCK_ACTIVITY = [
    { icon: '📍', textKey: 'activity.reportPublished', textParams: { comarca: 'Barcelonès' }, timeKey: '2 ' + t('activity.days'), pts: 50 },
    { icon: '✅', textKey: 'activity.validationDone', textParams: {}, timeKey: '3 ' + t('activity.days'), pts: 15 },
    { icon: '🏅', textKey: 'activity.badgeEarned', textParams: { badge: 'Verificador' }, timeKey: '5 ' + t('activity.days'), pts: 200 },
    { icon: '📍', textKey: 'activity.reportInVallès', textParams: {}, timeKey: '6 ' + t('activity.days'), pts: 50 },
    { icon: '🔥', textKey: 'activity.loginStreak', textParams: { days: '7' }, timeKey: '1 ' + (lang === 'ca' ? 'setmana' : 'semana'), pts: 50 },
  ];

  // Refs for file inputs
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // State
  const [bannerEditorOpen, setBannerEditorOpen] = useState(false);
  const [bannerColor, setBannerColor] = useState(user?.banner_color || '#2D6A4F');
  const [bannerImage, setBannerImage] = useState<string | null>(user?.banner_image || null);
  const [showAllRanks, setShowAllRanks] = useState(false);
  const [badgeCategory, setBadgeCategory] = useState<string>('all');
  const [badgeRarity, setBadgeRarity] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<typeof mockBadges[0] | null>(null);
  const [unlockBadge, setUnlockBadge] = useState<typeof mockBadges[0] | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({ totalReports: 0, totalValidations: 0, totalPhotos: 0, totalComments: 0 });
  const [addZoneOpen, setAddZoneOpen] = useState(false);
  const [deleteZoneId, setDeleteZoneId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [zoneLat, setZoneLat] = useState<number | null>(null);
  const [zoneLng, setZoneLng] = useState<number | null>(null);
  const [zoneThreshold, setZoneThreshold] = useState(40);
  const [zoneRadius, setZoneRadius] = useState(2);
  const zoneMapRef = useRef<HTMLDivElement>(null);
  const zoneMapInstanceRef = useRef<L.Map | null>(null);
  const zoneMarkerRef = useRef<L.CircleMarker | null>(null);

  // Settings state
  const [editName, setEditName] = useState(user?.name || '');
  const [petName, setPetName] = useState(user?.pet_name || 'Max');
  const [petType, setPetType] = useState(user?.pet_type || 'dog');
  const [hasChildren, setHasChildren] = useState(false);
  const [notifications, setNotifications] = useState({ danger: true, confirmed: true, stillActive: true, badge: true, weekly: false });
  const [quietHours, setQuietHours] = useState(false);
  const [cancelSubOpen, setCancelSubOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [municipalityModalOpen, setMunicipalityModalOpen] = useState(false);
  const [municipalityQuery, setMunicipalityQuery] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(user?.municipality_id || localStorage.getItem('municipality_id') || '');
  const municipalityResults = searchMunicipalities(municipalityQuery);
  const currentMunicipality = selectedMunicipalityId ? getMunicipalityById(selectedMunicipalityId) : undefined;

  // Security state
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const pwdValidation = useMemo(() => validatePassword(newPwd), [newPwd]);

  const loadSecurityData = useCallback(() => {
    const s = getActiveSessions();
    setSessions(s.length > 0 ? s : mockSessions);
    setSecurityLogs(getSecurityLogs());
  }, []);

  useEffect(() => { loadSecurityData(); }, [loadSecurityData]);

  // Load real data from Supabase
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [zonesData, rankingData, userReports] = await Promise.all([
        fetchSavedZones(user.id),
        fetchRanking(50),
        fetchUserReports(user.id),
      ]);
      setZones(zonesData);
      setRanking(rankingData);
      setUserStats({
        totalReports: userReports.length,
        totalValidations: user.points ? Math.floor(user.points / 15) : 0,
        totalPhotos: userReports.reduce((acc, r) => acc + (r.photos?.length || 0), 0),
        totalComments: 0,
      });
    };
    load();
  }, [user]);

  const isFree = user?.plan === 'free';
  // Ranking sub-tab
  const [rankingTab, setRankingTab] = useState<'comarca' | 'catalunya'>('comarca');

  // Rank calculation
  const points = user?.points || 3450;
  const currentRankIdx = RANKS.findIndex(r => points >= r.min && points <= r.max);
  const currentRank = RANKS[currentRankIdx];
  const nextRank = currentRankIdx < RANKS.length - 1 ? RANKS[currentRankIdx + 1] : null;
  const progressPct = nextRank ? ((points - currentRank.min) / (nextRank.min - currentRank.min)) * 100 : 100;

  // Filtered badges
  const filteredBadges = useMemo(() => {
    let result = mockBadges;
    if (badgeCategory !== 'all') result = result.filter(b => b.category === badgeCategory);
    if (badgeRarity !== 'all') result = result.filter(b => b.rarity === badgeRarity);
    // Smart sorting
    return [...result].sort((a, b) => {
      const aNearly = !a.earned && a.progress !== undefined && a.total !== undefined && a.total > 0 && (a.progress / a.total) > 0.7;
      const bNearly = !b.earned && b.progress !== undefined && b.total !== undefined && b.total > 0 && (b.progress / b.total) > 0.7;
      if (aNearly && !bNearly) return -1;
      if (!aNearly && bNearly) return 1;
      if (a.earned && !b.earned) return aNearly ? 1 : -1;
      if (!a.earned && b.earned) return bNearly ? -1 : 1;
      if (a.earned && b.earned) return (b.earned_at || '').localeCompare(a.earned_at || '');
      if (a.progress !== undefined && b.progress !== undefined && a.total && b.total) {
        return (b.progress / b.total) - (a.progress / a.total);
      }
      return 0;
    });
  }, [badgeCategory, badgeRarity]);

  // Days until Monday
  const daysUntilMonday = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    return day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  }, []);

  // Zone map init
  useEffect(() => {
    if (!addZoneOpen || !zoneMapRef.current || zoneMapInstanceRef.current) return;
    const map = L.map(zoneMapRef.current).setView([41.4, 2.17], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      setZoneLat(e.latlng.lat);
      setZoneLng(e.latlng.lng);
      if (zoneMarkerRef.current) map.removeLayer(zoneMarkerRef.current);
      zoneMarkerRef.current = L.circleMarker(e.latlng, { radius: 8, color: '#2D6A4F', fillColor: '#2D6A4F', fillOpacity: 0.8 }).addTo(map);
    });
    zoneMapInstanceRef.current = map;
    return () => {
      map.remove();
      zoneMapInstanceRef.current = null;
    };
  }, [addZoneOpen]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: lang === 'ca' ? 'Format no permès. Només JPG, PNG, WEBP.' : 'Formato no permitido. Solo JPG, PNG, WEBP.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: lang === 'ca' ? 'Imatge massa gran. Màx 5MB.' : 'Imagen demasiado grande. Máx 5MB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBannerImage(dataUrl);
      updateProfile({ banner_image: dataUrl });
      toast({ title: t('profile.bannerSaved') });
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: lang === 'ca' ? 'Format no permès' : 'Formato no permitido', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: lang === 'ca' ? 'Imatge massa gran' : 'Imagen demasiado grande', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateProfile({ avatar_url: dataUrl });
      toast({ title: t('profile.profileUpdated') });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = () => {
    updateProfile({ banner_color: bannerColor });
    setBannerEditorOpen(false);
    toast({ title: t('profile.bannerSaved') });
  };

  const handleSaveProfile = () => {
    updateProfile({ name: editName });
    toast({ title: t('profile.profileUpdated') });
  };

  const handleSavePet = () => {
    updateProfile({ pet_name: petName, pet_type: petType });
    toast({ title: t('profile.profileUpdated') });
  };

  const handleLogout = () => {
    signOut();
    toast({ title: t('profile.loggedOut') });
    navigate('/login');
  };

  const handleAddZone = () => {
    if (!zoneName || !zoneLat || !zoneLng) return;
    const newZone = {
      id: `z${Date.now()}`,
      name: zoneName,
      lat: zoneLat,
      lng: zoneLng,
      radius_km: zoneRadius,
      alert_threshold: zoneThreshold,
      current_danger_score: Math.floor(Math.random() * 50),
    };
    setZones(prev => [...prev, newZone]);
    setAddZoneOpen(false);
    setZoneName('');
    setZoneLat(null);
    setZoneLng(null);
    toast({ title: t('profile.zoneSaved') });
  };

  const handleDeleteZone = () => {
    if (deleteZoneId) {
      setZones(prev => prev.filter(z => z.id !== deleteZoneId));
      setDeleteZoneId(null);
      toast({ title: t('profile.zoneDeleted') });
    }
  };

  const [demoRarityIdx, setDemoRarityIdx] = useState(0);
  const DEMO_RARITIES = ['comú', 'inedit', 'rar', 'epic', 'llegenda'];
  const handleDemoUnlock = () => {
    const rarity = DEMO_RARITIES[demoRarityIdx % DEMO_RARITIES.length];
    const badge = mockBadges.find(b => b.rarity === rarity && !b.earned) || mockBadges.find(b => !b.earned);
    if (badge) setUnlockBadge(badge);
    setDemoRarityIdx(prev => prev + 1);
  };

  const thresholdLabels: Record<number, { labelKey: string; color: string }> = {
    20: { labelKey: 'danger.green', color: '#22c55e' },
    40: { labelKey: 'danger.yellow', color: '#eab308' },
    60: { labelKey: 'danger.orange', color: '#f97316' },
    80: { labelKey: 'danger.red', color: '#ef4444' },
  };

  const userRankIdx = ranking.findIndex(r => r.id === user?.id);

  const shareRanking = () => {
    const pos = userRankIdx + 1;
    const msg = `🏆 #${pos} ${t('profile.thisWeekIn')} Barcelonès - ${user?.weekly_points} pts - ProcesoCat! procesocat.es`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!user) return null;

  return (
    <div className="pb-24">
      {/* Banner */}
      <div className="relative h-[200px] w-full" style={bannerImage ? { backgroundImage: `url(${bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: `linear-gradient(to bottom, ${bannerColor}, ${bannerColor}dd)` }}>
        {/* Hidden file inputs */}
        <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleBannerUpload} />
        <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
        <button onClick={() => setBannerEditorOpen(!bannerEditorOpen)} className="absolute top-3 right-3 bg-black/30 rounded-full p-2 text-white hover:bg-black/50 transition">
          <Pencil size={16} />
        </button>
      </div>

      {/* Banner editor */}
      {bannerEditorOpen && (
        <div className="bg-card border-b px-4 py-3 animate-fade-in">
          <div className="flex gap-2 flex-wrap mb-3">
            {BANNER_COLORS.map(c => (
              <button key={c} onClick={() => setBannerColor(c)} className="w-8 h-8 rounded-full border-2 transition" style={{ backgroundColor: c, borderColor: bannerColor === c ? 'white' : 'transparent', boxShadow: bannerColor === c ? '0 0 0 2px hsl(var(--primary))' : 'none' }} />
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()}>{t('profile.uploadImage')}</Button>
            <Button size="sm" onClick={handleSaveBanner}>{t('profile.save')}</Button>
          </div>
        </div>
      )}

      {/* Avatar + Info */}
      <div className="flex flex-col items-center -mt-12 relative z-10 px-4">
        <div className="relative">
          <div className="border-4 border-card rounded-full">
            <UserAvatar name={user.name} avatar_url={user.avatar_url} size="xl" />
          </div>
          <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5">
            <Camera size={14} />
          </button>
        </div>
        <h1 className="text-xl font-bold mt-3 text-foreground">{user.name} {user.pet_name && <span className="text-sm font-normal text-muted-foreground">· 🐕 {user.pet_name}</span>}</h1>
        <div className="flex gap-2 mt-2 flex-wrap justify-center">
          <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">⭐ {currentRank?.name || user.rank}</span>
          <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full font-medium">{points.toLocaleString()} {t('profile.points')}</span>
          <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium">{t('profile.plan', { plan: user.plan === 'familiar' ? 'Familiar' : (lang === 'ca' ? 'Gratuït' : 'Gratuito') })}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 mt-6">
        {[
          { label: lang === 'ca' ? 'Reports' : 'Reportes', val: userStats.totalReports },
          { label: 'Val.', val: userStats.totalValidations },
          { label: 'Fotos', val: userStats.totalPhotos },
          { label: 'Coment.', val: userStats.totalComments },
        ].map(s => (
          <Card key={s.label} className="text-center py-3">
            <p className="text-xl font-bold text-primary">{s.val}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="mt-6 px-4">
        <TabsList className="w-full grid grid-cols-5 h-12 bg-card border border-border shadow-sm rounded-xl p-1 gap-1">
          <TabsTrigger value="summary" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all">
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">{t('profile.summary')}</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all">
            <Award size={16} />
            <span className="hidden sm:inline">{t('profile.badges')}</span>
          </TabsTrigger>
          <TabsTrigger value="zones" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all">
            <MapPinned size={16} />
            <span className="hidden sm:inline">{t('profile.zones')}</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all">
            <Trophy size={16} />
            <span className="hidden sm:inline">{t('profile.ranking')}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-all">
            <Settings size={16} />
            <span className="hidden sm:inline">{t('profile.settingsTab')}</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: RESUMEN */}
        <TabsContent value="summary" className="space-y-6 mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">{t('profile.rankProgress')}</h3>
              </div>
              <Progress value={progressPct} className="h-2 mb-2" />
              <p className="text-sm text-foreground">{points.toLocaleString()} / {nextRank ? nextRank.min.toLocaleString() : currentRank.max.toLocaleString()} {t('profile.points')} → {nextRank?.name || currentRank.name}</p>
              {nextRank && <p className="text-xs text-muted-foreground">{t('profile.ptsToNext', { pts: (nextRank.min - points).toLocaleString(), rank: nextRank.name })}</p>}

              <button onClick={() => setShowAllRanks(!showAllRanks)} className="flex items-center gap-1 text-xs text-primary mt-3">
                {showAllRanks ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {showAllRanks ? t('profile.hideRanks') : t('profile.viewAllRanks')}
              </button>
              {showAllRanks && (
                <div className="mt-3 space-y-1 animate-fade-in">
                  {RANKS.map((r, i) => {
                    const isPast = i < currentRankIdx;
                    const isCurrent = i === currentRankIdx;
                    return (
                      <div key={r.name} className={`flex items-center gap-2 text-xs py-1 px-2 rounded ${isCurrent ? 'bg-primary/10 font-semibold' : ''}`}>
                        {isPast ? <span className="text-primary">✓</span> : <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-primary' : 'bg-muted-foreground/30'}`} />}
                        <span className={isCurrent ? 'text-primary' : isPast ? 'text-foreground' : 'text-muted-foreground'}>{r.name}</span>
                        <span className="text-muted-foreground ml-auto">{r.min.toLocaleString()}-{r.max.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-3">{t('profile.recentActivity')}</h3>
              <div className="space-y-3">
                {MOCK_ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{t(a.textKey, a.textParams)}</p>
                      <p className="text-xs text-muted-foreground">{t('activity.ago', { time: a.timeKey })}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary whitespace-nowrap">+{a.pts}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary" />
                  <h3 className="font-semibold text-foreground">{t('analytics.summaryTitle')}</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/analytics')}>
                  {t('analytics.viewAll')} →
                </Button>
              </div>
              {isFree ? (
                <div className="relative">
                  <div className="filter blur-md pointer-events-none select-none opacity-60">
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={mockDangerEvolution}>
                        <Area type="monotone" dataKey="score" stroke="#ef4444" fill="rgba(239,68,68,0.15)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Lock className="h-5 w-5 text-primary mb-1" />
                    <p className="text-xs font-medium text-foreground">{t('analytics.locked')}</p>
                    <Button size="sm" variant="outline" className="mt-2 text-xs h-7" onClick={() => navigate('/analytics')}>
                      {t('analytics.upgradeCta')}
                    </Button>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={mockDangerEvolution}>
                    <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                    <Tooltip />
                    <defs>
                      <linearGradient id="dangerGradProfile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="score" stroke="#ef4444" fill="url(#dangerGradProfile)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Weekly Charts Section */}
          <WeeklyCharts />

          {/* Route History */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Route size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">{t('safeWalk.routeHistory')}</h3>
              </div>
              <div className="space-y-3">
                {mockRouteHistory.map(route => {
                  const daysAgo = Math.floor((Date.now() - new Date(route.date).getTime()) / 86400000);
                  const color = route.result === 'SEGURA' ? 'text-green-600' : 'text-orange-500';
                  const dot = route.result === 'SEGURA' ? 'bg-green-500' : 'bg-orange-500';
                  const label = route.result === 'SEGURA' ? (lang === 'ca' ? 'Segura' : 'Segura') : (lang === 'ca' ? 'Precaució' : 'Precaución');
                  return (
                    <div key={route.id} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${dot} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{lang === 'ca' ? route.name_ca : route.name_es}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className={color}>{label}</span> · {t('safeWalk.daysAgo', { days: daysAgo })} · {route.distance}km
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => navigate('/map')}>
                        {t('safeWalk.viewOnMap')}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MEDALLAS */}
        <TabsContent value="badges" className="mt-4 space-y-4">
          {/* Stats header */}
          {(() => {
            const earned = mockBadges.filter(b => b.earned).length;
            const total = mockBadges.length;
            const rarityCounts = mockBadges.reduce((acc, b) => { acc[b.rarity] = (acc[b.rarity] || 0) + 1; return acc; }, {} as Record<string, number>);
            return (
              <div className="bg-card border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-2">{earned} / {total} {t('badges.medals')}</p>
                <Progress value={(earned / total) * 100} className="h-2 mb-3" />
                <div className="flex gap-1.5 flex-wrap">
                  {(['comú', 'inedit', 'rar', 'epic', 'llegenda'] as const).map(r => (
                    <span key={r} className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: RARITY_COLORS[r] }}>
                      {rarityCounts[r] || 0} {RARITY_LABELS[r]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap overflow-x-auto pb-1">
            {BADGE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setBadgeCategory(cat)} className={`text-xs px-2.5 py-1 rounded-full font-medium transition whitespace-nowrap ${badgeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {t(`badges.${cat}`)}
              </button>
            ))}
          </div>

          {/* Rarity filter */}
          <div className="flex gap-1.5 flex-wrap">
            {RARITY_FILTERS.map(r => (
              <button key={r} onClick={() => setBadgeRarity(r)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition ${badgeRarity === r ? 'text-white' : 'opacity-50'}`} style={{ backgroundColor: r === 'all' ? (badgeRarity === 'all' ? 'hsl(var(--primary))' : 'hsl(var(--muted))') : RARITY_COLORS[r] }}>
                {r === 'all' ? t('badges.all') : RARITY_LABELS[r]}
              </button>
            ))}
          </div>

          {/* Badge grid */}
          <div className="grid grid-cols-3 gap-3">
            {filteredBadges.map(badge => {
              const name = lang === 'ca' ? badge.name_ca : badge.name_es;
              const isNearlyEarned = !badge.earned && badge.progress !== undefined && badge.total !== undefined && badge.total > 0 && (badge.progress / badge.total) > 0.7;
              const isLimited = (badge as any).limited;
              return (
                <button key={badge.id} onClick={() => setSelectedBadge(badge)} className={`p-3 rounded-xl border text-center transition hover:shadow-md relative ${badge.earned ? 'bg-card border-green-200' : isNearlyEarned ? 'bg-card' : 'bg-muted/30'}`}
                  style={isNearlyEarned ? { borderColor: '#f59e0b', animation: 'pulse 2s infinite' } : isLimited && badge.earned ? { borderImage: 'linear-gradient(135deg, #f59e0b, #fbbf24, #d97706) 1' } : {}}
                >
                  {isNearlyEarned && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-white whitespace-nowrap">⚡ {lang === 'ca' ? 'Gairebé!' : '¡Casi!'}</span>}
                  {isLimited && badge.earned && <span className="absolute -top-1.5 -right-1.5 text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500 text-white rotate-12">LTD</span>}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white inline-block mb-1" style={{ backgroundColor: badge.rarity_color }}>{RARITY_LABELS[badge.rarity]}</span>
                  <span className={`text-3xl block mb-1 ${!badge.earned && !isNearlyEarned ? 'grayscale opacity-40' : !badge.earned ? 'opacity-80' : ''}`}>{badge.icon}</span>
                  <p className={`text-xs font-medium truncate ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>{name}</p>
                  {badge.earned && badge.earned_at && (
                    <p className="text-[10px] text-green-600">{new Date(badge.earned_at).toLocaleDateString()}</p>
                  )}
                  {badge.earned && badge.points_bonus > 0 && (
                    <p className="text-[10px] text-orange-500 font-medium">+{badge.points_bonus} pts</p>
                  )}
                  {!badge.earned && badge.progress !== undefined && badge.total !== undefined && badge.total > 0 && (
                    <div className="mt-1">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(badge.progress / badge.total) * 100}%`, backgroundColor: isNearlyEarned ? '#f59e0b' : 'hsl(var(--primary))' }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{badge.progress}/{badge.total}</p>
                    </div>
                  )}
                  {!badge.earned && (badge as any).motivator_es && isNearlyEarned && (
                    <p className="text-[9px] italic text-green-600 mt-0.5 truncate">{lang === 'ca' ? (badge as any).motivator_ca : (badge as any).motivator_es}</p>
                  )}
                </button>
              );
            })}
          </div>

          <Button variant="outline" size="sm" onClick={handleDemoUnlock} className="w-full">{t('profile.demoUnlock')} 🎉</Button>

          {/* Badge detail modal */}
          <Dialog open={!!selectedBadge} onOpenChange={() => setSelectedBadge(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">{selectedBadge?.icon}</DialogTitle>
                <DialogDescription className="text-center">
                  {lang === 'ca' ? selectedBadge?.name_ca : selectedBadge?.name_es}
                </DialogDescription>
              </DialogHeader>
              <div className="text-center space-y-3">
                <p className={`text-6xl ${!selectedBadge?.earned ? 'grayscale' : ''}`} style={selectedBadge?.earned ? { filter: `drop-shadow(0 0 8px ${selectedBadge.rarity_color})` } : {}}>{selectedBadge?.icon}</p>
                <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: selectedBadge?.rarity_color || '#9ca3af' }}>
                  {RARITY_LABELS[selectedBadge?.rarity || 'comú']}
                </span>
                <p className="font-bold text-lg text-foreground">{lang === 'ca' ? selectedBadge?.name_ca : selectedBadge?.name_es}</p>
                <p className="text-sm text-muted-foreground">{lang === 'ca' ? selectedBadge?.requirement_ca : selectedBadge?.requirement_es}</p>
                {selectedBadge?.earned && <p className="text-primary font-medium">✅ {t('badges.earned', { date: new Date(selectedBadge.earned_at!).toLocaleDateString() })}</p>}
                {selectedBadge?.earned && selectedBadge.points_bonus > 0 && <p className="text-orange-500 font-bold">+{selectedBadge.points_bonus} pts</p>}
                {!selectedBadge?.earned && selectedBadge?.progress !== undefined && selectedBadge?.total !== undefined && selectedBadge.total > 0 && (
                  <div className="px-8">
                    <Progress value={(selectedBadge.progress / selectedBadge.total) * 100} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">{selectedBadge.progress} / {selectedBadge.total}</p>
                  </div>
                )}
                {!selectedBadge?.earned && (selectedBadge as any)?.motivator_es && (
                  <p className="text-sm italic text-green-600">{lang === 'ca' ? (selectedBadge as any).motivator_ca : (selectedBadge as any).motivator_es}</p>
                )}
                {selectedBadge?.earned && (
                  <Button className="w-full" onClick={() => {
                    const n = lang === 'ca' ? selectedBadge.name_ca : selectedBadge.name_es;
                    const msg = `${selectedBadge.icon} ${n} — ProcesoCat! procesocat.es`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  }}>{t('profile.shareWhatsApp')}</Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB 3: ZONAS */}
        <TabsContent value="zones" className="mt-4 space-y-4">
          {isFree ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">{t('profile.myZones')}</h3>
              <p className="text-sm text-muted-foreground mb-6">{t('profile.noZonesText')}</p>
              <Button onClick={() => setUpgradeOpen(true)} className="gap-2">
                <Shield className="h-4 w-4" />
                {t('subscription.upgrade')}
              </Button>
            </div>
          ) : (
          <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{t('profile.myZones')}</h3>
            <Button size="sm" onClick={() => setAddZoneOpen(true)}>+ {t('profile.addZone')}</Button>
          </div>

          {zones.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="font-medium text-foreground">{t('profile.noZonesTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('profile.noZonesText')}</p>
            </div>
          ) : (
            zones.map(zone => (
              <Card key={zone.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{zone.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('profile.radius', { r: `${zone.radius_km}km` })} · {t('profile.alertIf', { level: t(thresholdLabels[zone.alert_threshold]?.labelKey || 'danger.orange') })}
                      </p>
                    </div>
                    <DangerBadge score={zone.current_danger_score} size="sm" />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => navigate('/map', { state: { flyTo: { lat: zone.lat, lng: zone.lng, zoom: 15 } } })}>{t('profile.viewOnMap')}</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteZoneId(zone.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Dialog open={!!deleteZoneId} onOpenChange={() => setDeleteZoneId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.deleteZoneConfirm')}</DialogTitle>
                <DialogDescription>{t('profile.deleteZone')}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteZoneId(null)}>{t('profile.cancel')}</Button>
                <Button variant="destructive" onClick={handleDeleteZone}>{t('profile.deleteZone')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addZoneOpen} onOpenChange={(o) => { if (!o) { setAddZoneOpen(false); zoneMapInstanceRef.current = null; } }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t('profile.addZone')}</DialogTitle>
                <DialogDescription>{t('profile.zoneName')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder={t('profile.zoneName')} value={zoneName} onChange={e => setZoneName(e.target.value)} />
                <div ref={zoneMapRef} className="h-[250px] rounded-lg overflow-hidden border" />
                {zoneLat && zoneLng && <p className="text-xs text-primary">📍 {zoneLat.toFixed(4)}°, {zoneLng.toFixed(4)}°</p>}
                <div>
                  <p className="text-sm font-medium mb-2">{t('profile.alertThreshold')}</p>
                  <div className="flex gap-2">
                    {[20, 40, 60, 80].map(v => (
                      <button key={v} onClick={() => setZoneThreshold(v)} className={`flex-1 text-xs py-2 rounded-lg border transition font-medium ${zoneThreshold === v ? 'border-primary bg-primary/10' : 'border-border'}`} style={{ color: thresholdLabels[v].color }}>
                        {t(thresholdLabels[v].labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">{t('profile.monitorRadius')}</p>
                  <Select value={String(zoneRadius)} onValueChange={v => setZoneRadius(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">500m</SelectItem>
                      <SelectItem value="1">1km</SelectItem>
                      <SelectItem value="2">2km</SelectItem>
                      <SelectItem value="5">5km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddZoneOpen(false)}>{t('profile.cancel')}</Button>
                <Button onClick={handleAddZone} disabled={!zoneName || !zoneLat}>{t('profile.saveZone')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </>
          )}
        </TabsContent>
        {/* TAB 4: RANKING */}
        <TabsContent value="ranking" className="mt-4 space-y-4">
          <div className="flex gap-2 mb-2">
            <button onClick={() => setRankingTab('comarca')} className={`flex-1 text-sm py-2 rounded-lg font-medium transition ${rankingTab === 'comarca' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('ranking.comarca')}</button>
            <button onClick={() => setRankingTab('catalunya')} className={`flex-1 text-sm py-2 rounded-lg font-medium transition ${rankingTab === 'catalunya' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{t('ranking.catalunya')}</button>
          </div>
          <p className="text-xs text-muted-foreground text-center">⏱ {t('profile.resetsMonday', { days: daysUntilMonday })}</p>

          {/* Podium */}
          <div className="flex items-end justify-center gap-3 pt-4 pb-2">
            {[1, 0, 2].map(idx => {
              const r = ranking[idx];
              if (!r) return null;
              const isCenter = idx === 0;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              return (
                <div key={r.id} className={`flex flex-col items-center ${isCenter ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}>
                  <span className="text-2xl mb-1">{medal}</span>
                  <UserAvatar name={r.name} avatar_url={r.avatar_url} size={isCenter ? 'lg' : 'md'} />
                  <p className="text-xs font-medium mt-1 text-foreground truncate max-w-[80px]">{r.name.split(' ')[0]}</p>
                  <p className="text-xs text-primary font-bold">{r.weekly_points}</p>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            {mockRanking.slice(3).map((r, i) => {
              const isUser = r.name === user.name;
              return (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl ${isUser ? 'bg-primary/10 border border-primary/20' : 'bg-card border'}`}>
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 4}</span>
                  <UserAvatar name={r.name} avatar_url={r.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.name} {isUser && <span className="text-primary">⭐ {t('profile.you')}</span>}</p>
                    <p className="text-xs text-muted-foreground">{r.rank}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{r.weekly_points}</span>
                </div>
              );
            })}
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-3 text-center">
              <p className="text-sm font-medium text-foreground">{t('profile.yourPositionWeek', { pos: userRankIdx + 1, pts: user.weekly_points })}</p>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={shareRanking}>{t('profile.shareRanking')} 📤</Button>
        </TabsContent>

        {/* TAB 5: AJUSTES */}
        <TabsContent value="settings" className="mt-4 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('settingsSections.profile')}</h3>
              <Input value={editName} onChange={e => setEditName(e.target.value)} />
              <Input value={user.email} disabled className="opacity-60" />
              <Button size="sm" onClick={handleSaveProfile}>{t('profile.save')}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('settingsSections.petFamily')}</h3>
              <div>
                <label className="text-sm text-muted-foreground">{t('pet.petName')}</label>
                <Input placeholder={t('pet.petNamePlaceholder')} value={petName} onChange={e => setPetName(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">{t('pet.petNameHelper')}</p>
              </div>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">🐕 {t('profile.dog')}</SelectItem>
                  <SelectItem value="cat">🐱 {t('profile.cat')}</SelectItem>
                  <SelectItem value="other">🐾 {t('profile.other')}</SelectItem>
                </SelectContent>
              </Select>
              {/* Pet photo */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl border-2 border-dashed border-border">
                  {petType === 'dog' ? '🐕' : petType === 'cat' ? '🐱' : '🐾'}
                </div>
                <div>
                  <p className="text-sm text-foreground">{t('pet.petPhoto', { name: petName || t('pet.yourPet') })}</p>
                  <p className="text-xs text-muted-foreground">{t('pet.comingSoon')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t('pet.hasChildren')}</span>
                <Switch checked={hasChildren} onCheckedChange={setHasChildren} />
              </div>
              {hasChildren && (
                <div className="space-y-1 pl-2 animate-fade-in">
                  {[
                    { label: t('pet.childrenUnder6'), value: 'under6' },
                    { label: t('pet.children6to12'), value: '6to12' },
                    { label: t('pet.childrenOver12'), value: 'over12' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
              <Button size="sm" onClick={handleSavePet}>{t('profile.save')}</Button>
            </CardContent>
          </Card>

          {/* Municipality */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('municipality.title')}</h3>
              {currentMunicipality ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="font-medium text-green-800">📍 {lang === 'ca' ? currentMunicipality.name_ca : currentMunicipality.name_es}</p>
                  <p className="text-xs text-green-700">{lang === 'ca' ? currentMunicipality.comarca_ca : currentMunicipality.comarca_es}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('municipality.notConfigured')}</p>
              )}
              <Button variant="outline" size="sm" onClick={() => setMunicipalityModalOpen(true)}>
                <MapPin size={14} className="mr-1" /> {t('municipality.change')}
              </Button>
            </CardContent>
          </Card>

          <Dialog open={municipalityModalOpen} onOpenChange={setMunicipalityModalOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>{t('municipality.title')}</DialogTitle>
                <DialogDescription>{t('municipality.selectSubtitle')}</DialogDescription>
              </DialogHeader>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder={t('municipality.search')} value={municipalityQuery} onChange={e => setMunicipalityQuery(e.target.value)} className="pl-9" />
              </div>
              {municipalityResults.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {municipalityResults.map(m => {
                    const isSelected = m.id === selectedMunicipalityId;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMunicipalityId(m.id);
                          updateProfile({ municipality_id: m.id });
                          localStorage.setItem('municipality_id', m.id);
                          setMunicipalityModalOpen(false);
                          setMunicipalityQuery('');
                          toast({ title: t('profile.profileUpdated') });
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between border-b last:border-b-0 ${isSelected ? 'bg-primary/10' : ''}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{lang === 'ca' ? m.name_ca : m.name_es}</p>
                          <p className="text-xs text-muted-foreground">{lang === 'ca' ? m.comarca_ca : m.comarca_es}</p>
                        </div>
                        {isSelected && <span className="text-xs text-primary font-bold">✓ {t('municipality.selected')}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('settingsSections.language')}</h3>
              <div className="flex gap-2">
                <Button variant={lang === 'es' ? 'default' : 'outline'} size="sm" onClick={() => i18n.changeLanguage('es')}>🇪🇸 Español</Button>
                <Button variant={lang === 'ca' ? 'default' : 'outline'} size="sm" onClick={() => i18n.changeLanguage('ca')}>🏴 Català</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('settingsSections.notifications')}</h3>
              {(['danger', 'confirmed', 'stillActive', 'badge', 'weekly'] as const).map(key => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{t(`notificationTypes.${key === 'danger' ? 'dangerNearby' : key === 'confirmed' ? 'reportConfirmed' : key === 'stillActive' ? 'stillActive' : key === 'badge' ? 'newBadge' : 'weeklyRanking'}`)}</span>
                  <Switch checked={notifications[key]} onCheckedChange={v => setNotifications(prev => ({ ...prev, [key]: v }))} />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">{t('profile.quietHours')}</span>
                <Switch checked={quietHours} onCheckedChange={setQuietHours} />
              </div>
              {quietHours && <p className="text-xs text-muted-foreground">22:00 - 08:00</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('settingsSections.subscription')}</h3>
              {isFree ? (
                <>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="font-medium text-foreground">{t('subscription.currentFree')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('subscription.freeIncludes')}</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>✅ {t('subscription.freeF1')}</li>
                      <li>✅ {t('subscription.freeF2')}</li>
                      <li>✅ {t('subscription.freeF3')}</li>
                      <li>✅ {t('subscription.freeF4')}</li>
                      <li>✅ {t('subscription.freeF5')}</li>
                      <li>✅ {t('subscription.freeF6')}</li>
                    </ul>
                  </div>
                  <Button onClick={() => setUpgradeOpen(true)} className="w-full gap-2">
                    <Shield className="h-4 w-4" />
                    {t('subscription.upgrade')} — {t('subscription.perMonth')}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/pricing')}>
                    {t('pricing.view_plans')}
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="font-medium text-primary">{t('subscription.familiar')} ✓</p>
                    <p className="text-xs text-muted-foreground">{t('profile.renewal', { date: '28 abril 2026' })}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: t('profile.comingSoon') })}>{t('profile.manageSubscription')}</Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => setCancelSubOpen(true)}>{t('profile.cancelSubscription')}</Button>
                </>
              )}
            </CardContent>
          </Card>

          <Dialog open={cancelSubOpen} onOpenChange={setCancelSubOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.cancelConfirmTitle')}</DialogTitle>
                <DialogDescription>{t('profile.cancelLoseTitle')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <p>❌ {t('profile.cancelLose1')}</p>
                <p>❌ {t('profile.cancelLose2')}</p>
                <p>❌ {t('profile.cancelLose3')}</p>
                <p>❌ {t('profile.cancelLose4')}</p>
              </div>
              <DialogFooter>
                <Button onClick={() => setCancelSubOpen(false)}>{t('profile.keepPlan')}</Button>
                <Button variant="ghost" onClick={() => { setCancelSubOpen(false); toast({ title: t('profile.comingSoon') }); }}>{t('profile.confirmCancel')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* SECURITY SECTION */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">{t('security.title')}</h3>
              </div>

              {/* Active Sessions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">{t('security.activeSessions')}</p>
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                    {s.device.toLowerCase().includes('iphone') || s.device.toLowerCase().includes('safari') || s.device.toLowerCase().includes('android')
                      ? <Smartphone size={18} className="text-muted-foreground shrink-0" />
                      : <Monitor size={18} className="text-muted-foreground shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{s.device}</p>
                      <p className="text-xs text-muted-foreground">{s.location} · {s.ip.replace(/\.\d+$/, '.x')}</p>
                      <p className="text-xs text-muted-foreground">{t('security.lastActive')}: {new Date(s.lastActive).toLocaleDateString()}</p>
                    </div>
                    {s.current ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">{t('security.currentSession')}</span>
                    ) : (
                      <Button variant="ghost" size="sm" className="text-destructive shrink-0" onClick={() => {
                        removeSession(s.id);
                        setSessions(prev => prev.filter(x => x.id !== s.id));
                        toast({ title: t('security.sessionClosed') });
                      }}>
                        {t('security.closeSession')}
                      </Button>
                    )}
                  </div>
                ))}
                {sessions.filter(s => !s.current).length > 0 && (
                  <Button variant="outline" size="sm" className="w-full text-destructive border-destructive/30" onClick={() => {
                    const current = sessions.filter(s => s.current);
                    sessions.filter(s => !s.current).forEach(s => removeSession(s.id));
                    setSessions(current);
                    toast({ title: t('security.allClosed') });
                  }}>
                    {t('security.closeAllOthers')}
                  </Button>
                )}
              </div>

              {/* Change Password */}
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium text-foreground">{t('security.changePassword')}</p>
                <Input type="password" placeholder={t('security.currentPassword')} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
                <Input type="password" placeholder={t('security.newPassword')} value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                {newPwd && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${
                          pwdValidation.strength === 'strong' ? 'bg-green-500' :
                          pwdValidation.strength === 'medium' && i <= 2 ? 'bg-orange-400' :
                          pwdValidation.strength === 'weak' && i <= 1 ? 'bg-destructive' : 'bg-muted'
                        }`} />
                      ))}
                    </div>
                    <p className={`text-xs ${pwdValidation.strength === 'strong' ? 'text-green-600' : pwdValidation.strength === 'medium' ? 'text-orange-500' : 'text-destructive'}`}>
                      {t(`security.strength${pwdValidation.strength.charAt(0).toUpperCase() + pwdValidation.strength.slice(1)}`)}
                    </p>
                    {pwdValidation.errors.map(err => (
                      <p key={err} className="text-xs text-destructive">• {t(`security.password${err.charAt(0).toUpperCase() + err.slice(1)}`)}</p>
                    ))}
                  </div>
                )}
                <Input type="password" placeholder={t('security.confirmPassword')} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                {confirmPwd && newPwd !== confirmPwd && (
                  <p className="text-xs text-destructive">{t('security.passwordMismatch')}</p>
                )}
                <Button size="sm" disabled={!currentPwd || !pwdValidation.valid || newPwd !== confirmPwd} onClick={() => {
                  logSecurityEvent('PASSWORD_CHANGED', { userId: user?.id });
                  setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
                  loadSecurityData();
                  toast({ title: t('security.passwordChanged') });
                }}>
                  {t('security.changePassword')}
                </Button>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{t('security.twoFactor')}</p>
                  <p className="text-xs text-muted-foreground">{t('security.twoFactorDesc')}</p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{t('security.comingSoon')}</span>
              </div>

              {/* Security Log */}
              {securityLogs.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">{t('security.recentActivity')}</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {securityLogs.slice(0, 10).map(log => {
                      const icons: Record<string, string> = { LOGIN_SUCCESS: '🟢', LOGIN_FAILED: '🔴', PASSWORD_CHANGED: '🟡', REPORT_CREATED: '🔵', SUSPICIOUS_GPS: '🟠', FILE_REJECTED: '🔴' };
                      return (
                        <div key={log.id} className="flex items-center gap-2 text-xs py-1">
                          <span>{icons[log.type] || '⚪'}</span>
                          <span className="text-foreground flex-1">{log.type.replace(/_/g, ' ')}</span>
                          <span className="text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</span>
                          <span className="text-muted-foreground">{log.ip.replace(/\.\d+$/, '.x')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-foreground">{t('settingsSections.privacy')}</h3>
              <Button variant="outline" size="sm" onClick={() => toast({ title: t('profile.downloadDataToast') })}>{t('settings.downloadData')}</Button>
              <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('gdpr_shown'); window.location.reload(); }}>{t('profile.revokeConsent')}</Button>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30" onClick={() => setDeleteAccountOpen(true)}>{t('settings.deleteAccount')}</Button>
            </CardContent>
          </Card>

          <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('profile.deleteConfirmTitle')}</DialogTitle>
                <DialogDescription>{t('profile.deleteConfirmText', { date: new Date(Date.now() + 30 * 86400000).toLocaleDateString() })}</DialogDescription>
              </DialogHeader>
              <Input placeholder={t('profile.deleteConfirmPlaceholder')} value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>{t('profile.cancel')}</Button>
                <Button variant="destructive" disabled={deleteConfirmText !== 'ELIMINAR'} onClick={() => { setDeleteAccountOpen(false); handleLogout(); }}>
                  {t('settings.deleteAccount')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="destructive" className="w-full" onClick={handleLogout}>{t('settingsSections.logout')}</Button>

          <button onClick={() => navigate('/admin')} className="w-full text-center text-xs text-muted-foreground mt-4 hover:text-primary transition">
            🛡️ Panel Admin
          </button>
        </TabsContent>
      </Tabs>

      <BadgeUnlockModal badge={unlockBadge} onClose={() => setUnlockBadge(null)} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} trigger="zones" />
    </div>
  );
};

export default ProfilePage;
