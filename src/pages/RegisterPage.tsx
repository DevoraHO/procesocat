import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageToggle from '@/components/LanguageToggle';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, name);
    setLoading(false);
    navigate('/map');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: '#2D6A4F' }}>🐛 ProcesoAlert</h1>
          <p className="text-muted-foreground mt-2">{t('auth.register')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder={t('auth.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
          <Input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full text-white" style={{ backgroundColor: '#2D6A4F' }} disabled={loading}>
            {t('auth.createAccount')}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <button onClick={() => navigate('/login')} className="underline" style={{ color: '#2D6A4F' }}>
            {t('auth.alreadyHaveAccount')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
