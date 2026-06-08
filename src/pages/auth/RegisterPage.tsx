import { useCallback, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus, Check } from 'lucide-react';
import { Button, Input, TurnstileWidget } from '@/components/ui';
import { GoogleLogo } from '@/components/brand/GoogleLogo';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from './AuthLayout';

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

export function RegisterPage() {
  const { register, startGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), []);
  const handleCaptchaExpire = useCallback(() => setCaptchaToken(null), []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setGoogleError(null);

    if (password !== confirm) {
      setError('Las contrasenas no coinciden.');
      return;
    }
    if (!ageConfirmed) {
      setError('Debes confirmar que tienes 18 años o más.');
      return;
    }
    if (!termsAccepted) {
      setError('Debes aceptar la política de privacidad y los términos de uso.');
      return;
    }
    setLoading(true);
    try {
      const result = await register({
        name,
        email,
        password,
        captchaToken: captchaToken ?? undefined,
      });
      navigate('/verify-email', {
        replace: true,
        state: {
          email: result.email,
          message: result.message,
          requiresVerification: result.requiresVerification,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await startGoogleLogin();
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'No se pudo iniciar sesion con Google.');
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="ID: REGISTRO_NUEVO"
      title="CREAR_CUENTA"
      subtitle="// PROVISION_USUARIO_NUEVO"
      footer={
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
          Ya tienes cuenta?{' '}
          <Link to="/login" className="text-brutal-purple hover:underline">
            INICIAR_SESION
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Button
          type="button"
          variant="white"
          size="lg"
          loading={googleLoading}
          leftIcon={<GoogleLogo />}
          className="w-full justify-center"
          onClick={handleGoogleLogin}
        >
          CONTINUAR_CON_GOOGLE
        </Button>

        {googleError && (
          <div
            role="alert"
            className="border-3 border-brutal-coral bg-brutal-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral"
          >
            ERR_AUTH_GOOGLE: {googleError}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="h-0.5 flex-1 bg-brutal-black" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            O_EMAIL
          </span>
          <span className="h-0.5 flex-1 bg-brutal-black" />
        </div>

        <Input
          label="NOMBRE_COMPLETO"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Tu nombre y apellido"
        />

        <Input
          label="EMAIL_USUARIO"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="tu@email.com"
        />

        <Input
          label="CONTRASENA"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Min. 12 + Aa1!"
          hint="MIN_12_Aa1_SYMBOL"
        />

        <Input
          label="CONFIRMAR_CONTRASENA"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Repite la contrasena"
        />

        <div className="flex flex-col gap-3">
          <label className="flex cursor-pointer items-start gap-3">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`flex h-5 w-5 items-center justify-center border-2 transition-colors ${
                  ageConfirmed
                    ? 'border-brutal-purple bg-brutal-purple'
                    : 'border-brutal-black bg-white'
                }`}
              >
                {ageConfirmed && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold uppercase leading-relaxed tracking-wider text-ink">
              Confirmo que tengo 18 años o más
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`flex h-5 w-5 items-center justify-center border-2 transition-colors ${
                  termsAccepted
                    ? 'border-brutal-purple bg-brutal-purple'
                    : 'border-brutal-black bg-white'
                }`}
              >
                {termsAccepted && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold uppercase leading-relaxed tracking-wider text-ink">
              Entiendo que AURA IA ofrece apoyo emocional y{' '}
              <span className="text-brutal-coral">no sustituye ayuda psicológica profesional</span>.
              He leído y acepto la{' '}
              <Link
                to="/privacy"
                onClick={(e) => e.stopPropagation()}
                className="text-brutal-purple hover:underline"
              >
                Política de privacidad
              </Link>{' '}
              y los{' '}
              <Link
                to="/terms"
                onClick={(e) => e.stopPropagation()}
                className="text-brutal-purple hover:underline"
              >
                Términos de uso
              </Link>
              .
            </span>
          </label>
        </div>

        {turnstileEnabled && (
          <TurnstileWidget onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} />
        )}

        {error && (
          <div
            role="alert"
            className="border-3 border-brutal-coral bg-brutal-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral"
          >
            ERR_REG: {error}
          </div>
        )}

        <Button
          type="submit"
          variant="purple"
          size="lg"
          loading={loading}
          leftIcon={<UserPlus className="h-4 w-4" />}
          className="w-full justify-center"
        >
          CREAR_CUENTA
        </Button>
      </form>
    </AuthLayout>
  );
}
