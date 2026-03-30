import { useState, useRef, useEffect, useCallback } from 'react';
import { Phone, X, MapPin, Globe, Mail, ChevronDown, ChevronUp, Search, Navigation, Share2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getMunicipalityById, Municipality, MUNICIPALITIES, searchMunicipalities } from '@/data/municipalData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SOSButtonProps {
  alertType?: string;
}

const SOSButton = ({ alertType }: SOSButtonProps) => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuth();
  const lang = i18n.language;
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [activeMunicipalityId, setActiveMunicipalityId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve municipality
  const municipalityId = activeMunicipalityId || user?.municipality_id || localStorage.getItem('municipality_id') || localStorage.getItem('user_municipality');
  const municipality: Municipality | undefined = municipalityId ? getMunicipalityById(municipalityId) : undefined;
  const petName = user?.pet_name || '';
  const mName = municipality ? (lang === 'ca' ? municipality.name_ca : municipality.name_es) : '';
  const comarcaName = municipality ? (lang === 'ca' ? municipality.comarca_ca : municipality.comarca_es) : '';

  // Haversine
  const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const findNearestMunicipality = useCallback((lat: number, lng: number) => {
    let nearest: Municipality | null = null;
    let minDist = Infinity;
    for (const m of MUNICIPALITIES) {
      const d = haversine(lat, lng, m.lat, m.lng);
      if (d < minDist) { minDist = d; nearest = m; }
    }
    return nearest;
  }, []);

  const requestGPS = useCallback(() => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setGpsLoading(false);
        if (!municipalityId) {
          const nearest = findNearestMunicipality(loc.lat, loc.lng);
          if (nearest) {
            setActiveMunicipalityId(nearest.id);
            localStorage.setItem('user_municipality', nearest.id);
            if (updateProfile) updateProfile({ municipality_id: nearest.id });
          }
        }
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [municipalityId, findNearestMunicipality, updateProfile]);

  // Auto-detect on open
  useEffect(() => {
    if (open && !municipality) {
      requestGPS();
    }
    if (open) {
      // Always try to get location for sharing
      navigator.geolocation?.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [open]);

  const selectMunicipality = (m: Municipality) => {
    setActiveMunicipalityId(m.id);
    localStorage.setItem('user_municipality', m.id);
    if (updateProfile) updateProfile({ municipality_id: m.id });
    setSearchOpen(false);
    setSearchQuery('');
  };

  // Long press → direct call 112
  const startLongPress = () => {
    let count = 3;
    setCountdown(count);
    try { navigator.vibrate?.([200, 100, 200]); } catch {}
    timerRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(timerRef.current!);
        setCountdown(null);
        window.location.href = 'tel:112';
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const endLongPress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdown !== null && countdown > 0) {
      setCountdown(null);
      setOpen(true);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const callPhone = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s/g, '')}`;
  };

  const openMaps = (address: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  const shareWhatsApp = () => {
    if (!userLocation) return;
    const userName = user?.name || '';
    const msg = `🆘 ${lang === 'ca' ? 'Necessito ajuda' : 'Necesito ayuda'}. ${lang === 'ca' ? 'La meva ubicació exacta' : 'Mi ubicación exacta'}:\nhttps://maps.google.com/?q=${userLocation.lat.toFixed(4)},${userLocation.lng.toFixed(4)}\n(${mName || ''})\n${lang === 'ca' ? 'Contacte' : 'Contacto'}: ${userName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const searchResults = searchQuery.length >= 2 ? searchMunicipalities(searchQuery) : [];

  // Alert-type context
  const alertBanner = alertType ? getAlertBanner(alertType, lang, t) : null;
  const highlightSection = alertType ? getHighlightSection(alertType) : null;

  return (
    <>
      {/* SOS FAB */}
      <button
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={() => { if (timerRef.current) clearInterval(timerRef.current); setCountdown(null); }}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
        className="fixed bottom-20 right-4 z-[9998] w-14 h-14 rounded-full flex items-center justify-center shadow-lg md:bottom-6"
        style={{ backgroundColor: '#CC0000' }}
        aria-label="SOS"
      >
        {countdown !== null ? (
          <span className="text-white text-xl font-bold">{countdown}</span>
        ) : (
          <Phone className="text-white" size={24} />
        )}
        <span className="absolute inset-0 rounded-full animate-sos-pulse" style={{ backgroundColor: '#CC0000' }} />
      </button>

      {/* Full-screen SOS panel */}
      {open && (
        <div className="fixed inset-0 z-[10000] bg-white overflow-y-auto animate-slide-in-bottom">
          {/* Header */}
          <div className="bg-[#CC0000] text-white p-4 pt-8 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h1 className="text-xl font-bold">🆘 {t('municipality.emergencyTitle')}</h1>
              {mName && <p className="text-sm opacity-90">{mName}</p>}
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/20">
              <X size={24} />
            </button>
          </div>

          <div className="p-4 space-y-4 pb-24">
            {/* Location bar */}
            {userLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <MapPin size={14} />
                  <span>📍 {userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E</span>
                  {mName && <span className="text-xs opacity-70">· {mName}, {comarcaName}</span>}
                </div>
                <button onClick={shareWhatsApp} className="text-blue-600 p-1.5 rounded-lg hover:bg-blue-100">
                  <Share2 size={16} />
                </button>
              </div>
            )}

            {/* WhatsApp share button */}
            {userLocation && (
              <Button onClick={shareWhatsApp} variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50" size="sm">
                📤 {lang === 'ca' ? 'Compartir ubicació per WhatsApp' : 'Compartir ubicación por WhatsApp'}
              </Button>
            )}

            {/* Alert-type banner */}
            {alertBanner && (
              <div className={`rounded-xl p-3 border ${alertBanner.className}`}>
                <p className="font-bold text-sm">{alertBanner.icon} {alertBanner.title}</p>
                <p className="text-xs mt-1">{alertBanner.subtitle}</p>
              </div>
            )}

            {/* No municipality — search/GPS */}
            {!municipality && !gpsLoading && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-yellow-800">
                  {lang === 'ca' ? 'En quin municipi ets ara?' : '¿En qué municipio estás ahora?'}
                </p>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('municipality.search')}
                    className="pl-9 h-9 text-sm"
                    autoFocus
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map((m) => (
                      <button key={m.id} onClick={() => selectMunicipality(m)} className="w-full text-left p-2 rounded-lg hover:bg-yellow-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{lang === 'ca' ? m.name_ca : m.name_es}</p>
                          <p className="text-xs text-muted-foreground">{lang === 'ca' ? m.comarca_ca : m.comarca_es}</p>
                        </div>
                        {userLocation && (
                          <span className="text-xs text-muted-foreground">
                            {haversine(userLocation.lat, userLocation.lng, m.lat, m.lng).toFixed(1)}km
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <Button onClick={requestGPS} variant="outline" size="sm" className="w-full">
                  <Navigation size={14} className="mr-1" /> {t('municipality.useLocation')}
                </Button>
              </div>
            )}

            {gpsLoading && !municipality && (
              <div className="flex items-center gap-2 justify-center p-4 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" /> {lang === 'ca' ? 'Detectant el teu municipi...' : 'Detectando tu municipio...'}
              </div>
            )}

            {/* SECTION 1: 112 */}
            <div className={`bg-gray-50 rounded-xl p-4 ${highlightSection === '112' ? 'ring-2 ring-red-400 animate-pulse' : ''}`}>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">{t('municipality.alwaysAvailable')}</p>
              <button
                onClick={() => callPhone('112')}
                className="w-full bg-[#CC0000] text-white rounded-xl p-4 flex items-center gap-3 active:scale-[0.98] transition"
              >
                <Phone size={28} />
                <div className="text-left">
                  <p className="font-bold text-lg">📞 112 — {t('municipality.generalEmergency')}</p>
                  <p className="text-sm opacity-90">{t('municipality.emergencySubtitle')}</p>
                </div>
              </button>
            </div>

            {/* SECTION 2: Vets */}
            {municipality && municipality.vets.length > 0 && (
              <div className={`rounded-xl border overflow-hidden ${highlightSection === 'vets' ? 'ring-2 ring-green-400 animate-pulse' : ''}`}>
                <div className="bg-[#2D6A4F] text-white p-3">
                  <p className="font-bold">🐾 {t('municipality.vets')}</p>
                  {petName && <p className="text-sm opacity-90">{t('municipality.forPet', { name: petName })}</p>}
                </div>
                <div className="p-3 space-y-3">
                  {municipality.vets.map((vet, i) => (
                    <div key={i} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{vet.name}</p>
                          <p className="text-xs text-muted-foreground">{vet.address}</p>
                        </div>
                        {vet.emergency && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                            {t('municipality.emergency24h')}
                          </span>
                        )}
                      </div>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${vet.hours === '24h' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {vet.hours}
                      </span>
                      {userLocation && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 ~{haversine(userLocation.lat, userLocation.lng, municipality.lat, municipality.lng).toFixed(1)}km
                        </p>
                      )}
                      <Button
                        onClick={() => callPhone(vet.phone)}
                        className="w-full mt-2 bg-[#2D6A4F] hover:bg-[#245a42] text-white"
                        size="sm"
                      >
                        📞 {t('municipality.callButton', { phone: vet.phone })}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: Ajuntament */}
            {municipality && (
              <div className={`rounded-xl border overflow-hidden ${highlightSection === 'ajuntament' ? 'ring-2 ring-blue-400 animate-pulse' : ''}`}>
                <div className="bg-[#1a3a5c] text-white p-3">
                  <p className="font-bold">🏛️ {t('municipality.townHall', { name: mName })}</p>
                  <p className="text-xs opacity-80">{municipality.ajuntament.address}</p>
                </div>
                <div className="p-3 space-y-2">
                  <Button onClick={() => callPhone(municipality.ajuntament.phone)} className="w-full bg-[#1a3a5c] hover:bg-[#15304d] text-white" size="sm">
                    📞 {t('municipality.callButton', { phone: municipality.ajuntament.phone })}
                  </Button>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(`https://${municipality.ajuntament.web}`, '_blank')}>
                      <Globe size={14} className="mr-1" /> Web
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${municipality.ajuntament.email}`}>
                      <Mail size={14} className="mr-1" /> Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openMaps(municipality.ajuntament.address)}>
                      <MapPin size={14} className="mr-1" /> {lang === 'ca' ? 'Arribar' : 'Llegar'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: Local services */}
            {municipality && (
              <div className={`rounded-xl border overflow-hidden ${highlightSection === 'agents' ? 'ring-2 ring-orange-400 animate-pulse' : ''}`}>
                <div className="bg-gray-800 text-white p-3">
                  <p className="font-bold">🚨 {t('municipality.localServices')}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-3">
                  <Button variant="outline" size="sm" onClick={() => callPhone(municipality.emergencies.policia_local)} className="flex-col h-auto py-3 text-xs">
                    🚔 {t('municipality.policiaLocal')}
                    <span className="text-[10px] text-muted-foreground">{municipality.emergencies.policia_local}</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => callPhone('085')} className="flex-col h-auto py-3 text-xs">
                    🚒 {t('municipality.bombers')}
                    <span className="text-[10px] text-muted-foreground">085</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => callPhone('088')} className="flex-col h-auto py-3 text-xs">
                    🚔 Mossos
                    <span className="text-[10px] text-muted-foreground">088</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => callPhone('900050051')} className="flex-col h-auto py-3 text-xs">
                    🌿 Agents Rurals
                    <span className="text-[10px] text-muted-foreground">900 050 051</span>
                  </Button>
                </div>
              </div>
            )}

            {/* SECTION 5: Sanitat Forestal */}
            {municipality && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="font-bold text-sm text-green-800">🌲 {t('municipality.forestHealth')}</p>
                <p className="text-xs text-green-700 mt-1">{municipality.sanitat_forestal}</p>
              </div>
            )}

            {/* SECTION 6: Symptoms */}
            <Collapsible open={symptomsOpen} onOpenChange={setSymptomsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full bg-orange-50 border border-orange-200 rounded-xl p-4">
                <span className="font-bold text-sm text-orange-800">⚠️ {t('municipality.symptoms')}</span>
                {symptomsOpen ? <ChevronUp size={16} className="text-orange-600" /> : <ChevronDown size={16} className="text-orange-600" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="bg-orange-50 border border-t-0 border-orange-200 rounded-b-xl p-4 space-y-4">
                <div>
                  <p className="font-semibold text-sm text-orange-800">
                    {petName
                      ? t('municipality.symptomsDogPet', { name: petName })
                      : t('municipality.symptomsDog')}
                  </p>
                  <ul className="text-xs text-orange-700 mt-1 space-y-1 list-disc pl-4">
                    <li>{t('municipality.symDog1')}</li>
                    <li>{t('municipality.symDog2')}</li>
                    <li>{t('municipality.symDog3')}</li>
                    <li className="font-bold">{t('municipality.symDog4')}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-sm text-orange-800">{t('municipality.symptomsHuman')}</p>
                  <ul className="text-xs text-orange-700 mt-1 space-y-1 list-disc pl-4">
                    <li>{t('municipality.symHuman1')}</li>
                    <li>{t('municipality.symHuman2')}</li>
                    <li>{t('municipality.symHuman3')}</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Change municipality */}
            {municipality && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  {lang === 'ca' ? `No estàs a ${mName}?` : `¿No estás en ${mName}?`}
                </p>
                <button onClick={() => setSearchOpen(true)} className="text-xs text-primary underline mt-1">
                  {t('municipality.change')}
                </button>
              </div>
            )}

            {/* Long press hint */}
            <p className="text-xs text-center text-muted-foreground pt-2">
              {t('municipality.longPressHint')}
            </p>
          </div>
        </div>
      )}

      {/* Municipality search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[10001] bg-white overflow-y-auto animate-slide-in-bottom">
          <div className="p-4 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">{lang === 'ca' ? 'On ets ara?' : '¿Dónde estás ahora?'}</h2>
                <p className="text-xs text-muted-foreground">{lang === 'ca' ? "Trobarem els contactes d'emergència locals" : 'Encontraremos los contactos de emergencia locales'}</p>
              </div>
              <button onClick={() => setSearchOpen(false)} className="p-2"><X size={20} /></button>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('municipality.search')}
                className="pl-9"
                autoFocus
              />
            </div>
            <Button onClick={requestGPS} variant="outline" className="w-full mb-4">
              <Navigation size={14} className="mr-2" /> {t('municipality.useLocation')}
            </Button>
            <div className="space-y-1">
              {(searchQuery.length >= 2 ? searchResults : MUNICIPALITIES.slice(0, 8)).map((m) => (
                <button key={m.id} onClick={() => selectMunicipality(m)} className="w-full text-left p-3 rounded-lg hover:bg-accent flex items-center justify-between border">
                  <div>
                    <p className="text-sm font-medium">{lang === 'ca' ? m.name_ca : m.name_es}</p>
                    <p className="text-xs text-muted-foreground">{lang === 'ca' ? m.comarca_ca : m.comarca_es}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${m.risk_level === 'very_high' ? 'bg-red-500' : 'bg-orange-400'}`} />
                    {userLocation && (
                      <span className="text-xs text-muted-foreground">
                        {haversine(userLocation.lat, userLocation.lng, m.lat, m.lng).toFixed(1)}km
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Alert type context helpers
function getAlertBanner(type: string, lang: string, _t: any) {
  const banners: Record<string, { icon: string; title: string; subtitle: string; className: string }> = {
    procesionaria: {
      icon: '🐛',
      title: lang === 'ca' ? 'Contacte amb processionària' : 'Contacto con procesionaria',
      subtitle: lang === 'ca' ? 'Truca al veterinari IMMEDIATAMENT' : 'Llama al veterinario INMEDIATAMENTE',
      className: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    veneno: {
      icon: '☠️',
      title: lang === 'ca' ? 'Possible intoxicació per verí' : 'Posible intoxicación por veneno',
      subtitle: lang === 'ca' ? 'Truca al 112 i al veterinari URGENT' : 'Llama al 112 y al veterinario URGENTE',
      className: 'bg-red-50 border-red-300 text-red-800'
    },
    trampa: {
      icon: '🪤',
      title: lang === 'ca' ? 'Trampa il·legal detectada' : 'Trampa ilegal detectada',
      subtitle: lang === 'ca' ? "No intentis retirar-la. Truca als Agents Rurals" : 'No intentes retirarla. Llama a Agents Rurals',
      className: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    basura: {
      icon: '🗑️',
      title: lang === 'ca' ? 'Brossa perillosa' : 'Basura peligrosa',
      subtitle: lang === 'ca' ? "Avisa a l'Ajuntament" : 'Avisa al Ayuntamiento',
      className: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  };
  return banners[type] || null;
}

function getHighlightSection(type: string): string | null {
  const map: Record<string, string> = {
    procesionaria: 'vets',
    veneno: '112',
    trampa: 'agents',
    basura: 'ajuntament'
  };
  return map[type] || null;
}

export default SOSButton;
