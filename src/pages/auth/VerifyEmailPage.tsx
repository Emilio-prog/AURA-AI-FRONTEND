import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck, RefreshCcw, XCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { httpClient } from '@/services/httpClient';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from './AuthLayout';

interface VerifyLocationState {
  email?: string;
  message?: string;
  requiresVerification?: boolean;
}

type VerifyStatus = 'pending' | 'verifying' | 'success' | 'error';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (
      error as {
        response?: {
          data?: { message?: string; error?: string; fieldErrors?: { [campo: string]: string } };
        };
      }
    ).response;
    const errores = response?.data?.fieldErrors;
    if (errores) {
      const campos = Object.keys(errores);
      const campo = campos[0];

      if (campo) {
        return errores[campo];
      }
    }
    return response?.data?.message ?? response?.data?.error ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { resendVerification } = useAuth();
  const state = (location.state as VerifyLocationState | null) ?? {};
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : 'pending');
  const [message, setMessage] = useState(
    state.message ?? 'Cuenta creada. Revisa tu email para verificarla.',
  );
  const [email, setEmail] = useState(state.email ?? '');
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let mounted = true;

    const verify = async () => {
      setStatus('verifying');
      try {
        const { data } = await httpClient.post<{ message: string }>(
          `/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        if (mounted) {
          setMessage(data.message);
          setStatus('success');
        }
      } catch (error) {
        if (mounted) {
          setMessage(getApiErrorMessage(error, 'Token invalido o caducado.'));
          setStatus('error');
        }
      }
    };

    void verify();
    return () => {
      mounted = false;
    };
  }, [token]);

  const badge = useMemo(() => {
    if (status === 'success') return 'ID: EMAIL_VERIFICADO';
    if (status === 'error') return 'ID: TOKEN_INVALIDO';
    if (status === 'verifying') return 'ID: VERIFICANDO_EMAIL';
    return 'ID: REVISA_TU_EMAIL';
  }, [status]);

  const handleResend = async () => {
    if (!email.trim()) {
      setResendMessage('Introduce tu email para reenviar la verificacion.');
      return;
    }

    setResending(true);
    setResendMessage(null);
    try {
      const nextMessage = await resendVerification(email.trim());
      setResendMessage(nextMessage);
    } catch (error) {
      setResendMessage(
        error instanceof Error ? error.message : 'No se pudo reenviar el email de verificacion.',
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      badge={badge}
      title="VERIFICACION_EMAIL"
      subtitle="// SINCRONIZACION_CUENTA_SEGURA"
      footer={
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-ink-muted">
          Ya verificaste tu correo?{' '}
          <Link to="/login" className="text-brutal-purple hover:underline">
            INICIAR_SESION
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-4 border-3 border-brutal-black bg-white p-4 shadow-brutal-sm">
          {status === 'success' && <CheckCircle2 className="h-8 w-8 shrink-0 text-brutal-teal" />}
          {status === 'error' && <XCircle className="h-8 w-8 shrink-0 text-brutal-coral" />}
          {(status === 'pending' || status === 'verifying') && (
            <MailCheck className="h-8 w-8 shrink-0 text-brutal-purple" />
          )}
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-black">
              {status === 'verifying' ? 'VERIFICANDO_TOKEN...' : message}
            </p>
            {status === 'pending' && email && (
              <p className="mt-2 break-all font-mono text-[11px] font-bold text-ink-muted">
                EMAIL_DESTINO: {email}
              </p>
            )}
          </div>
        </div>

        {status === 'success' ? (
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center border-3 border-brutal-black bg-brutal-purple px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-brutal-sm transition-transform duration-100 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            IR_A_LOGIN
          </Link>
        ) : (
          <div className="flex flex-col gap-3 border-t-2 border-dashed border-brutal-black pt-4">
            <Input
              label="EMAIL_REENVIO"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              leftIcon={<MailCheck className="h-4 w-4" />}
              placeholder="tu@email.com"
            />
            <Button
              type="button"
              variant="teal"
              size="lg"
              loading={resending}
              leftIcon={<RefreshCcw className="h-4 w-4" />}
              className="w-full justify-center"
              onClick={handleResend}
            >
              REENVIAR_VERIFICACION
            </Button>
            {resendMessage && (
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                {resendMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
