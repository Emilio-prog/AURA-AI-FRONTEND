import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, KeyRound } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { httpClient } from '@/services/httpClient';
import { AuthLayout } from './AuthLayout';

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

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

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <AuthLayout
        badge="ID: TOKEN_AUSENTE"
        title="ENLACE_INVALIDO"
        subtitle="// FALTA_TOKEN_DE_RESET"
        footer={
          <Link
            to="/forgot-password"
            className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-purple hover:underline"
          >
            SOLICITAR_NUEVO_ENLACE
          </Link>
        }
      >
        <div className="border-3 border-brutal-coral bg-brutal-coral/10 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral">
          ERR_RESET: NO_SE_ENCONTRO_TOKEN_EN_LA_URL.
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!PASSWORD_POLICY.test(password)) {
      setError('La contrasena debe tener 12 caracteres, mayuscula, minuscula, numero y simbolo.');
      return;
    }
    if (password !== confirm) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await httpClient.post<{ message: string }>('/auth/reset-password', {
        token,
        password,
      });
      navigate('/login', {
        replace: true,
        state: { message: data.message },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Token invalido o caducado.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="ID: RESET_CONTRASENA"
      title="NUEVA_CONTRASENA"
      subtitle="// ESTABLECER_CREDENCIAL_NUEVA"
      footer={
        <Link
          to="/login"
          className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-purple hover:underline"
        >
          ← VOLVER_LOGIN
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Input
          label="NUEVA_CONTRASENA"
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
        {error && (
          <div
            role="alert"
            className="border-3 border-brutal-coral bg-brutal-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral"
          >
            ERR_RESET: {error}
          </div>
        )}
        <p className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-wider text-ink-muted">
          // SEGURIDAD: AL_RESTABLECER_SE_CIERRAN_TODAS_LAS_SESIONES_ACTIVAS.
        </p>
        <Button
          type="submit"
          variant="purple"
          size="lg"
          loading={loading}
          leftIcon={<KeyRound className="h-4 w-4" />}
          className="w-full justify-center"
        >
          ACTUALIZAR_CONTRASENA
        </Button>
      </form>
    </AuthLayout>
  );
}
