export type UserPlan = 'free' | 'pro' | 'team';

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  plan: UserPlan;
  initials: string;
  joinedAt: string;
}

export const SEED_USERS: MockUser[] = [
  {
    id: 'usr_001',
    name: 'María Solís',
    email: 'demo@aura.ai',
    password: 'aura1234',
    plan: 'pro',
    initials: 'MS',
    joinedAt: '2026-01-15',
  },
];

export const DEMO_CREDENTIALS = {
  email: 'demo@aura.ai',
  password: 'aura1234',
};
