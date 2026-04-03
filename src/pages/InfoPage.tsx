import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Leaf } from 'lucide-react';

const MONTHS_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTHS_CA = ['Gen','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Oct','Nov','Des'];

const MONTH_DATA = [
  { emoji: '🟡', level_es: 'Medio', level_ca: 'Mitjà', desc_es: 'Procesiones comienzan', desc_ca: 'Les processons comencen', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  { emoji: '🟠', level_es: 'Alto', level_ca: 'Alt', desc_es: 'Actividad creciente', desc_ca: 'Activitat creixent', bg: 'bg-orange-50', border: 'border-orange-300' },
  { emoji: '🔴', level_es: 'MÁXIMO', level_ca: 'MÀXIM', desc_es: 'Pico de procesiones', desc_ca: 'Pic de processons', bg: 'bg-red-50', border: 'border-red-400' },
  { emoji: '🔴', level_es: 'MÁXIMO', level_ca: 'MÀXIM', desc_es: 'Máximo peligro', desc_ca: 'Màxim perill', bg: 'bg-red-50', border: 'border-red-400' },
  { emoji: '🟠', level_es: 'Alto', level_ca: 'Alt', desc_es: 'Descendiendo', desc_ca: 'Descendint', bg: 'bg-orange-50', border: 'border-orange-300' },
  { emoji: '🟡', level_es: 'Medio', level_ca: 'Mitjà', desc_es: 'Actividad reducida', desc_ca: 'Activitat reduïda', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  { emoji: '🟢', level_es: 'Bajo', level_ca: 'Baix', desc_es: 'Temporada baja', desc_ca: 'Temporada baixa', bg: 'bg-green-50', border: 'border-green-300' },
  { emoji: '🟢', level_es: 'Bajo', level_ca: 'Baix', desc_es: 'Temporada baja', desc_ca: 'Temporada baixa', bg: 'bg-green-50', border: 'border-green-300' },
  { emoji: '🟢', level_es: 'Bajo', level_ca: 'Baix', desc_es: 'Construcción de nidos', desc_ca: 'Construcció de nius', bg: 'bg-green-50', border: 'border-green-300' },
  { emoji: '🟡', level_es: 'Medio', level_ca: 'Mitjà', desc_es: 'Nidos visibles', desc_ca: 'Nius visibles', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  { emoji: '🟡', level_es: 'Medio', level_ca: 'Mitjà', desc_es: 'Nidos en crecimiento', desc_ca: 'Nius en creixement', bg: 'bg-yellow-50', border: 'border-yellow-300' },
  { emoji: '🟡', level_es: 'Medio', level_ca: 'Mitjà', desc_es: 'Preparación temporada', desc_ca: 'Preparació temporada', bg: 'bg-yellow-50', border: 'border-yellow-300' },
];

const VIDEOS = [
  { icon: '🐕', title_es: 'Si tu perro la ha tocado', title_ca: 'Si el teu gos l\'ha tocat', src_es: 'Col·legi de Veterinaris de Catalunya', src_ca: 'Col·legi de Veterinaris de Catalunya', videoId: 'placeholder1' },
  { icon: '👶', title_es: 'Si un niño la ha tocado', title_ca: 'Si un nen l\'ha tocat', src_es: 'Cruz Roja España', src_ca: 'Creu Roja Espanya', videoId: 'placeholder2' },
  { icon: '🔍', title_es: 'Cómo identificar un nido', title_ca: 'Com identificar un niu', src_es: 'Generalitat de Catalunya', src_ca: 'Generalitat de Catalunya', videoId: 'placeholder3' },
  { icon: '🌲', title_es: 'Qué es la procesionaria', title_ca: 'Què és la processionària', src_es: 'Universitat Autònoma de Barcelona', src_ca: 'Universitat Autònoma de Barcelona', videoId: 'placeholder4' },
  { icon: '🏡', title_es: 'Prevención y tratamiento', title_ca: 'Prevenció i tractament', src_es: 'Ministerio de Medio Ambiente', src_ca: 'Ministeri de Medi Ambient', videoId: 'placeholder5' },
];

const OFFICIAL_RESOURCES = [
  { name: 'Generalitat de Catalunya — Sanitat Forestal', url: 'https://agricultura.gencat.cat', domain: 'gencat.cat' },
  { name_es: 'Agents Rurals Catalunya', name_ca: 'Agents Rurals Catalunya', url: '', phone: '900050051', domain: '900 050 051 (gratuït/gratuito)' },
  { name: 'Col·legi de Veterinaris de Barcelona', url: 'https://www.covb.cat', domain: 'covb.cat' },
  { name_es: 'Cruz Roja España — Primeros auxilios', name_ca: 'Creu Roja Espanya — Primers auxilis', url: 'https://www.cruzroja.es', domain: 'cruzroja.es' },
];

const InfoPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const lang = i18n.language;
  const currentMonth = new Date().getMonth();
  const months = lang === 'ca' ? MONTHS_CA : MONTHS_ES;

  const [nestOpen, setNestOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [openVideos, setOpenVideos] = useState<Record<number, boolean>>({});

  const goReport = () => navigate(user ? '/map' : '/register');

  return (
    <div className="max-w-[720px] mx-auto px-4 py-6 pb-28 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Leaf className="text-primary" size={24} />
          {t('info.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('info.subtitle')}</p>
      </div>

      {/* SECTION 1: EMERGENCIAS */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-destructive">🚨 {t('info.emergencyTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Dog card */}
          <Card className="border-l-4" style={{ borderLeftColor: '#CC0000', backgroundColor: '#FFF5F5' }}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-3xl">🐕</span>
                <h3 className="font-bold text-base" style={{ color: '#CC0000' }}>{t('info.dogTitle')}</h3>
              </div>
              <ul className="text-[13px] space-y-1 text-foreground list-disc pl-5">
                <li>{t('info.dogS1')}</li>
                <li>{t('info.dogS2')}</li>
                <li>{t('info.dogS3')}</li>
                <li>{t('info.dogS4')}</li>
                <li className="font-bold">{t('info.dogS5')}</li>
              </ul>
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 text-sm font-semibold text-orange-800">
                ⚠️ {t('info.dogWarning')}
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => toast({ title: t('info.vetMock') })}>
                📞 {t('info.callVet')}
              </Button>
              <p className="text-xs text-muted-foreground">{t('info.dogNote')}</p>
            </CardContent>
          </Card>

          {/* Child card */}
          <Card className="border-l-4" style={{ borderLeftColor: '#F97316', backgroundColor: '#FFFBF0' }}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-3xl">👶</span>
                <h3 className="font-bold text-base" style={{ color: '#F97316' }}>{t('info.childTitle')}</h3>
              </div>
              <ul className="text-[13px] space-y-1 text-foreground list-disc pl-5">
                <li>{t('info.childS1')}</li>
                <li>{t('info.childS2')}</li>
                <li>{t('info.childS3')}</li>
                <li>{t('info.childS4')}</li>
                <li className="font-bold">{t('info.childS5')}</li>
              </ul>
              <div className="text-[13px] space-y-1 text-foreground">
                <p>1. {t('info.childA1')}</p>
                <p>2. {t('info.childA2')}</p>
                <p>3. {t('info.childA3')}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={() => { window.location.href = 'tel:112'; }}>🆘 {t('info.call112')}</Button>
                <Button variant="outline" className="flex-1 text-xs" onClick={() => window.open('https://www.google.com/maps/search/urgencias+cerca', '_blank')}>{t('info.nearbyER')}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 2: CALENDAR */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">📅 {t('info.calendarTitle')}</h2>
        <p className="text-sm text-muted-foreground">{t('info.calendarSubtitle')}</p>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {MONTH_DATA.map((m, i) => {
            const isCurrent = i === currentMonth;
            return (
              <div key={i} className={`rounded-xl p-2.5 text-center border-2 ${m.bg} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : m.border}`}>
                <p className="text-xs font-bold text-foreground">{months[i]}</p>
                <p className="text-lg">{m.emoji}</p>
                <p className="text-[10px] font-semibold text-foreground">{lang === 'ca' ? m.level_ca : m.level_es}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{lang === 'ca' ? m.desc_ca : m.desc_es}</p>
                {isCurrent && <span className="text-[9px] font-bold text-primary">{t('info.now')}</span>}
              </div>
            );
          })}
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground">
          💡 {t('info.monthTip')}
        </div>
      </section>

      {/* SECTION 3: IDENTIFY NEST */}
      <Collapsible open={nestOpen} onOpenChange={setNestOpen}>
        <CollapsibleTrigger className="w-full">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardContent className="py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">🔍 {t('info.identifyTitle')}</h2>
              <ChevronDown className={`text-muted-foreground transition-transform ${nestOpen ? 'rotate-180' : ''}`} size={20} />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🕸️', title_es: 'Apariencia', title_ca: 'Aparença', desc_es: 'Bolsa de seda blanca. Similar a un calcetín de lana en la copa del árbol.', desc_ca: 'Bossa de seda blanca. Similar a un mitjó de llana a la copa de l\'arbre.' },
                { icon: '🌲', title_es: 'Ubicación', title_ca: 'Ubicació', desc_es: 'Siempre en pinos. En las ramas más altas y expuestas al sol.', desc_ca: 'Sempre en pins. A les branques més altes i exposades al sol.' },
                { icon: '⚽', title_es: 'Tamaño', title_ca: 'Mida', desc_es: 'Pelota de tenis a balón. Más grande = más peligroso.', desc_ca: 'Pilota de tennis a pilota. Més gran = més perillós.' },
                { icon: '📅', title_es: 'Época', title_ca: 'Època', desc_es: 'Todo el año. Más visibles en invierno sin hojas.', desc_ca: 'Tot l\'any. Més visibles a l\'hivern sense fulles.' },
              ].map((c, i) => (
                <Card key={i}>
                  <CardContent className="pt-4 text-center">
                    <span className="text-3xl">{c.icon}</span>
                    <p className="font-semibold text-sm mt-2 text-foreground">{lang === 'ca' ? c.title_ca : c.title_es}</p>
                    <p className="text-xs text-muted-foreground mt-1">{lang === 'ca' ? c.desc_ca : c.desc_es}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-foreground">
              🚨 {t('info.nestWarning')}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* SECTION 4: WHAT TO DO */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">✅ {t('info.whatToDoTitle')}</h2>
        <div className="space-y-4">
          {[
            { num: 1, icon: '🚫', title_es: 'No te acerques', title_ca: 'No t\'acostis', desc_es: 'Mantén distancia mínima de 5 metros. Los pelos son microscópicos y vuelan.', desc_ca: 'Mantingues distància mínima de 5 metres. Els pèls són microscòpics i volen.' },
            { num: 2, icon: '📱', title_es: 'Repórtalo en ProcesoCat', title_ca: 'Reporta-ho a ProcesoCat', desc_es: 'Avisa a otros usuarios para que eviten la zona.', desc_ca: 'Avisa altres usuaris perquè evitin la zona.', action: true },
            { num: 3, icon: '🏛️', title_es: 'Avisa al ayuntamiento', title_ca: 'Avisa l\'ajuntament', desc_es: 'El ayuntamiento es responsable de tratamientos en zonas públicas.', desc_ca: 'L\'ajuntament és responsable dels tractaments en zones públiques.' },
            { num: 4, icon: '📞', title_es: 'Contacta con Agents Rurals', title_ca: 'Contacta amb Agents Rurals', desc_es: 'Para nidos en zonas forestales: 900 050 051 (gratuito)', desc_ca: 'Per a nius en zones forestals: 900 050 051 (gratuït)', phone: true },
            { num: 5, icon: '🚗', title_es: 'Si hay afectados', title_ca: 'Si hi ha afectats', desc_es: 'Veterinario para perros. Urgencias para personas. No esperes.', desc_ca: 'Veterinari per a gossos. Urgències per a persones. No esperis.' },
          ].map(step => (
            <div key={step.num} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">{step.num}</div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{step.icon} {lang === 'ca' ? step.title_ca : step.title_es}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{lang === 'ca' ? step.desc_ca : step.desc_es}</p>
                {step.action && (
                  <Button size="sm" className="mt-2" onClick={goReport}>+ {t('info.reportNest')}</Button>
                )}
                {step.phone && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => { window.location.href = 'tel:900050051'; }}>📞 {t('info.callAgents')}</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: VIDEOS — FREE FOR ALL USERS */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">🎥 {t('info.videosTitle')}</h2>
        <p className="text-xs text-primary font-medium">{t('info.videosFreeNote')}</p>
        {VIDEOS.map((v, i) => (
          <Collapsible key={i} open={!!openVideos[i]} onOpenChange={o => setOpenVideos(prev => ({ ...prev, [i]: o }))}>
            <CollapsibleTrigger className="w-full">
              <Card className="cursor-pointer hover:shadow-sm transition">
                <CardContent className="py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{v.icon} {lang === 'ca' ? v.title_ca : v.title_es}</span>
                  <ChevronDown className={`text-muted-foreground transition-transform ${openVideos[i] ? 'rotate-180' : ''}`} size={16} />
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1 mb-2">
                {openVideos[i] && (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${v.videoId}`}
                    width="100%"
                    height="215"
                    frameBorder="0"
                    className="rounded-lg"
                    style={{ border: 'none', borderRadius: '8px' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={lang === 'ca' ? v.title_ca : v.title_es}
                  />
                )}
                <p className="text-[11px] text-muted-foreground mt-1">{t('info.source')}: {lang === 'ca' ? v.src_ca : v.src_es}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
        {/* Disclaimer */}
        <div className="bg-muted/50 border border-border rounded-xl p-4 flex gap-2 text-xs text-muted-foreground">
          <span>ℹ️</span>
          <span>{t('info.videosFullDisclaimer')}</span>
        </div>
      </section>

      {/* SECTION 5b: OFFICIAL RESOURCES */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">🔗 {t('info.officialResources')}</h2>
        <div className="space-y-2">
          {OFFICIAL_RESOURCES.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target={r.url.startsWith('tel:') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition"
            >
              <span className="text-sm font-medium text-foreground">
                {(r as any).name || (lang === 'ca' ? (r as any).name_ca : (r as any).name_es)}
              </span>
              <span className="text-xs text-primary">{r.domain}</span>
            </a>
          ))}
        </div>
      </section>

      {/* SECTION 6: ABOUT */}
      <Collapsible open={aboutOpen} onOpenChange={setAboutOpen}>
        <CollapsibleTrigger className="w-full">
          <Card className="cursor-pointer hover:shadow-md transition">
            <CardContent className="py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">ℹ️ {t('info.aboutTitle')}</h2>
              <ChevronDown className={`text-muted-foreground transition-transform ${aboutOpen ? 'rotate-180' : ''}`} size={20} />
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-foreground leading-relaxed">{t('info.aboutText')}</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🌡️', title_es: 'Activa en invierno', title_ca: 'Activa a l\'hivern', desc_es: 'Las orugas bajan del árbol entre enero y abril', desc_ca: 'Les erugues baixen de l\'arbre entre gener i abril' },
                { icon: '☠️', title_es: 'Pelos urticantes', title_ca: 'Pèls urticants', desc_es: 'Contienen taumatopoeína, extremadamente irritante', desc_ca: 'Contenen taumatopoeïna, extremadament irritant' },
                { icon: '🐕', title_es: 'Peligro para perros', title_ca: 'Perill per a gossos', desc_es: 'La lengua es especialmente sensible. Puede causar necrosis', desc_ca: 'La llengua és especialment sensible. Pot causar necrosi' },
                { icon: '👶', title_es: 'Peligro para niños', title_ca: 'Perill per a nens', desc_es: 'La piel y ojos de los niños son muy sensibles', desc_ca: 'La pell i ulls dels nens són molt sensibles' },
                { icon: '🌲', title_es: 'Solo en pinos', title_ca: 'Només en pins', desc_es: 'Busca nidos únicamente en pinos, cedros y abetos', desc_ca: 'Busca nius únicament en pins, cedres i avets' },
                { icon: '📍', title_es: 'Muy común en Cataluña', title_ca: 'Molt comú a Catalunya', desc_es: 'Especialmente en Vallès, Maresme, Osona y Bages', desc_ca: 'Especialment al Vallès, Maresme, Osona i Bages' },
              ].map((f, i) => (
                <div key={i} className="bg-muted/50 rounded-xl p-3">
                  <p className="text-lg mb-1">{f.icon}</p>
                  <p className="text-xs font-semibold text-foreground">{lang === 'ca' ? f.title_ca : f.title_es}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{lang === 'ca' ? f.desc_ca : f.desc_es}</p>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* BOTTOM CTA */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6 text-center space-y-3">
          <p className="text-xl font-bold">{t('info.ctaTitle')}</p>
          <p className="text-sm opacity-90">{t('info.ctaText')}</p>
          <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 font-semibold" onClick={goReport}>
            + {t('info.ctaButton')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPage;
