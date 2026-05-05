import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import App from '@/App';
import { DEMO_CREDENTIALS } from '@/data/users';
import { httpClient } from '@/services/httpClient';

vi.mock('@/services/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const backendUser = {
  id: 'usr_001',
  name: 'Maria Solis',
  email: DEMO_CREDENTIALS.email,
  role: 'USER',
  plan: 'PRO',
  emailVerified: true,
  createdAt: '2026-01-15T00:00:00Z',
};

const authResponse = {
  accessToken: 'access.jwt.test',
  refreshToken: 'refresh.jwt.test',
  tokenType: 'Bearer',
  expiresInMs: 900000,
  user: backendUser,
};

const httpMock = httpClient as unknown as {
  get: Mock;
  post: Mock;
};

const seedSession = () => {
  localStorage.setItem('aura.token', 'access.jwt.persisted');
  localStorage.setItem('aura.refreshToken', 'refresh.jwt.persisted');
  localStorage.setItem(
    'aura.user',
    JSON.stringify({
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      plan: 'pro',
      initials: 'MS',
    }),
  );
};

describe('auth flow y guards', () => {
  beforeEach(() => {
    httpMock.get.mockReset();
    httpMock.post.mockReset();
  });

  it('permite iniciar sesion con el backend', async () => {
    httpMock.post.mockResolvedValueOnce({ data: authResponse });
    const user = userEvent.setup();
    window.location.hash = '#/login';

    render(<App />);

    await user.type(await screen.findByLabelText('EMAIL_USUARIO'), DEMO_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/CONTRASE/), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /EJECUTAR_LOGIN/i }));

    await waitFor(() => expect(window.location.hash).toContain('/dashboard'));
    expect(localStorage.getItem('aura.token')).toBe(authResponse.accessToken);
    expect(localStorage.getItem('aura.refreshToken')).toBe(authResponse.refreshToken);
  });

  it('redirige dashboard privado a login si no hay sesion', async () => {
    window.location.hash = '#/dashboard';

    render(<App />);

    await screen.findByRole('button', { name: /EJECUTAR_LOGIN/i });
    expect(window.location.hash).toContain('/login');
  });

  it('permite entrar al dashboard si /auth/me valida la sesion persistida', async () => {
    httpMock.get.mockResolvedValueOnce({ data: backendUser });
    seedSession();
    window.location.hash = '#/dashboard';

    render(<App />);

    expect(await screen.findByText(/PANEL_INTERIOR_V2/i)).toBeInTheDocument();
    expect(httpMock.get).toHaveBeenCalledWith('/auth/me');
  });

  it('rota refresh token si el access token persistido expiro', async () => {
    httpMock.get.mockRejectedValueOnce({ response: { status: 401 } });
    httpMock.post.mockResolvedValueOnce({ data: authResponse });
    seedSession();
    window.location.hash = '#/dashboard';

    render(<App />);

    expect(await screen.findByText(/PANEL_INTERIOR_V2/i)).toBeInTheDocument();
    expect(httpMock.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'refresh.jwt.persisted',
    });
    expect(localStorage.getItem('aura.token')).toBe(authResponse.accessToken);
  });
});
