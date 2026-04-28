# AURA IA Frontend

Frontend completo de **AURA IA**, SaaS de apoyo emocional construido con React, Vite, TypeScript y Tailwind CSS. La Fase 1 funciona standalone con mocks en `localStorage` y queda preparada para conectarse a backend Spring Boot y servicios Python/FastAPI.

## Estado

| Hito   | Alcance                                          | Estado     |
| ------ | ------------------------------------------------ | ---------- |
| Hito 1 | Scaffolding, providers, rutas base y tooling     | Completado |
| Hito 2 | UI library brutalista y playground               | Completado |
| Hito 3 | Landing pública completa                         | Completado |
| Hito 4 | Auth mock, guards y panel interior               | Completado |
| Hito 5 | Inicio, SOS 4-4-6 y chatbot streaming            | Completado |
| Hito 6 | Minijuegos, sonidos muted, diario y mood tracker | Completado |
| Hito 7 | Contactos, configuración, i18n, tests y Docker   | Completado |

## Stack

- React 18 + TypeScript 5.7
- Vite 6
- Tailwind CSS 3.4
- `react-router-dom` v6 con `HashRouter`
- Axios con interceptor Bearer
- `react-i18next`
- Vitest + React Testing Library
- Docker multi-stage: Node build -> nginx alpine

## Credenciales demo

```txt
Email: demo@aura.ai
Password: aura1234
```

La sesión se guarda con fake JWT en `localStorage` bajo `aura.token`.

## Puesta en marcha

```bash
npm install
npm run dev
```

App local: `http://localhost:5173/`

Panel: `http://localhost:5173/#/dashboard`

## Scripts

| Script              | Uso                   |
| ------------------- | --------------------- |
| `npm run dev`       | Servidor Vite         |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint`      | ESLint sin warnings   |
| `npm run test:run`  | Vitest en CI          |
| `npm run build`     | Build producción      |
| `npm run preview`   | Preview del build     |

## Funcionalidad mock

- Auth: login/register/logout con usuarios mock.
- Panel: navegación persistida en `aura-section`.
- Diario: CRUD en `aura.diary.entries`.
- Contactos: CRUD en `aura.contacts`.
- Configuración: perfil mock, idioma `es/en`, tema, exportación JSON, borrado de diario y logout.
- Sonidos: UI funcional en modo muted, sin archivos de audio.
- Mood tracker: dataset mock 30/60/90 días con bar chart y heatmap.

## i18n

Configurado en `src/i18n.ts`.

Catálogos:

- `src/i18n/locales/es.json`
- `src/i18n/locales/en.json`

El idioma se persiste en `localStorage` con la clave `aura.language`.

## Tests

```bash
npm run test:run
```

Cobertura funcional incluida:

- Auth flow con credenciales demo.
- Guards privado/público.
- Diario con persistencia local.
- Chatbot con typing/streaming.
- Contactos CRUD local.
- Mood tracker 30/60/90.
- Configuración: exportar datos y logout.

## Docker

```bash
docker build -t aura-ai-frontend .
docker run --rm -p 8080:80 aura-ai-frontend
```

Abrir `http://localhost:8080/`.

## Estructura principal

```txt
src/
├── components/ui
├── context
├── data
├── hooks
├── i18n
├── pages
│   ├── auth
│   ├── dashboard
│   └── landing
├── routes
├── services
├── styles
├── test
└── utils
```

## Notas

Las carpetas `AURA AI - LandingPage/` y `AURA AI-Panel-Interior/` son referencias visuales originales y no forman parte del bundle.

El almacenamiento local contiene datos sensibles solo para demo. En producción debe sustituirse por backend, cifrado y políticas de privacidad reales.
