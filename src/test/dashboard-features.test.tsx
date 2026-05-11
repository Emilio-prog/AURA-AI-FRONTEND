import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi, type Mock } from 'vitest';
import App from '@/App';
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
  email: 'demo@aura.ai',
  role: 'USER',
  plan: 'PERSONAL',
  emailVerified: true,
  createdAt: '2026-01-15T00:00:00Z',
  onboardedAt: '2026-05-10T12:00:00Z',
};

const httpMock = httpClient as unknown as {
  get: Mock;
  post: Mock;
};

const seedSession = () => {
  localStorage.setItem('aura.token', 'access.jwt.test');
  localStorage.setItem('aura.refreshToken', 'refresh.jwt.test');
  localStorage.setItem(
    'aura.user',
    JSON.stringify({
      id: 'usr_001',
      name: 'María Solís',
      email: 'demo@aura.ai',
      plan: 'personal',
      initials: 'MS',
      onboardedAt: backendUser.onboardedAt,
    }),
  );
};

const renderDashboard = (section: string) => {
  httpMock.get.mockResolvedValueOnce({ data: backendUser });
  seedSession();
  window.location.hash = `#/dashboard/${section}`;
  render(<App />);
};

describe('panel bienestar y utilidades', () => {
  beforeEach(() => {
    httpMock.get.mockReset();
    httpMock.post.mockReset();
    httpMock.post.mockResolvedValue({ data: {} });
  });

  it('registra una entrada de diario en localStorage', async () => {
    const user = userEvent.setup();
    renderDashboard('diario');

    await screen.findByText('DIARIO_EMOCIONAL');
    await user.click(screen.getByTitle('CALMA'));
    await user.type(
      screen.getByPlaceholderText(/Escribe libremente/i),
      'Entrada test del diario para Hito 7.',
    );
    await user.click(screen.getByRole('button', { name: /GUARDAR_ENTRADA/i }));

    await waitFor(() => {
      expect(localStorage.getItem('aura.diary.entries')).toContain('Entrada test del diario');
    });
  });

  it('streaming del chatbot responde a un mensaje de ansiedad', async () => {
    const user = userEvent.setup();
    renderDashboard('chatbot');

    const input = await screen.findByPlaceholderText('ESCRIBE_LO_QUE_SIENTES...');
    await user.type(input, 'tengo ansiedad{enter}');

    expect(await screen.findByText(/PENSANDO|STREAMING/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Entiendo esa ansiedad/i, {}, { timeout: 6000 }),
    ).toBeInTheDocument();
  });

  it('crea contactos de confianza con persistencia local', async () => {
    const user = userEvent.setup();
    renderDashboard('contactos');

    await screen.findAllByText('CONTACTOS_DE_CONFIANZA');
    await user.click(screen.getByRole('button', { name: /\+ AÑADIR_CONTACTO/i }));
    await user.type(screen.getByLabelText('Nombre contacto'), 'Lucía Test');
    await user.type(screen.getByLabelText('Teléfono contacto'), '+34 600 000 001');
    await user.type(screen.getByLabelText('Rol contacto'), 'AMIGA');
    await user.click(screen.getByRole('button', { name: /GUARDAR_CONTACTO/i }));

    expect(await screen.findByText('Lucía Test')).toBeInTheDocument();
    expect(localStorage.getItem('aura.contacts')).toContain('Lucía Test');
  });

  it('mood tracker muestra bar chart y heatmap 30-90 días', async () => {
    const user = userEvent.setup();
    renderDashboard('mood');

    await screen.findAllByText('MOOD_TRACKER');
    expect(screen.getByText('BAR_CHART_SEMANAL')).toBeInTheDocument();
    expect(screen.getByText('HEATMAP_EMOCIONAL')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '30D' }));
    expect(screen.getByText(/30_DÍAS/)).toBeInTheDocument();
  });

  it('configuración permite exportar/borrar diario y cerrar sesión', async () => {
    const user = userEvent.setup();
    renderDashboard('config');

    await screen.findAllByText('CONFIGURACIÓN');
    await user.click(screen.getByRole('button', { name: /EXPORTAR_DATOS/i }));
    const exportPanel = screen.getByText(/Descarga todos tus datos/i).closest('div');
    await user.click(
      within(exportPanel as HTMLElement).getByRole('button', { name: /DESCARGAR/i }),
    );
    expect(await screen.findByText('EXPORT_COMPLETADO')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /SESIÓN/i }));
    await user.click(screen.getByRole('button', { name: /CERRAR_SESIÓN/i }));
    await waitFor(() => expect(localStorage.getItem('aura.token')).toBeNull());
  });
  it('facturacion muestra el estado de Stripe del usuario', async () => {
    httpMock.get
      .mockResolvedValueOnce({ data: backendUser })
      .mockResolvedValueOnce({
        data: {
          plan: 'PERSONAL',
          status: 'active',
          currentPeriodEnd: '2026-06-11T00:00:00Z',
          cancelAtPeriodEnd: false,
          customerPortalAvailable: true,
          testMode: true,
          billingConfigured: true,
        },
      });
    seedSession();
    window.location.hash = '#/dashboard/billing';

    render(<App />);

    expect(await screen.findByText('FACTURACION_AURA')).toBeInTheDocument();
    expect(await screen.findByText('ESTADO_SUSCRIPCION')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GESTIONAR_SUSCRIPCION/i })).toBeEnabled();
    expect(httpMock.get).toHaveBeenCalledWith('/billing/me');
  });

  it('facturacion sincroniza checkout al volver de Stripe', async () => {
    httpMock.get.mockResolvedValueOnce({ data: backendUser });
    httpMock.post.mockResolvedValueOnce({
      data: {
        plan: 'PREMIUM',
        status: 'active',
        currentPeriodEnd: '2026-06-11T00:00:00Z',
        cancelAtPeriodEnd: false,
        customerPortalAvailable: true,
        testMode: true,
        billingConfigured: true,
      },
    });
    seedSession();
    window.location.hash = '#/dashboard/billing?checkout=success&session_id=cs_test_123';

    render(<App />);

    expect(await screen.findByText('CHECKOUT_COMPLETADO: Stripe esta sincronizando tu suscripcion.')).toBeInTheDocument();
    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/billing/checkout/sync', { sessionId: 'cs_test_123' });
    });
    expect(await screen.findByText('ACTIVO')).toBeInTheDocument();
    expect(screen.getAllByText('PREMIUM').length).toBeGreaterThan(0);
  });
});
