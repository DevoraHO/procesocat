import { useState, useRef, useEffect } from 'react';
import { Phone, X, MapPin, Globe, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { getMunicipalityById, Municipality } from '@/data/municipalData';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SOSButton = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language;
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [symptomsOpen, setSymptomsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const municipalityId = user?.municipality_id || localStorage.getItem('municipality_id');
  const municipality: Municipality | undefined = municipalityId ? getMunicipalityById(municipalityId) : undefined;
  const petName = user?.pet_name || '';
  const mName = municipality ? (lang === 'ca' ? municipality.name_ca : municipality.name_es) : '';

  const startLongPress = () => {
    let count = 3;
    setCountdown(count);
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

  return (
    <>
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
            {/* No municipality banner */}
            {!municipality && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-sm text-yellow-800 font-medium">{t('municipality.configureBanner')}</p>
                <Button size="sm" variant="outline" className="mt-2 text-yellow-800 border-yellow-300" onClick={() => { setOpen(false); window.location.href = '/profile'; }}>
                  {t('municipality.configureNow')}
                </Button>
              </div>
            )}

            {/* Section 1: 112 */}
            <div className="bg-gray-50 rounded-xl p-4">
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

            {/* Section 2: Vets */}
            {municipality && municipality.vets.length > 0 && (
              <div className="rounded-xl border overflow-hidden">
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

            {/* Section 3: Ajuntament */}
            {municipality && (
              <div className="rounded-xl border overflow-hidden">
                <div className="bg-[#1a3a5c] text-white p-3">
                  <p className="font-bold">🏛️ {t('municipality.townHall', { name: mName })}</p>
                </div>
                <div className="p-3 space-y-2">
                  <Button onClick={() => callPhone(municipality.ajuntament.phone)} className="w-full bg-[#1a3a5c] hover:bg-[#15304d] text-white" size="sm">
                    📞 {t('municipality.callButton', { phone: municipality.ajuntament.phone })}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(`https://${municipality.ajuntament.web}`, '_blank')}>
                    <Globe size={14} className="mr-1" /> {t('municipality.officialWeb')}
                  </Button>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = `mailto:${municipality.ajuntament.email}`}>
                    <Mail size={14} className="mr-1" /> Email
                  </Button>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={12} /> {municipality.ajuntament.address}
                  </p>
                </div>
              </div>
            )}

            {/* Section 4: Local services */}
            {municipality && (
              <div className="rounded-xl border overflow-hidden">
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

            {/* Section 5: Sanitat Forestal */}
            {municipality && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="font-bold text-sm text-green-800">🌲 {t('municipality.forestHealth')}</p>
                <p className="text-xs text-green-700 mt-1">{municipality.sanitat_forestal}</p>
              </div>
            )}

            {/* Section 6: Symptoms */}
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

            {/* Bottom hint */}
            <p className="text-xs text-center text-muted-foreground pt-2">
              {t('municipality.longPressHint')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSButton;
