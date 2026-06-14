import * as CookieConsent from 'vanilla-cookieconsent';

let iniciado = false;

export function iniciarCookieConsent() {
  if (iniciado || typeof window === 'undefined') {
    return;
  }

  iniciado = true;

  void CookieConsent.run({
    mode: 'opt-in',
    revision: 1,
    manageScriptTags: true,
    autoClearCookies: true,
    cookie: {
      name: 'aura_cookie_consent',
      expiresAfterDays: 180,
      sameSite: 'Lax',
    },
    guiOptions: {
      consentModal: {
        layout: 'box wide',
        position: 'bottom center',
        equalWeightButtons: true,
        flipButtons: false,
      },
      preferencesModal: {
        layout: 'box',
        equalWeightButtons: true,
        flipButtons: false,
      },
    },
    categories: {
      necessary: {
        readOnly: true,
      },
      preferences: {},
      analytics: {
        autoClear: {
          cookies: [
            { name: /^_ga/ },
            { name: '_gid' },
            { name: /^_cl/ },
          ],
        },
      },
      marketing: {
        autoClear: {
          cookies: [
            { name: /^_fb/ },
            { name: '_gcl_au' },
          ],
        },
      },
    },
    language: {
      default: 'es',
      translations: {
        es: {
          consentModal: {
            title: 'Privacidad y cookies',
            description:
              'Usamos almacenamiento necesario para que AURA funcione. Puedes aceptar o rechazar las cookies no necesarias. No cargaremos analitica ni marketing sin tu permiso.',
            acceptAllBtn: 'Aceptar',
            acceptNecessaryBtn: 'Rechazar',
            showPreferencesBtn: 'Configurar',
            footer: '<a href="/#/privacy">Privacidad</a><a href="/#/cookies">Politica de cookies</a>',
          },
          preferencesModal: {
            title: 'Preferencias de privacidad',
            acceptAllBtn: 'Aceptar todo',
            acceptNecessaryBtn: 'Rechazar todo',
            savePreferencesBtn: 'Guardar',
            closeIconLabel: 'Cerrar',
            serviceCounterLabel: 'servicio|servicios',
            sections: [
              {
                title: 'Uso de cookies',
                description:
                  'Puedes elegir que categorias permites. Las necesarias no se pueden desactivar porque hacen falta para que la aplicacion funcione.',
              },
              {
                title: 'Necesarias',
                linkedCategory: 'necessary',
                description:
                  'Sirven para recordar tu decision de cookies, mantener la sesion y proteger formularios con medidas anti-abuso.',
                cookieTable: {
                  headers: {
                    name: 'Nombre',
                    domain: 'Dominio',
                    description: 'Uso',
                    expiration: 'Duracion',
                  },
                  body: [
                    {
                      name: 'aura_cookie_consent',
                      domain: 'aura-ia.es',
                      description: 'Guarda si has aceptado o rechazado las cookies.',
                      expiration: '180 dias',
                    },
                  ],
                },
              },
              {
                title: 'Preferencias',
                linkedCategory: 'preferences',
                description:
                  'Guardan opciones como idioma, tema visual o preferencias del panel. Ahora AURA usa sobre todo localStorage para esto.',
              },
              {
                title: 'Analitica',
                linkedCategory: 'analytics',
                description:
                  'Ayudarian a medir visitas y uso general de la web. Ahora mismo no hay analitica activa.',
              },
              {
                title: 'Marketing',
                linkedCategory: 'marketing',
                description:
                  'Servirian para publicidad o seguimiento comercial. Ahora mismo AURA no usa cookies de marketing.',
              },
              {
                title: 'Mas informacion',
                description:
                  'Puedes cambiar tu eleccion cuando quieras desde la politica de cookies.',
              },
            ],
          },
        },
      },
    },
  });
}

export function abrirPreferenciasCookies() {
  CookieConsent.showPreferences();
}
