import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getBillingStatus,
  syncCheckoutSession,
  type BillingPlan,
  type BillingStatus,
} from '@/services/billing';

const K = 'var(--aura-fg)';
const W = 'var(--aura-bg)';
const T = '#2DD4BF';
const M = '#A855F7';
const CR = '#FB7185';
const BORDE = '4px solid var(--aura-fg)';
const SOMBRA = 'var(--aura-shadow)';
const SOMBRA_SM = 'var(--aura-shadow-sm)';

const planCopy: Record<BillingPlan, { label: string; price: string; color: string }> = {
  FREE: { label: 'GRATIS', price: '0 EUR', color: T },
  PERSONAL: { label: 'PERSONAL', price: '6,99 EUR/MES', color: M },
  PREMIUM: { label: 'PREMIUM', price: '12 EUR/MES', color: CR },
};

const paidPlans: Array<{
  plan: Exclude<BillingPlan, 'FREE'>;
  title: string;
  price: string;
  accent: string;
  features: string[];
}> = [
  {
    plan: 'PERSONAL',
    title: 'PERSONAL',
    price: '6,99 EUR/MES',
    accent: M,
    features: ['Chat IA ampliado', 'Mood tracker completo', 'Herramientas de calma'],
  },
  {
    plan: 'PREMIUM',
    title: 'PREMIUM',
    price: '12 EUR/MES',
    accent: CR,
    features: ['Todo Personal', 'Reportes exportables', 'Red SOS avanzada'],
  },
];

const formatDate = (value: string | null): string => {
  if (!value) return 'SIN_FECHA';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date(value))
    .replace(/\./g, '')
    .toUpperCase();
};

const isPaidActive = (status: string): boolean => status === 'active' || status === 'trialing';

const billingModeLabel = (loading: boolean, billing: BillingStatus | null): string => {
  if (loading) return 'STRIPE_BILLING_STATUS';
  if (!billing?.billingConfigured) return 'STRIPE_BILLING_NOT_CONFIGURED';
  return billing.testMode ? 'STRIPE_BILLING_TEST_MODE' : 'STRIPE_BILLING_LIVE_MODE';
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
    return response?.data?.message ?? response?.data?.error ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export function BillingView() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePlan = billing?.plan ?? 'FREE';
  const activeCopy = planCopy[activePlan];
  const activeStatus = billing?.status ?? 'none';
  const billingReady = billing?.billingConfigured ?? false;
  const checkoutState = useMemo(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    return params.get('checkout');
  }, []);
  const checkoutSessionId = useMemo(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    return params.get('session_id');
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const statusRequest = checkoutState === 'success' && checkoutSessionId
      ? syncCheckoutSession(checkoutSessionId)
      : getBillingStatus();

    statusRequest
      .then((status) => {
        if (mounted) {
          setBilling(status);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(`ERR_BILLING: ${getErrorMessage(err, 'No se pudo cargar la facturacion.')}`);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [checkoutState, checkoutSessionId]);

  const redirectTo = (url: string) => {
    window.location.href = url;
  };

  const startCheckout = async (plan: Exclude<BillingPlan, 'FREE'>) => {
    setAction(plan);
    setError(null);
    try {
      redirectTo(await createCheckoutSession(plan));
    } catch (err) {
      setError(`ERR_BILLING: ${getErrorMessage(err, 'No se pudo iniciar Stripe Checkout.')}`);
      setAction(null);
    }
  };

  const openPortal = async () => {
    setAction('PORTAL');
    setError(null);
    try {
      redirectTo(await createCustomerPortalSession());
    } catch (err) {
      setError(`ERR_BILLING: ${getErrorMessage(err, 'No se pudo abrir el portal de Stripe.')}`);
      setAction(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <header
        className="flex flex-col md:flex-row md:items-center gap-5 md:gap-[18px]"
        style={{
          border: BORDE,
          boxShadow: SOMBRA,
          background: W,
          padding: '24px',
        }}
      >
        <div>
          <div className="lbl lbl-turquesa" style={{ marginBottom: 8 }}>
            {billingModeLabel(loading, billing)}
          </div>
          <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 0.95, margin: 0 }}>
            FACTURACION_AURA
          </h1>
          <p style={{ margin: '10px 0 0', fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }}>
            Gestion de plan para {user?.email ?? 'tu cuenta'}
          </p>
        </div>
        <div
          style={{
            border: BORDE,
            background: activeCopy.color,
            color: activePlan === 'FREE' ? K : '#fff',
            padding: '14px 18px',
            minWidth: 180,
            boxShadow: SOMBRA_SM,
            textAlign: 'center',
          }}
        >
          <div className="lbl" style={{ color: 'inherit', fontSize: 9 }}>
            PLAN_ACTUAL
          </div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{activeCopy.label}</div>
          <div className="mono" style={{ fontSize: 10, fontWeight: 700 }}>
            {activeCopy.price}
          </div>
        </div>
      </header>

      {checkoutState === 'success' && (
        <div
          role="status"
          style={{ border: BORDE, background: T, padding: 14, fontFamily: 'Space Mono', fontWeight: 900 }}
        >
          CHECKOUT_COMPLETADO: Stripe esta sincronizando tu suscripcion.
        </div>
      )}

      {checkoutState === 'cancel' && (
        <div
          role="status"
          style={{ border: BORDE, background: '#fff', padding: 14, fontFamily: 'Space Mono', fontWeight: 900 }}
        >
          CHECKOUT_CANCELADO: no se ha realizado ningun cargo.
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{ border: BORDE, background: CR, color: '#fff', padding: 14, fontFamily: 'Space Mono', fontWeight: 900 }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
        }}
      >
        <div style={{ border: BORDE, background: W, boxShadow: SOMBRA_SM, padding: 18 }}>
          <div className="lbl lbl-coral" style={{ marginBottom: 8 }}>
            ESTADO_SUSCRIPCION
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
            {loading ? 'CARGANDO...' : activeStatus.toUpperCase()}
          </div>
          <div className="mono" style={{ fontSize: 11, fontWeight: 700 }}>
            RENOVACION: {formatDate(billing?.currentPeriodEnd ?? null)}
          </div>
          {billing?.cancelAtPeriodEnd && (
            <div className="chip chip-coral" style={{ marginTop: 12 }}>
              CANCELA_AL_FINAL_DEL_PERIODO
            </div>
          )}
        </div>

        <div style={{ border: BORDE, background: W, boxShadow: SOMBRA_SM, padding: 18 }}>
          <div className="lbl lbl-turquesa" style={{ marginBottom: 8 }}>
            PORTAL_STRIPE
          </div>
          <p style={{ fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700, minHeight: 42 }}>
            Cambia tarjeta, consulta facturas o cancela tu suscripcion desde Stripe.
          </p>
          <button
            type="button"
            className="btn btn-negro"
            disabled={!billing?.customerPortalAvailable || action === 'PORTAL'}
            onClick={openPortal}
            style={{ width: '100%', justifyContent: 'center', opacity: billing?.customerPortalAvailable ? 1 : 0.55 }}
          >
            {action === 'PORTAL' ? 'ABRIENDO_PORTAL...' : 'GESTIONAR_SUSCRIPCION'}
          </button>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {paidPlans.map((plan) => {
          const selected = activePlan === plan.plan && isPaidActive(activeStatus);
          return (
            <article
              key={plan.plan}
              style={{
                border: BORDE,
                background: W,
                boxShadow: selected ? SOMBRA : SOMBRA_SM,
                padding: 22,
                position: 'relative',
              }}
            >
              {selected && (
                <div
                  className="lbl"
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: 16,
                    border: '3px solid #000',
                    background: T,
                    padding: '3px 8px',
                  }}
                >
                  ACTIVO
                </div>
              )}
              <div
                style={{
                  border: '3px solid #000',
                  background: plan.accent,
                  color: '#fff',
                  padding: '8px 10px',
                  fontWeight: 900,
                  textAlign: 'center',
                  marginBottom: 18,
                }}
              >
                {plan.title}
              </div>
              <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 12 }}>{plan.price}</div>
              <ul style={{ paddingLeft: 18, margin: '0 0 22px', fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ marginBottom: 8 }}>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-negro"
                disabled={selected || action === plan.plan || !billingReady}
                onClick={() => startCheckout(plan.plan)}
                style={{ width: '100%', justifyContent: 'center', opacity: selected || !billingReady ? 0.55 : 1 }}
              >
                {selected
                  ? 'PLAN_ACTIVO'
                  : action === plan.plan
                    ? 'ABRIENDO_CHECKOUT...'
                    : billingReady
                      ? `ELEGIR_${plan.plan}`
                      : 'BILLING_NO_DISPONIBLE'}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
