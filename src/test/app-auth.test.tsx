import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { DEMO_CREDENTIALS } from '@/data/users';

const seedSession = () => {
  localStorage.setItem('aura.token', 'aura.fake-jwt.test');
  localStorage.setItem(
    'aura.user',
    JSON.stringify({
      id: 'usr_001',
      name: 'María Solís',
      email: DEMO_CREDENTIALS.email,
      plan: 'pro',
      initials: 'MS',
    }),
  );
};

describe('auth flow y guards', () => {
  it('permite iniciar sesión con credenciales demo', async () => {
    const user = userEvent.setup();
    window.location.hash = '#/login';

    render(<App />);

    await user.type(await screen.findByLabelText('EMAIL_USUARIO'), DEMO_CREDENTIALS.email);
    await user.type(screen.getByLabelText(/CONTRASE/), DEMO_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: /EJECUTAR_LOGIN/i }));

    await waitFor(() => expect(window.location.hash).toContain('/dashboard'));
    expect(localStorage.getItem('aura.token')).toContain('aura.fake-jwt');
  });

  it('redirige dashboard privado a login si no hay sesión', async () => {
    window.location.hash = '#/dashboard';

    render(<App />);

    await screen.findByRole('button', { name: /EJECUTAR_LOGIN/i });
    expect(window.location.hash).toContain('/login');
  });

  it('permite entrar al dashboard si hay token y usuario persistidos', async () => {
    seedSession();
    window.location.hash = '#/dashboard';

    render(<App />);

    expect(await screen.findByText(/PANEL_INTERIOR_V2/i)).toBeInTheDocument();
  });
});
