import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { AuthLayout } from './AuthLayout';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
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
            <span className="text-ink-muted">
              Si {email} corresponde a una cuenta, recibirás instrucciones en breve.
            </span>
          </div>
          <p className="font-mono text-[9px] font-bold uppercase leading-relaxed tracking-wider text-ink-muted">
            ⚠ FASE_MOCK: Esta vista es decorativa. No se envían correos reales.
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
          <Button
            type="submit"
            variant="purple"
            size="lg"
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
