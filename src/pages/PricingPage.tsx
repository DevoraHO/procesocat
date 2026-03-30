import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const PricingPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lang = i18n.language;
  const [yearly, setYearly] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);

  const isFree = !user || user.plan === 'free';

  const freeFeatures = [
    { key: 'pricing.free_f1', yes: true },
    { key: 'pricing.free_f2', yes: true },
    { key: 'pricing.free_f3', yes: true },
    { key: 'pricing.free_f4', yes: true },
    { key: 'pricing.free_f5', yes: true },
    { key: 'pricing.free_f6', yes: true },
    { key: 'pricing.free_f7', yes: true },
    { key: 'pricing.free_f8', yes: true },
    { key: 'pricing.free_f9', yes: true },
    { key: 'pricing.free_f10', yes: true },
    { key: 'pricing.free_f11', yes: false },
    { key: 'pricing.free_f12', yes: false },
    { key: 'pricing.free_f13', yes: false },
    { key: 'pricing.free_f14', yes: false },
    { key: 'pricing.free_f15', yes: false },
  ];

  const familiarFeatures = [
    { key: 'pricing.fam_f1', sub: null },
    { key: 'pricing.fam_f2', sub: null },
    { key: 'pricing.fam_f3', sub: null },
    { key: 'pricing.fam_f4', sub: 'pricing.fam_f4_sub' },
    { key: 'pricing.fam_f5', sub: 'pricing.fam_f5_sub' },
    { key: 'pricing.fam_f6', sub: 'pricing.fam_f6_sub' },
    { key: 'pricing.fam_f7', sub: null },
    { key: 'pricing.fam_f8', sub: 'pricing.fam_f8_sub' },
    { key: 'pricing.fam_f9', sub: 'pricing.fam_f9_sub' },
    { key: 'pricing.fam_f10', sub: null },
    { key: 'pricing.fam_f11', sub: 'pricing.fam_f11_sub' },
  ];

  const municipiFeatures = [
    { key: 'pricing.mun_f1', sub: null },
    { key: 'pricing.mun_f2', sub: 'pricing.mun_f2_sub' },
    { key: 'pricing.mun_f3', sub: 'pricing.mun_f3_sub' },
    { key: 'pricing.mun_f4', sub: 'pricing.mun_f4_sub' },
    { key: 'pricing.mun_f5', sub: 'pricing.mun_f5_sub' },
    { key: 'pricing.mun_f6', sub: 'pricing.mun_f6_sub' },
    { key: 'pricing.mun_f7', sub: 'pricing.mun_f7_sub' },
    { key: 'pricing.mun_f8', sub: 'pricing.mun_f8_sub' },
    { key: 'pricing.mun_f9', sub: null },
    { key: 'pricing.mun_f10', sub: null },
    { key: 'pricing.mun_f11', sub: null },
    { key: 'pricing.mun_f12', sub: null },
    { key: 'pricing.mun_f13', sub: null },
    { key: 'pricing.mun_f14', sub: null },
  ];

  const testimonials = [
    { stars: 5, text_key: 'pricing.test1_text', author_key: 'pricing.test1_author' },
    { stars: 5, text_key: 'pricing.test2_text', author_key: 'pricing.test2_author' },
    { stars: 5, text_key: 'pricing.test3_text', author_key: 'pricing.test3_author' },
  ];

  const faqItems = [
    { q: 'pricing.faq1_q', a: 'pricing.faq1_a' },
    { q: 'pricing.faq2_q', a: 'pricing.faq2_a' },
    { q: 'pricing.faq3_q', a: 'pricing.faq3_a' },
    { q: 'pricing.faq4_q', a: 'pricing.faq4_a' },
    { q: 'pricing.faq5_q', a: 'pricing.faq5_a' },
  ];

  const apiPreview = `// ${t('pricing.api_auth')}
GET https://api.procesoalert.es/v1/reports
Headers:
  X-API-Key: your_municipality_api_key
  Content-Type: application/json

// ${t('pricing.api_params')}
?municipality=mollet_del_valles
?comarca=barcelones
?status=ACTIVE
?danger_level=RED,PURPLE
?date_from=2026-01-01
?date_to=2026-03-31
?format=json | csv | geojson | kml

// ${t('pricing.api_response')}
{
  "total": 23,
  "municipality": "Mollet del Vallès",
  "period": "2026-03",
  "danger_summary": {
    "green": 8, "yellow": 6,
    "orange": 5, "red": 3, "purple": 1
  },
  "reports": [{
    "id": "r1",
    "lat": 41.5200, "lng": 2.2100,
    "description": "Nido en pino...",
    "danger_score": 85,
    "status": "ACTIVE",
    "validation_count": 6,
    "created_at": "2026-03-15T10:30:00Z",
    "comarca": "Vallès Oriental"
  }]
}

// Webhook
POST your_webhook_url
{
  "event": "DANGER_LEVEL_CRITICAL",
  "zone": "Parc Municipal",
  "danger_score": 92,
  "report_count": 8,
  "municipality": "Mollet del Vallès",
  "timestamp": "2026-03-28T08:15:00Z"
}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-28">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('pricing.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('pricing.subtitle')}</p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-muted rounded-full p-1 mt-6">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${!yearly ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t('pricing.monthly')}
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${yearly ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t('pricing.yearly')}
            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{t('pricing.save')}</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* FREE */}
        <Card className="border-border">
          <CardContent className="pt-6 space-y-5">
            <div className="text-center">
              <span className="text-4xl">🗺️</span>
              <h2 className="text-lg font-bold text-foreground mt-2">{t('pricing.free_name')}</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">0€</span>
                <span className="text-muted-foreground text-sm">/{t('pricing.per_month')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t('pricing.free_sub')}</p>
            </div>
            <div className="space-y-2">
              {freeFeatures.map(f => (
                <div key={f.key} className="flex items-start gap-2 text-sm">
                  <span className={f.yes ? 'text-primary' : 'text-destructive'}>{f.yes ? '✅' : '❌'}</span>
                  <span className={f.yes ? 'text-foreground' : 'text-muted-foreground'}>{t(f.key)}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" disabled={isFree}>
              {isFree ? t('pricing.current_plan') : t('pricing.start_free')}
            </Button>
          </CardContent>
        </Card>

        {/* FAMILIAR */}
        <Card className="border-2 border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            ⭐ {t('pricing.most_popular')}
          </div>
          <CardContent className="pt-8 space-y-5">
            <div className="text-center">
              <span className="text-4xl">🛡️</span>
              <h2 className="text-lg font-bold text-foreground mt-2">{t('pricing.fam_name')}</h2>
              <div className="mt-2">
                {yearly ? (
                  <>
                    <span className="text-3xl font-bold text-foreground">3,25€</span>
                    <span className="text-muted-foreground text-sm">/{t('pricing.per_month')}</span>
                    <p className="text-xs text-muted-foreground">(39€/{t('pricing.per_year')})</p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-foreground">4,99€</span>
                    <span className="text-muted-foreground text-sm">/{t('pricing.per_month')}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t('pricing.fam_sub')}</p>
            </div>
            <div className="space-y-2.5">
              {familiarFeatures.map(f => (
                <div key={f.key}>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-primary">✅</span>
                    <span className="text-foreground">{t(f.key)}</span>
                  </div>
                  {f.sub && <p className="text-[11px] text-muted-foreground ml-6 mt-0.5">{t(f.sub)}</p>}
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => toast.success(t('pricing.trial_mock'))}>
              {yearly ? t('pricing.trial_yearly') : t('pricing.trial_monthly')}
            </Button>
            <p className="text-xs text-center text-muted-foreground">{t('pricing.cancel_anytime')}</p>
            <p className="text-xs text-center text-muted-foreground">🔒 {t('pricing.secure_payment')}</p>
          </CardContent>
        </Card>

        {/* MUNICIPI */}
        <Card className="border-2" style={{ borderColor: '#1a3a5c' }}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#1a3a5c' }}>
            🏛️ {t('pricing.for_municipalities')}
          </div>
          <CardContent className="pt-8 space-y-5">
            <div className="text-center">
              <span className="text-4xl">🏛️</span>
              <h2 className="text-lg font-bold text-foreground mt-2">{t('pricing.mun_name')}</h2>
              <div className="mt-2">
                {yearly ? (
                  <>
                    <span className="text-3xl font-bold text-foreground">4.990€</span>
                    <span className="text-muted-foreground text-sm">/{t('pricing.per_year')}</span>
                    <p className="text-xs text-muted-foreground">({t('pricing.save_2months')})</p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-foreground">499€</span>
                    <span className="text-muted-foreground text-sm">/{t('pricing.per_month')}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t('pricing.mun_sub')}</p>
            </div>
            <div className="space-y-2.5">
              {municipiFeatures.map(f => (
                <div key={f.key}>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-primary">✅</span>
                    <span className="text-foreground">{t(f.key)}</span>
                  </div>
                  {f.sub && <p className="text-[11px] text-muted-foreground ml-6 mt-0.5">{t(f.sub)}</p>}
                </div>
              ))}
            </div>
            <Button className="w-full" style={{ backgroundColor: '#1a3a5c' }} onClick={() => window.location.href = 'mailto:municipis@procesoalert.es?subject=' + encodeURIComponent(t('pricing.mun_email_subject'))}>
              📧 {t('pricing.contact_us')}
            </Button>
            <p className="text-xs text-center text-muted-foreground">{t('pricing.also_diputacions')}</p>
            <p className="text-xs text-center text-muted-foreground">{t('pricing.special_pricing')}</p>
          </CardContent>
        </Card>
      </div>

      {/* API Preview */}
      <div className="mt-12">
        <Collapsible open={apiOpen} onOpenChange={setApiOpen}>
          <CollapsibleTrigger className="w-full">
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">🔌 {t('pricing.api_title')}</h2>
                <ChevronDown className={`text-muted-foreground transition-transform ${apiOpen ? 'rotate-180' : ''}`} size={20} />
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-3">
              <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">{apiPreview}</pre>
              <p className="text-xs text-muted-foreground">{t('pricing.api_docs_note')}</p>
              <Button variant="outline" onClick={() => window.location.href = 'mailto:api@procesoalert.es'} className="gap-2">
                📧 {t('pricing.api_request')}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Testimonials */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-center text-foreground mb-6">{t('pricing.testimonials_title')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((test, i) => (
            <Card key={i}>
              <CardContent className="pt-5 space-y-3">
                <div className="text-yellow-500">{'⭐'.repeat(test.stars)}</div>
                <p className="text-sm text-foreground italic leading-relaxed">"{t(test.text_key)}"</p>
                <p className="text-xs text-muted-foreground">— {t(test.author_key)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-center text-foreground mb-6">{t('pricing.faq_title')}</h2>
        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          {faqItems.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm">{t(faq.q)}</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">{t(faq.a)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 bg-primary rounded-2xl p-8 text-center text-primary-foreground">
        <h3 className="text-xl font-bold">{t('pricing.bottom_title')}</h3>
        <p className="text-sm opacity-90 mt-2 max-w-md mx-auto">{t('pricing.bottom_subtitle')}</p>
        <Button variant="secondary" className="mt-4 bg-white text-primary hover:bg-white/90" onClick={() => window.location.href = 'mailto:municipis@procesoalert.es'}>
          📧 {t('pricing.contact_us')}
        </Button>
      </div>
    </div>
  );
};

export default PricingPage;
