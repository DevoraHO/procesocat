import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageToggle from '@/components/LanguageToggle';
import { searchMunicipalities, Municipality } from '@/data/municipalData';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [error, setError] = useState('');
  const results = searchMunicipalities(municipalityQuery);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          toast.error(lang === 'ca' ? 'Aquest email ja té un compte. Inicia sessió.' : 'Este email ya tiene una cuenta. Inicia sesión.');
          navigate('/login');
        } else if (signUpError.message.toLowerCase().includes('password')) {
          setError(lang === 'ca' ? 'La contrasenya ha de tenir mínim 6 caràcters' : 'La contraseña debe tener mínimo 6 caracteres');
          toast.error(lang === 'ca' ? 'La contrasenya ha de tenir mínim 6 caràcters' : 'La contraseña debe tener mínimo 6 caracteres');
        } else if (signUpError.message.toLowerCase().includes('email')) {
          setError(lang === 'ca' ? "L'email no és vàlid" : 'El email no es válido');
          toast.error(lang === 'ca' ? "L'email no és vàlid" : 'El email no es válido');
        } else {
          setError(lang === 'ca' ? 'Error al crear el compte. Torna-ho a provar.' : 'Error al crear cuenta. Inténtalo de nuevo.');
          toast.error(lang === 'ca' ? 'Error al crear el compte.' : 'Error al crear cuenta.');
          console.error('Registration error:', signUpError);
        }
        setLoading(false);
        return;
      }

      // Fallback profile creation in case trigger fails
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          name: name || (data.user.email ? data.user.email.split('@')[0] : ''),
          points: 0,
          weekly_points: 0,
          rank: 'Observador',
          plan: 'free',
          banner_color: '#2D6A4F',
          language: lang,
        }, { onConflict: 'id' });
        if (profileError) console.error('Profile creation error:', profileError);
      }

      if (data.user && !data.session) {
        toast.success(lang === 'ca' ? 'Compte creat! Revisa el teu email per confirmar' : '¡Cuenta creada! Revisa tu email para confirmar tu cuenta');
        setTimeout(() => navigate('/onboarding'), 1000);
      } else if (data.session) {
        toast.success(lang === 'ca' ? 'Benvingut a ProcesoCat!' : '¡Bienvenido a ProcesoCat!');
        setTimeout(() => navigate('/onboarding'), 1000);
      }
    } catch (err: any) {
      console.error('Registration crash:', err);
      setError(lang === 'ca' ? 'Error al crear el compte. Torna-ho a provar.' : 'Error al crear cuenta. Inténtalo de nuevo.');
      toast.error(lang === 'ca' ? 'Error al crear el compte.' : 'Error al crear cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishPet = (withPet: boolean) => {
    if (withPet && petName) {
      localStorage.setItem('pet_name', petName);
    }
    setStep('municipality');
  };

  const handleFinish = async (muni: Municipality | null) => {
    setLoading(true);
    try {
      if (petName) {
        await updateProfile({ pet_name: petName });
      }
      if (muni) {
        await updateProfile({ municipality_id: muni.id });
        localStorage.setItem('municipality_id', muni.id);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
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
            <Input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }} disabled={loading}>
              {loading ? <><Loader2 className="h-5 w-5 animate-spin mr-2" /> {lang === 'ca' ? 'Creant compte...' : 'Creando cuenta...'}</> : t('auth.createAccount')}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {lang === 'ca' ? "Verificaràs el teu email després del registre" : "Verificarás tu email después del registro"}
            </p>
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
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (selectedMunicipality ? t('municipality.save') : t('municipality.skipForNow'))}
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
