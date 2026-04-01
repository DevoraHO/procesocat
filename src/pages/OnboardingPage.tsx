import { useState, useEffect, useCallback } from 'react';
import { safeStorage } from '@/utils/safeStorage';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { searchMunicipalitiesAsync, getMunicipalityFromGPS, findNearestRichMunicipality, type Municipality } from '@/data/municipalData';
import Confetti from '@/components/Confetti';
import logo from '@/assets/logoprocesocat.png';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const RISK_COLORS: Record<string, string> = {
  very_high: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const OnboardingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { authUser, updateProfile } = useAuth();
  const lang = i18n.language?.startsWith('ca') ? 'ca' : 'es';

  const [step, setStep] = useState(0);
  const [userName, setUserName] = useState(authUser?.user_metadata?.name || '');
  const [petType, setPetType] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [hasChildren, setHasChildren] = useState(false);
  const [municipalitySearch, setMunicipalitySearch] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchResults, setSearchResults] = useState<Municipality[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsDetecting, setGpsDetecting] = useState(false);

  // Debounced async municipality search
  useEffect(() => {
    if (!municipalitySearch || municipalitySearch.length < 2 || selectedMunicipality) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const results = await searchMunicipalitiesAsync(municipalitySearch);
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [municipalitySearch, selectedMunicipality]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Try ICGC reverse geocoding first
        const cityName = await getMunicipalityFromGPS(latitude, longitude);
        if (cityName) {
          const results = await searchMunicipalitiesAsync(cityName);
          if (results.length > 0) {
            setSelectedMunicipality(results[0]);
            setMunicipalitySearch(lang === 'ca' ? results[0].name_ca : results[0].name_es);
            toast.success(`📍 ${lang === 'ca' ? 'Detectat' : 'Detectado'}: ${results[0].name_ca}`);
            setGpsDetecting(false);
            return;
          }
        }
        // Fallback to nearest rich municipality
        const nearest = findNearestRichMunicipality(latitude, longitude);
        if (nearest) {
          setSelectedMunicipality(nearest);
          setMunicipalitySearch(lang === 'ca' ? nearest.name_ca : nearest.name_es);
          toast.success(`📍 ${lang === 'ca' ? 'Detectat' : 'Detectado'}: ${nearest.name_ca}`);
        }
        setGpsDetecting(false);
      },
      () => {
        toast.error(lang === 'ca' ? "No s'ha pogut detectar la ubicació" : 'No se pudo detectar la ubicación');
        setGpsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [lang]);

  const finish = async () => {
    if (!authUser) return;
    setSaving(true);
    const updates: Record<string, any> = {};
    if (userName) updates.name = userName;
    if (petType && petType !== 'none') {
      updates.pet_type = petType;
      if (petName) updates.pet_name = petName;
    }
    if (selectedMunicipality) updates.municipality_id = selectedMunicipality.id;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.id);

    if (error) {
      console.error('Error saving onboarding:', error);
      toast.error(lang === 'ca' ? 'Error desant el perfil' : 'Error guardando el perfil');
      setSaving(false);
      return;
    }

    updateProfile(updates);
    safeStorage.setItem('onboarding_profile_done', 'true');
    setShowConfetti(true);
    setStep(4);
    setTimeout(() => navigate('/map', { replace: true }), 2500);
  };

  const dots = (total: number) => (
    <div className="flex gap-2 justify-center mt-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
      ))}
    </div>
  );

  const dotsAlt = (total: number) => (
    <div className="flex gap-2 justify-center mt-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
      ))}
    </div>
  );

  // STEP 0 — Welcome
  if (step === 0) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 text-white text-center" style={{ background: '#1B4332' }}>
      <img src={logo} alt="ProcesoCat" className="w-28 h-28 mb-6 rounded-2xl" />
      <h1 className="text-2xl font-bold mb-3">
        {lang === 'ca' ? 'Benvingut/da a ProcesoCat! 🌲' : '¡Bienvenido/a a ProcesoCat! 🌲'}
      </h1>
      <p className="text-white/80 text-lg mb-1">
        {lang === 'ca' ? 'Protegint Catalunya junts' : 'Protegiendo Catalunya juntos'}
      </p>
      <p className="text-white/60 text-sm">
        {lang === 'ca' ? 'Configura el teu perfil en 3 passos' : 'Configura tu perfil en 3 pasos'}
      </p>
      {dots(4)}
      <Button onClick={() => setStep(1)} className="mt-8 bg-white text-[#1B4332] hover:bg-white/90 font-semibold px-8">
        {lang === 'ca' ? 'Començar →' : 'Comenzar →'}
      </Button>
    </div>
  );

  // STEP 1 — Name
  if (step === 1) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-card text-center">
      <h1 className="text-xl font-bold text-foreground mb-2">
        {lang === 'ca' ? 'Com et diem?' : '¿Cómo te llamamos?'}
      </h1>
      <Input
        value={userName}
        onChange={e => setUserName(e.target.value)}
        placeholder={lang === 'ca' ? 'Pere, Maria, Joan...' : 'Pere, María, Joan...'}
        className="max-w-xs mt-4 text-center text-lg"
      />
      {dotsAlt(4)}
      <div className="flex flex-col items-center gap-3 mt-6">
        <Button onClick={() => setStep(2)} className="px-8">
          {lang === 'ca' ? 'Següent →' : 'Siguiente →'}
        </Button>
        <button onClick={() => setStep(2)} className="text-sm text-muted-foreground">
          {lang === 'ca' ? 'Saltar' : 'Saltar'}
        </button>
      </div>
    </div>
  );

  // STEP 2 — Pet
  if (step === 2) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-card text-center overflow-y-auto">
      <div className="text-5xl mb-4">🐕</div>
      <h1 className="text-xl font-bold text-foreground mb-1">
        {lang === 'ca' ? 'Tens mascota?' : '¿Tienes mascota?'}
      </h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {lang === 'ca' ? 'Personalitzarem les alertes amb el seu nom' : 'Personalizaremos las alertas con su nombre'}
      </p>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { id: 'dog', emoji: '🐕', label: lang === 'ca' ? 'Gos' : 'Perro' },
          { id: 'cat', emoji: '🐱', label: lang === 'ca' ? 'Gat' : 'Gato' },
          { id: 'other', emoji: '🐾', label: lang === 'ca' ? 'Altra' : 'Otra' },
          { id: 'none', emoji: '❌', label: lang === 'ca' ? 'No tinc' : 'No tengo' },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setPetType(p.id)}
            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${petType === p.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
          >
            <span className="text-3xl mb-1">{p.emoji}</span>
            <span className="text-xs font-medium text-foreground">{p.label}</span>
          </button>
        ))}
      </div>
      {petType && petType !== 'none' && (
        <Input
          value={petName}
          onChange={e => setPetName(e.target.value)}
          placeholder={lang === 'ca' ? 'Nom de la mascota' : 'Nombre de la mascota'}
          className="max-w-xs mt-2 text-center"
        />
      )}
      <div className="flex items-center gap-3 mt-6 p-3 rounded-lg bg-muted max-w-xs w-full">
        <span className="text-sm text-foreground flex-1 text-left">
          {lang === 'ca' ? 'Tens fills petits?' : '¿Tienes hijos pequeños?'}
        </span>
        <Switch checked={hasChildren} onCheckedChange={setHasChildren} />
      </div>
      {dotsAlt(4)}
      <div className="flex flex-col items-center gap-3 mt-6">
        <Button onClick={() => setStep(3)} className="px-8">
          {lang === 'ca' ? 'Següent →' : 'Siguiente →'}
        </Button>
        <button onClick={() => setStep(3)} className="text-sm text-muted-foreground">
          {lang === 'ca' ? 'Saltar' : 'Saltar'}
        </button>
      </div>
    </div>
  );

  // STEP 3 — Municipality
  if (step === 3) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-card text-center">
      <div className="text-5xl mb-4">📍</div>
      <h1 className="text-xl font-bold text-foreground mb-1">
        {lang === 'ca' ? 'On passeges normalment?' : '¿Dónde paseas normalmente?'}
      </h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {lang === 'ca' ? "Personalitzarem alertes i contactes d'emergència" : 'Personalizaremos alertas y contactos de emergencia'}
      </p>
      <div className="relative w-full max-w-xs">
        <Input
          value={municipalitySearch}
          onChange={e => { setMunicipalitySearch(e.target.value); setSelectedMunicipality(null); }}
          placeholder={lang === 'ca' ? 'Cerca el teu municipi...' : 'Busca tu municipio...'}
          className="text-center"
        />
        {searching && (
          <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-10 p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {lang === 'ca' ? 'Cercant...' : 'Buscando...'}
          </div>
        )}
        {!searching && searchResults.length > 0 && !selectedMunicipality && (
          <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {searchResults.map(m => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMunicipality(m);
                  setMunicipalitySearch(lang === 'ca' ? m.name_ca : m.name_es);
                }}
                className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-foreground"
              >
                {lang === 'ca' ? m.name_ca : m.name_es}
                <span className="text-muted-foreground ml-1 text-xs">({lang === 'ca' ? m.comarca_ca : m.comarca_es})</span>
              </button>
            ))}
          </div>
        )}
        {!searching && searchResults.length === 0 && municipalitySearch.length >= 2 && !selectedMunicipality && (
          <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg z-10 p-3 text-sm text-muted-foreground text-center">
            {lang === 'ca' ? "No s'ha trobat cap municipi" : 'No se encontró ningún municipio'}
          </div>
        )}
      </div>
      <button
        onClick={detectLocation}
        disabled={gpsDetecting}
        className="mt-3 text-sm text-primary font-medium flex items-center gap-1"
      >
        {gpsDetecting ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> {lang === 'ca' ? 'Detectant...' : 'Detectando...'}</>
        ) : (
          <>📍 {lang === 'ca' ? 'Detectar ubicació' : 'Detectar ubicación'}</>
        )}
      </button>
      {selectedMunicipality && (
        <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 max-w-xs w-full">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">
              ✅ {lang === 'ca' ? selectedMunicipality.name_ca : selectedMunicipality.name_es}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: RISK_COLORS[selectedMunicipality.risk_level] || '#888' }}
            >
              {selectedMunicipality.risk_level.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === 'ca' ? selectedMunicipality.comarca_ca : selectedMunicipality.comarca_es}
          </p>
        </div>
      )}
      {dotsAlt(4)}
      <div className="flex flex-col items-center gap-3 mt-6">
        <Button onClick={finish} disabled={saving} className="px-8">
          {saving
            ? (lang === 'ca' ? 'Desant...' : 'Guardando...')
            : (lang === 'ca' ? 'Finalitzar configuració ✓' : 'Finalizar configuración ✓')}
        </Button>
        <button onClick={finish} className="text-sm text-muted-foreground">
          {lang === 'ca' ? 'Saltar per ara' : 'Saltar por ahora'}
        </button>
      </div>
    </div>
  );

  // STEP 4 — Celebration
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 text-center" style={{ background: '#1B4332' }}>
      {showConfetti && <Confetti count={50} />}
      <div className="text-6xl mb-4">🎉</div>
      <h1 className="text-2xl font-bold text-white mb-2">
        {lang === 'ca' ? 'Tot llest! Benvingut/da a ProcesoCat 🎉' : '¡Todo listo! Bienvenido/a a ProcesoCat 🎉'}
      </h1>
      <p className="text-white/70 text-sm">
        {lang === 'ca' ? 'Redirigint al mapa...' : 'Redirigiendo al mapa...'}
      </p>
    </div>
  );
};

export default OnboardingPage;
