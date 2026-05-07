import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from './AuthLayout';

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Nombre demasiado corto.');
      return;
    }
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
      const result = await register({ name, email, password });
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
