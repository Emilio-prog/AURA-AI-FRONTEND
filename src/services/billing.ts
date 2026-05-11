import { httpClient } from '@/services/httpClient';

export type BillingPlan = 'FREE' | 'PERSONAL' | 'PREMIUM';

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

export const getBillingStatus = async (): Promise<BillingStatus> => {
  const { data } = await httpClient.get<BillingStatus>('/billing/me');
  return data;
};

export const createCheckoutSession = async (
  plan: Exclude<BillingPlan, 'FREE'>,
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
