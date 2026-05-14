import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, vi, type Mock } from 'vitest';
import App from '@/App';
import { httpClient } from '@/services/httpClient';

vi.mock('@/services/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
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
  put: Mock;
  delete: Mock;
};

const achievementsResponse = {
  total: 8,
  unlocked: 2,
  achievements: [
    {
      code: 'REFUGIO_ACTIVADO',
      title: 'Refugio activado',
      description: 'Completa el onboarding inicial.',
      category: 'Inicio',
      accent: '#2DD4BF',
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: '2026-05-10T12:00:00Z',
      progressLabel: '1/1',
    },
    {
      code: 'PRIMERA_ENTRADA_DIARIO',
      title: 'Primera entrada de diario',
      description: 'Guarda tu primera nota en el diario.',
      category: 'Diario',
      accent: '#FB7185',
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: '2026-05-11T12:00:00Z',
      progressLabel: '1/1',
    },
    {
      code: 'EXPLORADOR_CALMA',
      title: 'Explorador de calma',
      description: 'Completa respiracion, sonido y minijuego.',
      category: 'Calma',
      accent: '#A855F7',
      progress: 0,
      target: 3,
      unlocked: false,
      unlockedAt: null,
      progressLabel: '0/3',
    },
  ],
};

const page = (content: unknown[]) => ({
  content,
  page: 0,
  size: 100,
  totalElements: content.length,
  totalPages: 1,
  sort: 'UNSORTED',
});

const billingStatus = {
  plan: 'PERSONAL',
  status: 'active',
  currentPeriodEnd: '2026-06-11T00:00:00Z',
  cancelAtPeriodEnd: false,
  customerPortalAvailable: true,
  testMode: true,
  billingConfigured: true,
};

const chatSession = (messages: unknown[] = []) => ({
  id: 'chat_001',
  title: 'Nueva sesion',
  messages,
  startedAt: '2026-05-11T10:00:00Z',
  updatedAt: null,
});

const mockDashboardApis = (overrides: Record<string, unknown> = {}) => {
  const diary = overrides.diary ?? [];
  const mood = overrides.mood ?? [];
  const contacts = overrides.contacts ?? [];
  const billing = overrides.billing ?? billingStatus;
  const panicStatus = String(overrides.panicStatus ?? 'SENT');

  httpMock.get.mockImplementation((url: string) => {
    if (url === '/auth/me') return Promise.resolve({ data: backendUser });
    if (url === '/achievements') return Promise.resolve({ data: achievementsResponse });
    if (url === '/diary') return Promise.resolve({ data: page(diary as unknown[]) });
    if (url === '/mood') return Promise.resolve({ data: page(mood as unknown[]) });
    if (url === '/contacts') return Promise.resolve({ data: contacts });
    if (url === '/users/me/export') return Promise.resolve({ data: { exportedAt: '2026-05-11T10:00:00Z' } });
    if (url === '/users/me/export.pdf') return Promise.resolve({ data: new Blob(['pdf']) });
    if (url === '/billing/me') return Promise.resolve({ data: billing });
    return Promise.resolve({ data: {} });
  });

  httpMock.post.mockImplementation((url: string, payload: Record<string, unknown> = {}) => {
    if (url === '/chatbot/sessions') {
      return Promise.resolve({ data: overrides.chatSession ?? chatSession() });
    }
    if (url === '/chatbot/sessions/chat_001/messages') {
      if (overrides.chatMessageError) return Promise.reject(overrides.chatMessageError);
      const content = String(payload.message ?? '');
      const isCrisis = /pánico|panico|crisis|sos/i.test(content);
      return Promise.resolve({
        data: chatSession([
          { role: 'user', content, timestamp: '2026-05-11T10:00:01Z' },
          {
            role: 'assistant',
            content: isCrisis
              ? 'Si hay riesgo inmediato, llama al 112. Si estas en Espana, llama al 024. Estoy contigo.'
              : 'Entiendo esa ansiedad. No tienes que resolver todo ahora.',
            timestamp: '2026-05-11T10:00:02Z',
            sentiment: isCrisis ? 'crisis' : 'supportive',
            riskLevel: isCrisis ? 'high' : 'medium',
            emotions: isCrisis ? ['distress'] : ['anxiety'],
          },
        ]),
      });
    }
    if (url === '/diary') {
      return Promise.resolve({
        data: {
          id: 'diary_001',
          title: payload.title ?? null,
          content: payload.content,
          moodScore: payload.moodScore ?? null,
          moodLabel: payload.moodLabel ?? null,
          tags: payload.tags ?? [],
          createdAt: null,
          updatedAt: null,
        },
      });
    }
    if (url === '/mood') {
      return Promise.resolve({
        data: {
          id: 'mood_001',
          beforeLevel: payload.beforeLevel,
          afterLevel: payload.afterLevel,
          note: payload.note ?? null,
          loggedAt: payload.loggedAt,
          createdAt: '2026-05-11T10:00:00Z',
          updatedAt: null,
        },
      });
    }
    if (url === '/contacts') {
      return Promise.resolve({
        data: {
          id: 'contact_001',
          name: payload.name,
          phone: payload.phone,
          relationship: payload.relationship,
          priority: payload.priority,
          available: payload.available,
          sosEnabled: payload.sosEnabled,
          createdAt: '2026-05-11T10:00:00Z',
          updatedAt: null,
        },
      });
    }
    if (url === '/panic/trigger') {
      return Promise.resolve({
        data: {
          id: 'panic_001',
          triggeredAt: '2026-05-11T10:00:00Z',
          resolvedAt: null,
          notes: payload.notes ?? null,
          contextJson: payload.contextJson ?? {},
          notifications: [
            {
              id: 'notif_001',
              contactId: payload.contactId,
              contactName: 'Ana',
              channel: 'SMS',
              status: panicStatus,
              details: panicStatus === 'MOCKED' ? 'SMS simulated for Ana' : 'Twilio SMS sent',
              createdAt: '2026-05-11T10:00:00Z',
            },
          ],
          createdAt: '2026-05-11T10:00:00Z',
          updatedAt: null,
        },
      });
    }
    if (url === '/achievements/events') return Promise.resolve({ data: achievementsResponse });
    if (url === '/users/me/delete') return Promise.resolve({ data: { message: 'OK' } });
    if (url === '/billing/checkout/sync') return Promise.resolve({ data: overrides.syncBilling ?? billing });
    return Promise.resolve({ data: {} });
  });
  httpMock.put.mockImplementation((_url: string, payload: Record<string, unknown>) =>
    Promise.resolve({ data: { id: 'updated_001', ...payload, createdAt: '2026-05-11T10:00:00Z', updatedAt: null } }),
  );
  httpMock.delete.mockResolvedValue({ data: { message: 'OK' } });
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
  mockDashboardApis();
  seedSession();
  window.location.hash = `#/dashboard/${section}`;
  render(<App />);
};

describe('panel bienestar y utilidades', () => {
  beforeEach(() => {
    httpMock.get.mockReset();
    httpMock.post.mockReset();
    httpMock.put.mockReset();
    httpMock.delete.mockReset();
    httpMock.post.mockResolvedValue({ data: {} });
  });

  it('registra una entrada de diario en backend', async () => {
    const user = userEvent.setup();
    renderDashboard('diario');

    await screen.findByText('DIARIO_EMOCIONAL');
    await user.click(screen.getByTitle('CALMA'));
    await user.type(
      screen.getByPlaceholderText(/Escribe libremente/i),
      'Entrada test del diario para Hito 7.',
    );
    await user.type(screen.getByPlaceholderText('AÑADIR_TAG_PROPIO'), 'Calma profunda{enter}');
    await user.click(screen.getByRole('button', { name: /GUARDAR_ENTRADA/i }));

    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/diary', expect.objectContaining({
        content: 'Entrada test del diario para Hito 7.',
        moodLabel: 'CALMA',
        tags: ['calma-profunda'],
      }));
    });
    expect(await screen.findByText(/Entrada test del diario/)).toBeInTheDocument();
    expect(await screen.findByText('#calma-profunda')).toBeInTheDocument();
  });

  it('busca y filtra diario por texto y tags en backend', async () => {
    const user = userEvent.setup();
    renderDashboard('diario');

    await screen.findByText('DIARIO_EMOCIONAL');
    await user.type(screen.getByPlaceholderText('BUSCAR_EN_DIARIO...'), 'respirar');
    await waitFor(() => {
      expect(httpMock.get).toHaveBeenCalledWith('/diary', {
        params: expect.objectContaining({ q: 'respirar', size: 120 }),
      });
    });

    await user.click(screen.getAllByRole('button', { name: '#ansiedad' })[0]);
    await waitFor(() => {
      expect(httpMock.get).toHaveBeenCalledWith('/diary', {
        params: expect.objectContaining({ q: 'respirar', tags: 'ansiedad', size: 120 }),
      });
    });
  });

  it('streaming del chatbot responde a un mensaje de ansiedad', async () => {
    const user = userEvent.setup();
    renderDashboard('chatbot');

    const input = await screen.findByPlaceholderText('ESCRIBE_LO_QUE_SIENTES...');
    await waitFor(() => expect(input).toBeEnabled());
    await user.type(input, 'tengo ansiedad{enter}');

    expect(httpMock.post).toHaveBeenCalledWith('/chatbot/sessions');
    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith(
        '/chatbot/sessions/chat_001/messages',
        { message: 'tengo ansiedad' },
        { timeout: 45_000 },
      );
    });
    expect(await screen.findByText(/PENSANDO|STREAMING/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Entiendo esa ansiedad/i, {}, { timeout: 6000 }),
    ).toBeInTheDocument();
  });

  it('chatbot muestra ERR_CHATBOT si falla el backend', async () => {
    const user = userEvent.setup();
    mockDashboardApis({ chatMessageError: new Error('Network Error') });
    seedSession();
    window.location.hash = '#/dashboard/chatbot';
    render(<App />);

    const input = await screen.findByPlaceholderText('ESCRIBE_LO_QUE_SIENTES...');
    await waitFor(() => expect(input).toBeEnabled());
    await user.type(input, 'hola{enter}');

    expect(await screen.findByText(/ERR_CHATBOT: Network Error/i)).toBeInTheDocument();
  });

  it('chatbot muestra aviso de crisis con 112 y 024', async () => {
    const user = userEvent.setup();
    renderDashboard('chatbot');

    const input = await screen.findByPlaceholderText('ESCRIBE_LO_QUE_SIENTES...');
    await waitFor(() => expect(input).toBeEnabled());
    await user.type(input, 'tengo pánico{enter}');

    expect(await screen.findByText(/112/i, {}, { timeout: 6000 })).toBeInTheDocument();
    expect(await screen.findByText(/024/i)).toBeInTheDocument();
  });

  it('crea contactos de confianza con persistencia backend', async () => {
    const user = userEvent.setup();
    renderDashboard('contactos');

    await screen.findAllByText('CONTACTOS_DE_CONFIANZA');
    await user.click(screen.getByRole('button', { name: /\+ AÑADIR_CONTACTO/i }));
    await user.type(screen.getByLabelText('Nombre contacto'), 'Lucía Test');
    await user.type(screen.getByLabelText('Teléfono contacto'), '+34 600 000 001');
    await user.type(screen.getByLabelText('Rol contacto'), 'AMIGA');
    await user.click(screen.getByRole('button', { name: /GUARDAR_CONTACTO/i }));

    expect(await screen.findByText('Lucía Test')).toBeInTheDocument();
    expect(httpMock.post).toHaveBeenCalledWith('/contacts', expect.objectContaining({
      name: 'Lucía Test',
      phone: '+34 600 000 001',
      relationship: 'AMIGA',
    }));
  });

  it('mood tracker muestra bar chart y heatmap 30-90 días', async () => {
    const user = userEvent.setup();
    renderDashboard('mood');

    await screen.findAllByText('MOOD_TRACKER');
    expect(screen.getByText('BAR_CHART_SEMANAL')).toBeInTheDocument();
    expect(screen.getByText('HEATMAP_EMOCIONAL')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '30D' }));
    expect(screen.getByText(/30_D/)).toBeInTheDocument();
  });

  it('home muestra resumen de logros server-side', async () => {
    renderDashboard('inicio');

    expect(await screen.findByText(/LOGROS_DESBLOQUEADOS/)).toBeInTheDocument();
    expect(httpMock.get).toHaveBeenCalledWith('/achievements');
  });

  it('vuelve de SOS a Inicio con un solo click del menu lateral', async () => {
    const user = userEvent.setup();
    renderDashboard('sos');

    expect(await screen.findByText('PROTOCOLO_DE_CONTENCIÓN_INMEDIATA')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /INICIO_|HOME_/i }));

    await waitFor(() => expect(window.location.hash).toBe('#/dashboard'));
    expect(await screen.findByText(/LOGROS_DESBLOQUEADOS/)).toBeInTheDocument();
    expect(screen.queryByText('PROTOCOLO_DE_CONTENCIÓN_INMEDIATA')).not.toBeInTheDocument();
  });

  it('envia SOS por SMS al contacto elegido', async () => {
    const user = userEvent.setup();
    mockDashboardApis({
      contacts: [
        {
          id: 'contact_001',
          name: 'Ana',
          phone: '+34 600 000 001',
          relationship: 'Hermana',
          priority: 1,
          available: true,
          sosEnabled: true,
          createdAt: '2026-05-11T10:00:00Z',
          updatedAt: null,
        },
      ],
    });
    seedSession();
    window.location.hash = '#/dashboard/sos';
    render(<App />);

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ENVIAR_SOS/i }));

    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/panic/trigger', expect.objectContaining({
        contactId: 'contact_001',
      }));
    });
    expect(await screen.findByText(/SMS_ENVIADO/)).toBeInTheDocument();
  });

  it('muestra WhatsApp y SMS manual si el envio automatico esta simulado', async () => {
    const user = userEvent.setup();
    mockDashboardApis({
      panicStatus: 'MOCKED',
      contacts: [
        {
          id: 'contact_001',
          name: 'Ana',
          phone: '+34 600 000 001',
          relationship: 'Hermana',
          priority: 1,
          available: true,
          sosEnabled: true,
          createdAt: '2026-05-11T10:00:00Z',
          updatedAt: null,
        },
      ],
    });
    seedSession();
    window.location.hash = '#/dashboard/sos';
    render(<App />);

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ENVIAR_SOS/i }));

    expect(await screen.findByRole('link', { name: /AVISAR_WHATSAPP/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /AVISAR_WHATSAPP/i })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/34600000001?text='),
    );
    expect(screen.getByRole('link', { name: /ENVIAR_SMS/i })).toHaveAttribute('href', 'sms:+34600000001');
  });

  it('ruta logros lista bloqueados y desbloqueados', async () => {
    renderDashboard('logros');

    expect(await screen.findByText('LOGROS_AURA')).toBeInTheDocument();
    expect(await screen.findByText('REFUGIO ACTIVADO')).toBeInTheDocument();
    expect(await screen.findByText('EXPLORADOR DE CALMA')).toBeInTheDocument();
  });

  it('guardar mood llama al backend', async () => {
    const user = userEvent.setup();
    renderDashboard('mood');

    await screen.findAllByText('MOOD_TRACKER');
    await user.click(screen.getByRole('button', { name: /REGISTRAR_SESIÓN/i }));

    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/mood', expect.objectContaining({
        beforeLevel: 6,
        afterLevel: 8,
      }));
    });
  });

  it('sonidos y minijuegos envian eventos de logros', async () => {
    const user = userEvent.setup();
    renderDashboard('sonidos');

    await user.click(await screen.findByRole('button', { name: /LLUVIA_SUAVE/i }));
    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/achievements/events', expect.objectContaining({
        type: 'SOUNDSCAPE_PLAYED',
      }));
    });

    window.location.hash = '#/dashboard/juegos';
    await screen.findByText(/REFUGIO_L/);
    await user.click(await screen.findByRole('button', { name: /COMENZAR_VIAJE/i }));
    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/achievements/events', expect.objectContaining({
        type: 'MINIGAME_OPENED',
      }));
    });
  });

  it('configuración permite exportar/borrar diario y cerrar sesión', async () => {
    const user = userEvent.setup();
    renderDashboard('config');

    await screen.findAllByText('CONFIGURACIÓN');
    await user.click(screen.getByRole('button', { name: /EXPORTAR_DATOS/i }));
    const exportPanel = screen.getByText(/Descarga una copia de tus datos/i).closest('div');
    await user.click(
      within(exportPanel as HTMLElement).getByRole('button', { name: /DESCARGAR_JSON/i }),
    );
    expect(await screen.findByText('EXPORT_JSON_COMPLETADO')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /SESIÓN/i }));
    await user.click(screen.getByRole('button', { name: /CERRAR_SESIÓN/i }));
    await waitFor(() => expect(localStorage.getItem('aura.token')).toBeNull());
  });

  it('elimina la cuenta con confirmación fuerte y limpia la sesión local', async () => {
    const user = userEvent.setup();
    renderDashboard('config');

    await screen.findAllByText('CONFIGURACIÓN');
    await user.click(screen.getByRole('button', { name: /ELIMINAR_CUENTA/i }));
    await user.type(screen.getByLabelText('Confirmación eliminar cuenta'), 'ELIMINAR MI CUENTA');
    await user.type(screen.getByLabelText('Contraseña actual para eliminar cuenta'), 'Password123!');
    await user.click(screen.getByRole('button', { name: /ELIMINAR_CUENTA_DEFINITIVAMENTE/i }));

    await waitFor(() => {
      expect(httpMock.post).toHaveBeenCalledWith('/users/me/delete', {
        confirmationText: 'ELIMINAR MI CUENTA',
        currentPassword: 'Password123!',
      });
    });
    await waitFor(() => expect(localStorage.getItem('aura.token')).toBeNull());
  });

  it('facturacion muestra el estado de Stripe del usuario', async () => {
    mockDashboardApis({ billing: billingStatus });
    seedSession();
    window.location.hash = '#/dashboard/billing';

    render(<App />);

    expect(await screen.findByText('FACTURACION_AURA')).toBeInTheDocument();
    expect(await screen.findByText('ESTADO_SUSCRIPCION')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GESTIONAR_SUSCRIPCION/i })).toBeEnabled();
    expect(httpMock.get).toHaveBeenCalledWith('/billing/me');
  });

  it('facturacion sincroniza checkout al volver de Stripe', async () => {
    mockDashboardApis({
      syncBilling: {
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
