import { httpClient } from '@/services/httpClient';

export type BillingPlan = 'FREE' | 'PERSONAL' | 'PREMIUM';
export type PaidBillingPlan = Exclude<BillingPlan, 'FREE'>;

export interface BillingStatus {
  plan: BillingPlan;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  customerPortalAvailable: boolean;
  testMode: boolean;
  billingConfigured: boolean;
}

interface RedirectResponse {
  url: string;
}

const PENDING_CHECKOUT_PLAN_KEY = 'aura.pendingCheckoutPlan';

export const planDePago = (value: string | null): PaidBillingPlan | null => {
  const plan = value?.trim().toUpperCase();
  if (plan === 'PERSONAL' || plan === 'PREMIUM') {
    return plan;
  }
  return null;
};

export const guardarPlanPendiente = (plan: PaidBillingPlan): void => {
  localStorage.setItem(PENDING_CHECKOUT_PLAN_KEY, plan);
};

export const obtenerPlanPendiente = (): PaidBillingPlan | null => (
  planDePago(localStorage.getItem(PENDING_CHECKOUT_PLAN_KEY))
);

export const limpiarPlanPendiente = (): void => {
  localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
};

export const getBillingStatus = async (): Promise<BillingStatus> => {
  const { data } = await httpClient.get<BillingStatus>('/billing/me');
  return data;
};

export const createCheckoutSession = async (
  plan: PaidBillingPlan,
): Promise<string> => {
  const { data } = await httpClient.post<RedirectResponse>('/billing/checkout', { plan });
  return data.url;
};

export const syncCheckoutSession = async (sessionId: string): Promise<BillingStatus> => {
  const { data } = await httpClient.post<BillingStatus>('/billing/checkout/sync', { sessionId });
  return data;
};

export const createCustomerPortalSession = async (): Promise<string> => {
  const { data } = await httpClient.post<RedirectResponse>('/billing/portal');
  return data.url;
};
