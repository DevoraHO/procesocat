import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageToggle from '@/components/LanguageToggle';
import { searchMunicipalities, Municipality } from '@/data/municipalData';
import { MapPin, Search } from 'lucide-react';

const RegisterPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { signUp, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'pet' | 'municipality'>('form');
  const [petName, setPetName] = useState('');
  const [municipalityQuery, setMunicipalityQuery] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null);
  const results = searchMunicipalities(municipalityQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('pet');
  };

  const handleFinishPet = (withPet: boolean) => {
    if (withPet && petName) {
      localStorage.setItem('pet_name', petName);
    }
    setStep('municipality');
  };

  const handleFinish = async (muni: Municipality | null) => {
    setLoading(true);
    await signUp(email, password, name);
    if (petName) {
      updateProfile({ pet_name: petName });
    }
    if (muni) {
      updateProfile({ municipality_id: muni.id });
      localStorage.setItem('municipality_id', muni.id);
    }
    setLoading(false);
    navigate('/map');
  };

  const riskColor = (level: string) => level === 'very_high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700';
  const riskLabel = (level: string) => level === 'very_high' ? t('municipality.riskVeryHigh') : t('municipality.riskHigh');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: '#2D6A4F' }}>🐛 ProcesoCat</h1>
          <p className="text-muted-foreground mt-2">{t('auth.register')}</p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder={t('auth.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
            <Input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }}>
              {t('auth.createAccount')}
            </Button>
          </form>
        )}

        {step === 'pet' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <span className="text-6xl block mb-3">🐕</span>
              <h2 className="text-lg font-bold text-foreground">{t('pet.hasDog')}</h2>
            </div>
            <div className="space-y-2">
              <Input placeholder={t('pet.petNamePlaceholder')} value={petName} onChange={e => setPetName(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('pet.petNameHelper')}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => handleFinishPet(true)} className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }} disabled={loading || !petName}>
                {t('pet.saveContinue')}
              </Button>
              <button onClick={() => handleFinishPet(false)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition" disabled={loading}>
                {t('pet.skipPet')}
              </button>
            </div>
          </div>
        )}

        {step === 'municipality' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <span className="text-6xl block mb-3">📍</span>
              <h2 className="text-lg font-bold text-foreground">
                {t('municipality.selectTitle', { name: petName || t('pet.yourPet') })}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t('municipality.selectSubtitle')}</p>
            </div>

            {!selectedMunicipality ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('municipality.search')}
                    value={municipalityQuery}
                    onChange={e => setMunicipalityQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {results.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {results.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMunicipality(m)}
                        className="w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center justify-between border-b last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{lang === 'ca' ? m.name_ca : m.name_es}</p>
                          <p className="text-xs text-muted-foreground">{lang === 'ca' ? m.comarca_ca : m.comarca_es}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor(m.risk_level)}`}>
                          {riskLabel(m.risk_level)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Mock: select Barcelona as nearest
                    const bcn = searchMunicipalities('Barcelona')[0];
                    if (bcn) setSelectedMunicipality(bcn);
                  }}
                >
                  <MapPin size={14} className="mr-1" /> {t('municipality.useLocation')}
                </Button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center space-y-1">
                <p className="text-green-800 font-semibold">✅ {lang === 'ca' ? selectedMunicipality.name_ca : selectedMunicipality.name_es} — {lang === 'ca' ? selectedMunicipality.comarca_ca : selectedMunicipality.comarca_es}</p>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${riskColor(selectedMunicipality.risk_level)}`}>
                  {t('municipality.riskLevel')}: {riskLabel(selectedMunicipality.risk_level)}
                </span>
                <p className="text-xs text-green-700">{t('municipality.selectSubtitle')}</p>
                <button onClick={() => setSelectedMunicipality(null)} className="text-xs text-muted-foreground underline mt-2">
                  {t('municipality.change')}
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Button
                onClick={() => handleFinish(selectedMunicipality)}
                className="w-full text-white"
                style={{ backgroundColor: '#2D6A4F' }}
                disabled={loading}
              >
                {selectedMunicipality ? t('municipality.save') : t('municipality.skipForNow')}
              </Button>
              {selectedMunicipality && (
                <button onClick={() => handleFinish(null)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition" disabled={loading}>
                  {t('municipality.skipForNow')}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'form' && (
          <p className="text-center text-sm text-muted-foreground">
            <button onClick={() => navigate('/login')} className="underline" style={{ color: '#2D6A4F' }}>
              {t('auth.alreadyHaveAccount')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
