import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { Button, Input, TurnstileWidget } from '@/components/ui';
import { httpClient } from '@/services/httpClient';
import { AuthLayout } from './AuthLayout';

const turnstileEnabled = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: string } } })
      .response;
    return response?.data?.message ?? response?.data?.error ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), []);
  const handleCaptchaExpire = useCallback(() => setCaptchaToken(null), []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (turnstileEnabled && !captchaToken) {
      setError('Completa la verificación anti-bot antes de continuar.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await httpClient.post<{ message: string }>('/auth/forgot-password', {
        email: email.trim(),
        captchaToken: captchaToken ?? undefined,
      });
      setMessage(data.message);
      setSubmitted(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo procesar la solicitud.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="ID: RECUPERACIÓN_ACCESO"
      title="RECUPERAR_CONTRASEÑA"
      subtitle="// SOLICITUD_RESET_CREDENCIAL"
      footer={
        <Link
          to="/login"
          className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-purple hover:underline"
        >
          ← VOLVER_LOGIN
        </Link>
      }
    >
      {submitted ? (
        <div className="flex flex-col gap-5">
          <div className="border-3 border-brutal-teal bg-brutal-teal/10 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-black">
            ✓ SOLICITUD_RECIBIDA
            <br />
            <span className="text-ink-muted">{message}</span>
          </div>
          <p className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-wider text-ink-muted">
            // INFO: EL_ENLACE_CADUCA_EN_30_MINUTOS. REVISA_TU_BANDEJA_DE_ENTRADA_Y_SPAM.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <Input
            label="EMAIL_USUARIO"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="tu@email.com"
            hint="ENVIAREMOS_LINK_DE_RECUPERACIÓN"
          />
          {turnstileEnabled && (
            <TurnstileWidget onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} />
          )}
          {error && (
            <div
              role="alert"
              className="border-3 border-brutal-coral bg-brutal-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral"
            >
              ERR_RESET: {error}
            </div>
          )}
          <Button
            type="submit"
            variant="purple"
            size="lg"
            loading={loading}
            leftIcon={<Send className="h-4 w-4" />}
            className="w-full justify-center"
          >
            ENVIAR_INSTRUCCIONES
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
