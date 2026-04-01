import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import LanguageToggle from '@/components/LanguageToggle';
import { toast } from 'sonner';
import { Mail, Eye, EyeOff, Loader2, Lock, ShieldAlert } from 'lucide-react';
import logo from '@/assets/logoprocesocat.png';
import { isAccountLocked, recordLoginAttempt, getLoginAttempts, logSecurityEvent, addSession, SECURITY_CONFIG } from '@/utils/security';
import { supabase } from '@/integrations/supabase/client';
import { safeStorage } from '@/utils/safeStorage';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signIn, user, setRememberMe: setAuthRememberMe } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [lockState, setLockState] = useState<{ locked: boolean; permanent: boolean; remainingMinutes: number }>({ locked: false, permanent: false, remainingMinutes: 0 });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loginError, setLoginError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/map', { replace: true });
    }
  }, [user, navigate]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const checkLockStatus = useCallback(() => {
    if (!email) return;
    const status = isAccountLocked(email);
    setLockState(status);
    const attempts = getLoginAttempts(email);
    setFailedAttempts(attempts);
    setShowCaptcha(attempts >= 3);
  }, [email]);

  useEffect(() => {
    if (!lockState.locked || lockState.permanent) return;
    const timer = setInterval(() => {
      const status = isAccountLocked(email);
      setLockState(status);
      if (!status.locked) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockState.locked, lockState.permanent, email]);

  useEffect(() => {
    if (email) checkLockStatus();
  }, [email, checkLockStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError(t('auth.invalidEmail') || 'Email no válido');
      return;
    }
    setEmailError('');
    setLoginError('');

    checkLockStatus();
    if (lockState.locked) return;

    if (showCaptcha && parseInt(captchaAnswer) !== captchaA + captchaB) {
      setLoginError(t('security.captchaQuestion', { a: captchaA, b: captchaB }));
      return;
    }

    setLoading(true);
    try {
      // Save remember me preference before login
      setAuthRememberMe(rememberMe);
      await signIn(email, password);
      recordLoginAttempt(email, true);
      logSecurityEvent('LOGIN_SUCCESS', { email });
      addSession(navigator.userAgent);
      toast.success(t('auth.welcome', { name: email.split('@')[0] }) + ' 👋');
      navigate('/map', { replace: true });
    } catch (error: any) {
      recordLoginAttempt(email, false);
      logSecurityEvent('LOGIN_FAILED', { email, attempts: getLoginAttempts(email) });
      const remaining = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - getLoginAttempts(email);
      let errorMsg = error?.message || t('security.wrongPassword');
      if (errorMsg.includes('Invalid login')) {
        errorMsg = t('security.wrongPassword');
      }
      if (remaining > 0 && remaining <= 3) {
        errorMsg += ' ' + t('security.attemptsRemaining', { count: remaining });
      }
      if (getLoginAttempts(email) >= 3) {
        errorMsg += ' ' + t('security.passwordTip');
      }
      setLoginError(errorMsg);
      checkLockStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthRememberMe(rememberMe);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback', skipBrowserRedirect: false },
    });
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-[420px] bg-card rounded-2xl shadow-xl p-8 space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img src={logo} alt="ProcesoCat" className="w-24 h-24 rounded-2xl" />
          <h1 className="text-2xl font-bold text-foreground">ProcesoCat</h1>
          <p className="text-sm text-muted-foreground">Protegint Catalunya</p>
        </div>

        {/* Permanent lockout */}
        {lockState.locked && lockState.permanent && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center space-y-2">
            <Lock className="mx-auto text-destructive" size={32} />
            <p className="font-semibold text-destructive">{t('security.lockedPermanent')}</p>
            <p className="text-sm text-muted-foreground">{t('security.contactSupport')}</p>
          </div>
        )}

        {/* Temporary lockout */}
        {lockState.locked && !lockState.permanent && (
          <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-xl p-4 text-center space-y-2">
            <ShieldAlert className="mx-auto text-orange-600" size={32} />
            <p className="font-semibold text-orange-700 dark:text-orange-300">{t('security.accountLocked')}</p>
            <p className="text-sm text-orange-600 dark:text-orange-400">{t('security.lockedTemporary', { minutes: lockState.remainingMinutes })}</p>
          </div>
        )}

        {/* Form — hidden when locked */}
        {!lockState.locked && (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t('auth.email')}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); setLoginError(''); }}
                  className="pl-10"
                  required
                />
                {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer select-none">
                  {t('auth.rememberMe')}
                </label>
              </div>

              {loginError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {loginError}
                </div>
              )}

              {/* Captcha after 3 failed attempts */}
              {showCaptcha && (
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium text-foreground">{t('security.notARobot')}</p>
                  <p className="text-sm text-muted-foreground">{t('security.captchaQuestion', { a: captchaA, b: captchaB })}</p>
                  <Input
                    type="number"
                    value={captchaAnswer}
                    onChange={e => setCaptchaAnswer(e.target.value)}
                    placeholder="?"
                    className="w-24"
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl text-base" disabled={loading || (showCaptcha && parseInt(captchaAnswer) !== captchaA + captchaB)}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('auth.login')}
              </Button>
            </form>

            {/* Forgot password */}
            <div className="text-center">
              <button onClick={() => navigate('/forgot-password')} className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t('auth.or')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Google */}
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl text-base gap-3"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('auth.continueWithGoogle')}
            </Button>

            {/* Register link */}
            <p className="text-center text-sm text-muted-foreground">
              <button onClick={() => navigate('/register')} className="text-primary hover:underline">
                {t('auth.noAccount')}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
