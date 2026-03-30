import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logoprocesocat.png';

interface Props { onComplete: () => void; }

const OnboardingFlow = ({ onComplete }: Props) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const skip = () => { localStorage.setItem('onboarding_done', 'true'); onComplete(); };
  const next = () => { if (step < 2) setStep(step + 1); else skip(); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const dots = (
    <div className="flex gap-2 justify-center mt-8">
      {[0, 1, 2].map(i => (
        <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-white/30'}`} />
      ))}
    </div>
  );

  if (step === 0) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 text-white text-center" style={{ background: '#2D6A4F' }}>
      <button onClick={skip} className="absolute top-6 right-6 text-white/70 text-sm">{t('onboarding.skip')}</button>
      <div className="text-7xl mb-6">🌲</div>
      <h1 className="text-2xl font-bold mb-3">{t('onboarding.title1')}</h1>
      <p className="text-white/80 max-w-xs">{t('onboarding.sub1')}</p>
      {dots}
      <Button onClick={next} className="mt-8 bg-white text-[#2D6A4F] hover:bg-white/90 font-semibold px-8">{t('onboarding.next')} →</Button>
    </div>
  );

  if (step === 1) return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-card text-center">
      <div className="relative w-48 h-32 mb-8">
        <div className="absolute inset-0 rounded-2xl bg-muted flex items-center justify-center">
          <div className="flex gap-2">
            {['#22c55e','#eab308','#ef4444'].map((c,i) => <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />)}
          </div>
        </div>
      </div>
      <h1 className="text-xl font-bold text-foreground mb-3">{t('onboarding.title2')}</h1>
      <p className="text-muted-foreground max-w-xs">{t('onboarding.sub2')}</p>
      <div className="flex gap-2 justify-center mt-8">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <div className="flex gap-4 mt-8 items-center">
        <button onClick={prev} className="text-sm text-muted-foreground">← {t('onboarding.back')}</button>
        <Button onClick={next}>{t('onboarding.next')} →</Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-8 bg-card text-center">
      <div className="text-6xl mb-6">🛡️</div>
      <div className="flex gap-3 text-4xl mb-4">🐕 👶</div>
      <h1 className="text-xl font-bold text-foreground mb-3">{t('onboarding.title3')}</h1>
      <p className="text-muted-foreground max-w-xs">{t('onboarding.sub3')}</p>
      <div className="flex gap-2 justify-center mt-8">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <div className="flex gap-4 mt-8 items-center">
        <button onClick={prev} className="text-sm text-muted-foreground">← {t('onboarding.back')}</button>
        <Button onClick={skip}>{t('onboarding.start')} →</Button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
