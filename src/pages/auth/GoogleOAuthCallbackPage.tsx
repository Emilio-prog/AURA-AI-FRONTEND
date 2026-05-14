import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from './AuthLayout';

export function GoogleOAuthCallbackPage() {
  const { completeGoogleOAuth } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const code = searchParams.get('code');
    const providerError = searchParams.get('error');

    if (providerError) {
      setError(providerError);
      return;
    }
    if (!code) {
      setError('Falta el codigo temporal de Google.');
      return;
    }

    const exchange = async () => {
      try {
        const user = await completeGoogleOAuth(code);
        if (!mounted) return;
        navigate(user.onboardedAt === null ? '/onboarding' : '/dashboard', { replace: true });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'No se pudo completar el acceso con Google.');
      }
    };

    void exchange();
    return () => {
      mounted = false;
    };
  }, [completeGoogleOAuth, navigate, searchParams]);

  return (
    <AuthLayout
      badge="ID: GOOGLE_OAUTH"
      title="VALIDANDO_GOOGLE"
      subtitle="// INTERCAMBIO_SEGURO"
      footer={
        <Link to="/login" className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-purple hover:underline">
          VOLVER_LOGIN
        </Link>
      }
    >
      <div className="flex flex-col gap-5">
        {!error && (
          <div className="flex items-center gap-3 border-3 border-brutal-black bg-brutal-teal/15 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-black">
            <Loader2 className="h-4 w-4 animate-spin" />
            CONECTANDO_CON_AURA
          </div>
        )}

        {error && (
          <>
            <div
              role="alert"
              className="border-3 border-brutal-coral bg-brutal-coral/10 px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brutal-coral"
            >
              ERR_AUTH_GOOGLE: {error}
            </div>
            <Button
              type="button"
              variant="purple"
              size="lg"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              className="w-full justify-center"
              onClick={() => navigate('/login', { replace: true })}
            >
              REINTENTAR_LOGIN
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
