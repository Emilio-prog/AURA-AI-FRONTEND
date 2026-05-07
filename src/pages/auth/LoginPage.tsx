import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, RefreshCcw } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_CREDENTIALS } from '@/data/users';
import { AuthLayout } from './AuthLayout';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
  };

  const canResendVerification =
    Boolean(email.trim()) && Boolean(error && /verifica|verificar|verify|verified/i.test(error));

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage(null);
    try {
      const message = await resendVerification(email.trim());
      setResendMessage(message);
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : 'No se pudo reenviar el email de verificacion.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      badge="ID: ACCESO_SISTEMA"
      title="INICIAR_SESIÓN"
      subtitle="// AUTENTICACIÓN_REQUERIDA"
      footer={
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
          ¿Sin cuenta?{' '}
          <Link to="/register" className="text-brutal-purple hover:underline">
            CREAR_NUEVA →
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Input
          label="EMAIL_USUARIO"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="demo@aura.ai"
        />

        <Input
          label="CONTRASEÑA"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
        />

        {error && (
          <div
            role="alert"
            className="border-3 border-brutal-coral bg-brutal-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral"
          >
            ERR_AUTH: {error}
          </div>
        )}

        {canResendVerification && (
          <Button
            type="button"
            variant="teal"
            size="md"
            loading={resending}
            leftIcon={<RefreshCcw className="h-4 w-4" />}
            className="w-full justify-center"
            onClick={handleResendVerification}
          >
            REENVIAR_VERIFICACION
          </Button>
        )}

        {resendMessage && (
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            {resendMessage}
          </p>
        )}

        <Button
          type="submit"
          variant="purple"
          size="lg"
          loading={loading}
          leftIcon={<LogIn className="h-4 w-4" />}
          className="w-full justify-center"
        >
          EJECUTAR_LOGIN
        </Button>

        <div className="flex flex-col gap-3 border-t-2 border-dashed border-brutal-black pt-4">
          <button
            type="button"
            onClick={fillDemo}
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-brutal-teal hover:underline"
          >
            ▸ USAR_CREDENCIALES_DEMO
          </button>
          <Link
            to="/forgot-password"
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:text-brutal-black"
          >
            ¿OLVIDÓ_CONTRASEÑA?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
