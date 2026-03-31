import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Loader2, Check, X as XIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Confetti from '@/components/Confetti';
import { toast } from 'sonner';
import { stripePromise, PRICE_IDS } from '@/lib/stripe';
import { createCheckout } from '@/utils/stripeCheckout';

const PlansPage = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lang = i18n.language;
  const [yearly, setYearly] = useState(false);
  
  const [upgrading, setUpgrading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const familiarRef = useRef<HTMLDivElement>(null);

  const petName = user?.pet_name || '';
  const currentPlan = user?.plan || 'free';
  const isFree = currentPlan === 'free';
  const isFamiliar = currentPlan === 'familiar';
  const isMunicipi = currentPlan === 'municipi';

  // Handle success/cancel URL params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      updateProfile({ plan: 'familiar' });
    }
    if (searchParams.get('cancelled') === 'true') {
      toast.info(lang === 'ca' ? 'Pagament cancel·lat' : 'Pago cancelado');
    }
  }, [searchParams]);

  // Auto-scroll to familiar card if coming from upgrade prompt
  useEffect(() => {
    if (searchParams.get('highlight') === 'familiar' && familiarRef.current) {
      setTimeout(() => {
        familiarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/register');
      return;
    }
    setUpgrading(true);
    try {
      if (stripePromise) {
        const priceId = yearly ? PRICE_IDS.FAMILIAR_YEARLY : PRICE_IDS.FAMILIAR_MONTHLY;
        await createCheckout(priceId, user.id, user.email);
      } else {
        // Mock mode when Stripe key not set
        await new Promise(r => setTimeout(r, 1200));
        updateProfile({ plan: 'familiar' });
        toast.success(lang === 'ca' ? 'Pla activat correctament' : 'Plan activado correctamente');
        setShowSuccess(true);
      }
    } catch (e) {
      toast.error(lang === 'ca' ? 'Error en el pagament' : 'Error en el pago');
    } finally {
      setUpgrading(false);
    }
  };

  const freeFeatures = [
    { text: lang === 'ca' ? 'Mapa complet amb heatmap' : 'Mapa completo con heatmap', yes: true },
    { text: lang === 'ca' ? 'Veure totes les alertes actives' : 'Ver todas las alertas activas', yes: true },
    { text: lang === 'ca' ? '3 reports per mes' : '3 reportes por mes', yes: true },
    { text: lang === 'ca' ? '2 fotos per report' : '2 fotos por reporte', yes: true },
    { text: lang === 'ca' ? "Validar reports d'altres usuaris" : 'Validar reportes de otros', yes: true },
    { text: lang === 'ca' ? "Botó SOS emergències" : 'Botón SOS emergencias', yes: true },
    { text: lang === 'ca' ? 'Guies de primers auxilis' : 'Guías de primeros auxilios', yes: true },
    { text: lang === 'ca' ? 'Vídeos educatius oficials' : 'Vídeos educativos oficiales', yes: true },
    { text: lang === 'ca' ? 'Rànquing i medalles bàsiques' : 'Ranking y medallas básicas', yes: true },
    { text: lang === 'ca' ? 'Compartir alertes per WhatsApp' : 'Compartir alertas por WhatsApp', yes: true },
    { text: lang === 'ca' ? 'Notificacions push en temps real' : 'Notificaciones push en tiempo real', yes: false },
    { text: lang === 'ca' ? 'Passejada Segura 🛡️' : 'Paseo Seguro 🛡️', yes: false },
    { text: lang === 'ca' ? 'Zones guardades amb alertes' : 'Zonas guardadas con alertas', yes: false },
    { text: lang === 'ca' ? 'Vídeos propis als reports' : 'Vídeos propios en reportes', yes: false },
    { text: lang === 'ca' ? 'Informe PDF setmanal' : 'Informe PDF semanal', yes: false },
    { text: lang === 'ca' ? 'Gràfiques de les teves zones' : 'Gráficas de tus zonas', yes: false },
  ];

  const familiarFeatures = [
    { text: lang === 'ca' ? 'Tot el del Pla Gratuït' : 'Todo lo del Plan Gratuito', sub: null },
    { text: lang === 'ca' ? 'Reports il·limitats' : 'Reportes ilimitados', sub: null },
    { text: lang === 'ca' ? 'Fins a 5 fotos + 1 vídeo per report' : 'Hasta 5 fotos + 1 vídeo por reporte', sub: null },
    { text: lang === 'ca' ? '🔔 Notificacions push en temps real' : '🔔 Notificaciones push en tiempo real', sub: lang === 'ca' ? "T'avisem si hi ha perill a prop" : 'Te avisamos si hay peligro cerca' },
    { text: lang === 'ca' ? '🛡️ Passejada Segura' : '🛡️ Paseo Seguro', sub: lang === 'ca' ? "Analitza la ruta abans de sortir amb " + petName : 'Analiza la ruta antes de salir con ' + petName },
    { text: lang === 'ca' ? 'Fins a 10 zones guardades amb alertes' : 'Hasta 10 zonas guardadas con alertas', sub: lang === 'ca' ? 'Casa, parc, col·legi, ruta...' : 'Casa, parque, colegio, ruta...' },
    { text: lang === 'ca' ? 'Alertes personalitzades per nivell' : 'Alertas personalizadas por nivel', sub: null },
    { text: lang === 'ca' ? 'Perfil de mascota personalitzat' : 'Perfil de mascota personalizado', sub: petName ? (lang === 'ca' ? `Alertes amb el nom de ${petName}` : `Alertas con el nombre de ${petName}`) : null },
    { text: lang === 'ca' ? 'Informe PDF setmanal per email' : 'Informe PDF semanal por email', sub: lang === 'ca' ? 'Estat de les teves zones cada dilluns' : 'Estado de tus zonas cada lunes' },
    { text: lang === 'ca' ? 'Gràfiques setmanals de les teves zones' : 'Gráficas semanales de tus zonas', sub: null },
    { text: lang === 'ca' ? 'Historial complet de rutes i zones' : 'Historial completo de rutas y zonas', sub: null },
  ];

  const municipiFeatures = [
    { text: lang === 'ca' ? 'Tot el del Pla Familiar' : 'Todo lo del Plan Familiar', sub: null },
    { text: lang === 'ca' ? '📊 Dashboard municipal oficial' : '📊 Dashboard municipal oficial', sub: lang === 'ca' ? 'Mapa de calor, tendències, prediccions' : 'Mapa de calor, tendencias, predicciones' },
    { text: lang === 'ca' ? '📥 Exportar CSV, PDF, GeoJSON, KML' : '📥 Exportar CSV, PDF, GeoJSON, KML', sub: 'Compatible amb QGIS, ArcGIS, CartoDB' },
    { text: lang === 'ca' ? '🔌 API REST completa documentada' : '🔌 API REST completa documentada', sub: lang === 'ca' ? '10.000 crides/dia · Webhooks inclosos' : '10.000 llamadas/día · Webhooks incluidos' },
    { text: lang === 'ca' ? '✓ Validació oficial de reports' : '✓ Validación oficial de reportes', sub: lang === 'ca' ? 'Pes 3x al sistema de puntuació' : 'Peso 3x en el sistema de puntuación' },
    { text: lang === 'ca' ? 'Zones tractades oficialment al mapa' : 'Zonas tratadas oficialmente en el mapa', sub: null },
    { text: lang === 'ca' ? "🏛️ Branding municipal a les alertes" : '🏛️ Branding municipal en las alertas', sub: null },
    { text: lang === 'ca' ? 'Pàgina pública del municipi' : 'Página pública del municipio', sub: 'procesocat.es/municipi/[nom]' },
    { text: lang === 'ca' ? 'QR descarregable per a parcs i zones' : 'QR descargable para parques y zonas', sub: null },
    { text: lang === 'ca' ? '5 comptes de tècnics municipals' : '5 cuentas de técnicos municipales', sub: null },
    { text: lang === 'ca' ? 'Informes automàtics al tècnic cada setmana' : 'Informes automáticos al técnico cada semana', sub: null },
    { text: lang === 'ca' ? 'Informe oficial fi de temporada (maig)' : 'Informe oficial fin de temporada (mayo)', sub: null },
    { text: lang === 'ca' ? 'Suport prioritari < 4 hores' : 'Soporte prioritario < 4 horas', sub: null },
    { text: lang === 'ca' ? 'Onboarding call 1 hora inclòs' : 'Onboarding call 1 hora incluido', sub: null },
  ];

  const testimonials = [
    {
      text: lang === 'ca' ? "Des que tinc ProcesoCat Familiar no surto a passejar amb Berta sense revisar la ruta. Ja ens ha salvat dues vegades." : "Desde que tengo ProcesoCat Familiar no salgo a pasear con Berta sin revisar la ruta. Ya nos ha salvado dos veces.",
      author: lang === 'ca' ? 'Maria G., Golden Retriever, Sabadell' : 'Maria G., Golden Retriever, Sabadell'
    },
    {
      text: lang === 'ca' ? "Els meus fills van sols al col·legi. Rebo una notificació si hi ha perill al seu camí. No té preu." : "Mis hijos van solos al colegio. Recibo una notificación si hay peligro en su camino. No tiene precio.",
      author: lang === 'ca' ? 'Joan P., pare de família, Granollers' : 'Joan P., padre de familia, Granollers'
    },
    {
      text: lang === 'ca' ? "Hem integrat l'API amb el nostre sistema GIS. Ara detectem focus abans que arribin les queixes dels veïns." : "Hemos integrado la API con nuestro sistema GIS. Ahora detectamos focos antes de que lleguen las quejas.",
      author: lang === 'ca' ? "Tècnic forestal, Ajuntament del Vallès" : 'Técnico forestal, Ayuntamiento del Vallès'
    },
  ];

  const faqItems = [
    {
      q: lang === 'ca' ? 'Puc cancel·lar quan vulgui?' : '¿Puedo cancelar cuando quiera?',
      a: lang === 'ca' ? "Sí, des de Configuració quan vulguis. Mantens l'accés fins al final del període pagat. Sense penalitzacions." : 'Sí, desde Configuración cuando quieras. Mantienes el acceso hasta el final del período pagado. Sin penalizaciones.'
    },
    {
      q: lang === 'ca' ? 'Els vídeos educatius són gratuïts?' : '¿Los vídeos educativos son gratuitos?',
      a: lang === 'ca' ? "Sí, sempre. Són recursos oficials de tercers, gratuïts per a tots els usuaris sense excepció." : 'Sí, siempre. Son recursos oficiales de terceros, gratuitos para todos los usuarios sin excepción.'
    },
    {
      q: lang === 'ca' ? "Què passa amb les meves dades si cancel·lo?" : '¿Qué pasa con mis datos si cancelo?',
      a: lang === 'ca' ? "Els teus reports romanen al mapa per benefici de la comunitat. El teu compte passa automàticament al pla gratuït." : 'Tus reportes permanecen en el mapa para beneficio de la comunidad. Tu cuenta pasa automáticamente al plan gratuito.'
    },
    {
      q: lang === 'ca' ? "Hi ha descompte per a ajuntaments petits?" : '¿Hay descuento para ayuntamientos pequeños?',
      a: lang === 'ca' ? "Sí, oferim preus especials per a municipis de menys de 5.000 habitants. Contacta a municipis@procesocat.es" : 'Sí, ofrecemos precios especiales para municipios de menos de 5.000 habitantes. Contacta en municipis@procesocat.es'
    },
    {
      q: lang === 'ca' ? "El Pla Familiar inclou tota la família?" : '¿El Plan Familiar incluye a toda la familia?',
      a: lang === 'ca' ? "Sí, un compte Familiar cobreix tota la teva unitat familiar. Pots afegir perfils de múltiples mascotes i fills." : 'Sí, una cuenta Familiar cubre toda tu unidad familiar. Puedes añadir perfiles de múltiples mascotas e hijos.'
    },
  ];

  return (
    <div className="pb-28">
      {/* HERO */}
      <div className="w-full px-6 py-8 text-center text-white" style={{ background: 'linear-gradient(135deg, #1B4332, #2D6A4F)' }}>
        <span className="text-5xl block mb-3">{petName ? '🐕' : '🛡️'}</span>
        <h1 className="text-2xl font-bold leading-tight">
          {petName
            ? (lang === 'ca' ? `Quant val la salut de ${petName}?` : `¿Cuánto vale la salud de ${petName}?`)
            : (lang === 'ca' ? 'Protegeix els teus cada dia' : 'Protege a los tuyos cada día')}
        </h1>
        <p className="text-sm opacity-80 mt-2">
          {lang === 'ca' ? 'Una visita al veterinari per processionària: 80-200€' : 'Una visita al veterinario por procesionaria: 80-200€'}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-lg line-through opacity-60 text-red-300">80€</span>
          <span className="text-sm opacity-50">vs</span>
          <span className="text-xl font-bold text-green-300">4,99€/mes</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6 mt-6">
        {/* CURRENT PLAN BANNER */}
        {isFree && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-800 text-sm">
              {lang === 'ca' ? 'Estàs al Pla Gratuït' : 'Estás en el Plan Gratuito'}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {lang === 'ca' ? 'Desbloqueja totes les funcions per 4,99€/mes' : 'Desbloquea todas las funciones por 4,99€/mes'}
            </p>
          </div>
        )}
        {isFamiliar && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-semibold text-green-800 text-sm">✅ {lang === 'ca' ? 'Pla Familiar actiu' : 'Plan Familiar activo'}</p>
            <p className="text-xs text-green-700 mt-1">{lang === 'ca' ? 'Gràcies per ser part de ProcesoCat+' : 'Gracias por ser parte de ProcesoCat+'}</p>
          </div>
        )}
        {isMunicipi && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-semibold text-blue-800 text-sm">🏛️ {lang === 'ca' ? 'Pla Municipi actiu' : 'Plan Municipi activo'}</p>
          </div>
        )}

        {/* BILLING TOGGLE */}
        <div className="flex justify-center">
          <div className="inline-flex items-center bg-muted rounded-full p-1">
            <button onClick={() => setYearly(false)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${!yearly ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
              {lang === 'ca' ? 'Mensual' : 'Mensual'}
            </button>
            <button onClick={() => setYearly(true)} className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${yearly ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
              {lang === 'ca' ? 'Anual' : 'Anual'}
              {yearly && <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{lang === 'ca' ? 'Estalvia 2 mesos' : 'Ahorra 2 meses'}</span>}
            </button>
          </div>
        </div>

        {/* PLAN CARDS */}
        <div className="space-y-5">
          {/* FREE */}
          <Card className="border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl">🗺️</span>
                <h2 className="text-lg font-bold text-foreground mt-1">{lang === 'ca' ? 'Gratuït' : 'Gratuito'}</h2>
                <div className="mt-1"><span className="text-3xl font-bold text-foreground">0€</span><span className="text-muted-foreground text-sm">/mes</span></div>
                <p className="text-sm text-muted-foreground">{lang === 'ca' ? 'Per explorar' : 'Para explorar'}</p>
              </div>
              {isFree && <div className="flex justify-center"><span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">{lang === 'ca' ? 'El teu pla actual' : 'Tu plan actual'}</span></div>}
              <div className="space-y-2">
                {freeFeatures.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {f.yes ? <Check size={16} className="text-green-600 shrink-0 mt-0.5" /> : <XIcon size={16} className="text-red-400 shrink-0 mt-0.5" />}
                    <span className={f.yes ? 'text-foreground' : 'text-muted-foreground'}>{f.text}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full" disabled={isFree}>
                {isFree ? (lang === 'ca' ? 'Pla actual' : 'Plan actual') : (lang === 'ca' ? 'Canviar a Gratuït' : 'Cambiar a Gratuito')}
              </Button>
            </CardContent>
          </Card>

          {/* FAMILIAR */}
          <div ref={familiarRef}>
            <div className="flex justify-center -mb-3 relative z-10">
              <span className="bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">⭐ {lang === 'ca' ? 'Més popular' : 'Más popular'}</span>
            </div>
            <Card className={`border-2 border-[#2D6A4F] ${searchParams.get('highlight') === 'familiar' ? 'ring-2 ring-amber-400 animate-pulse' : ''}`}>
              <CardContent className="pt-8 space-y-4">
                <div className="text-center">
                  <span className="text-3xl">🛡️</span>
                  <h2 className="text-lg font-bold mt-1" style={{ color: '#2D6A4F' }}>{lang === 'ca' ? 'Familiar' : 'Familiar'}</h2>
                  <div className="mt-1">
                    {yearly ? (
                      <><span className="text-3xl font-bold" style={{ color: '#2D6A4F' }}>3,25€</span><span className="text-muted-foreground text-sm">/mes</span><p className="text-xs text-muted-foreground">(39€/{lang === 'ca' ? 'any' : 'año'})</p></>
                    ) : (
                      <><span className="text-3xl font-bold" style={{ color: '#2D6A4F' }}>4,99€</span><span className="text-muted-foreground text-sm">/mes</span></>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {petName ? (lang === 'ca' ? `Per a tu i per a ${petName}` : `Para ti y para ${petName}`) : (lang === 'ca' ? 'Per a la teva família' : 'Para tu familia')}
                  </p>
                </div>
                {isFamiliar && <div className="flex justify-center"><span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">{lang === 'ca' ? 'El teu pla actual' : 'Tu plan actual'}</span></div>}
                <div className="space-y-2.5">
                  {familiarFeatures.map((f, i) => (
                    <div key={i}>
                      <div className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                        <span className="text-foreground">{f.text}</span>
                      </div>
                      {f.sub && <p className="text-[11px] text-muted-foreground ml-6 mt-0.5 italic">{f.sub}</p>}
                    </div>
                  ))}
                </div>
                <Button className="w-full h-[52px] text-base font-semibold" style={{ backgroundColor: '#2D6A4F' }} onClick={handleUpgrade} disabled={isFamiliar || upgrading}>
                  {upgrading ? <><Loader2 size={18} className="animate-spin mr-2" /> {lang === 'ca' ? 'Processant...' : 'Procesando...'}</> :
                   isFamiliar ? (lang === 'ca' ? 'Pla actual' : 'Plan actual') :
                   yearly ? (lang === 'ca' ? 'Començar 7 dies gratis — 39€/any' : 'Empezar 7 días gratis — 39€/año') :
                   (lang === 'ca' ? 'Començar 7 dies gratis' : 'Empezar 7 días gratis')}
                </Button>
                <p className="text-xs text-center text-muted-foreground">{lang === 'ca' ? "Cancel·la quan vulguis · Sense permanència" : 'Cancela cuando quieras · Sin permanencia'}</p>
                <p className="text-xs text-center text-muted-foreground">🔒 {lang === 'ca' ? 'Pagament segur amb Stripe' : 'Pago seguro con Stripe'}</p>
              </CardContent>
            </Card>
          </div>

          {/* MUNICIPI */}
          <Card className="border-2" style={{ borderColor: '#1a3a5c', background: '#f8fafc' }}>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <span className="text-3xl">🏛️</span>
                <h2 className="text-lg font-bold mt-1" style={{ color: '#1a3a5c' }}>Municipi</h2>
                <div className="mt-1">
                  {yearly ? (
                    <><span className="text-3xl font-bold" style={{ color: '#1a3a5c' }}>4.990€</span><span className="text-muted-foreground text-sm">/{lang === 'ca' ? 'any' : 'año'}</span><p className="text-xs text-muted-foreground">({lang === 'ca' ? 'estalvia 2 mesos' : 'ahorra 2 meses'})</p></>
                  ) : (
                    <><span className="text-3xl font-bold" style={{ color: '#1a3a5c' }}>499€</span><span className="text-muted-foreground text-sm">/mes</span></>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{lang === 'ca' ? 'Per a ajuntaments i serveis forestals' : 'Para ayuntamientos y servicios forestales'}</p>
              </div>
              {isMunicipi && <div className="flex justify-center"><span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{lang === 'ca' ? 'El teu pla actual' : 'Tu plan actual'}</span></div>}
              <div className="space-y-2.5">
                {municipiFeatures.map((f, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                      <span className="text-foreground">{f.text}</span>
                    </div>
                    {f.sub && <p className="text-[11px] text-muted-foreground ml-6 mt-0.5 italic">{f.sub}</p>}
                  </div>
                ))}
              </div>
              <Button className="w-full text-white" style={{ backgroundColor: '#1a3a5c' }} onClick={() => window.location.href = 'mailto:municipis@procesocat.es?subject=Informació%20Pla%20Municipi'}>
                📧 {lang === 'ca' ? 'Contactar amb nosaltres' : 'Contactar con nosotros'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">{lang === 'ca' ? 'També disponible per a Diputacions i Govern' : 'También disponible para Diputaciones y Gobierno'}</p>
              <p className="text-xs text-center text-muted-foreground">{lang === 'ca' ? 'Preus especials per a grans territoris' : 'Precios especiales para grandes territorios'}</p>
            </CardContent>
          </Card>
        </div>

        {/* TESTIMONIALS */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-center text-foreground mb-4">{lang === 'ca' ? 'El que diuen els nostres usuaris' : 'Lo que dicen nuestros usuarios'}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {testimonials.map((t, i) => (
              <Card key={i} className="min-w-[280px] snap-start shrink-0">
                <CardContent className="pt-4 space-y-2">
                  <div className="text-amber-500 text-sm">⭐⭐⭐⭐⭐</div>
                  <p className="text-sm text-foreground italic leading-relaxed">"{t.text}"</p>
                  <p className="text-xs text-muted-foreground">— {t.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API INFO */}
        <Card className="border-[#1a3a5c]/20 bg-[#f8fafc]">
          <CardContent className="py-4 text-center space-y-2">
            <h2 className="text-sm font-bold text-foreground">🔌 {lang === 'ca' ? "Integració API REST" : 'Integración API REST'}</h2>
            <p className="text-xs text-muted-foreground">
              {lang === 'ca' ? "Disponible al Pla Municipi. Contacta amb nosaltres per a més informació." : 'Disponible en el Plan Municipi. Contacta con nosotros para más información.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.href = 'mailto:api@procesocat.es'}>
              📧 {lang === 'ca' ? "Contactar per API" : 'Contactar por API'}
            </Button>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div>
          <h2 className="text-lg font-bold text-center text-foreground mb-4">{lang === 'ca' ? 'Preguntes freqüents' : 'Preguntas frecuentes'}</h2>
          <Accordion type="single" collapsible>
            {faqItems.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{faq.a}</p></AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* BOTTOM CTA */}
        <div className="rounded-2xl p-6 text-center text-white" style={{ background: '#1B4332' }}>
          <h3 className="text-lg font-bold">{lang === 'ca' ? 'Tens un ajuntament o empresa forestal?' : '¿Tienes un ayuntamiento o empresa forestal?'}</h3>
          <p className="text-sm opacity-80 mt-1">{lang === 'ca' ? "Parla amb nosaltres sobre el Pla Municipi i la integració API" : 'Habla con nosotros sobre el Plan Municipi y la integración API'}</p>
          <Button variant="secondary" className="mt-3 bg-white text-foreground hover:bg-white/90" onClick={() => window.location.href = 'mailto:municipis@procesocat.es'}>
            📧 {lang === 'ca' ? 'Contactar' : 'Contactar'}
          </Button>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="text-center max-w-sm">
          <Confetti />
          <div className="py-4 space-y-3">
            <span className="text-5xl block">🎉</span>
            <h2 className="text-xl font-bold text-foreground">
              {lang === 'ca' ? 'Benvingut/da al Pla Familiar!' : '¡Bienvenido/a al Plan Familiar!'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {lang === 'ca' ? 'Tens 7 dies de prova gratuïta' : 'Tienes 7 días de prueba gratuita'}
            </p>
            <Button className="w-full mt-2" style={{ backgroundColor: '#2D6A4F' }} onClick={() => { setShowSuccess(false); navigate('/map'); }}>
              {lang === 'ca' ? 'Explorar les noves funcions' : 'Explorar las nuevas funciones'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansPage;
