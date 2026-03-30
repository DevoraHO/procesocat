import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageToggle from '@/components/LanguageToggle';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-[420px] bg-card rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-3xl">🌲</div>
          <h1 className="text-2xl font-bold text-foreground">ProcesoCat</h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto text-2xl">✉️</div>
            <p className="text-sm text-foreground">
              {lang === 'ca'
                ? "Si l'email existeix rebràs un enllaç en breu"
                : 'Si el email existe recibirás un enlace en breve'}
            </p>
            <Button variant="outline" onClick={() => navigate('/login')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {lang === 'ca' ? 'Tornar al login' : 'Volver al login'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              {lang === 'ca'
                ? "Introdueix el teu email i t'enviarem un enllaç de recuperació"
                : 'Introduce tu email y te enviaremos un enlace de recuperación'}
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (lang === 'ca' ? "Enviar enllaç de recuperació" : 'Enviar enlace de recuperación')}
            </Button>
            <div className="text-center">
              <button onClick={() => navigate('/login')} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                {lang === 'ca' ? 'Tornar al login' : 'Volver al login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
