# AURA IA Frontend

Frontend completo de **AURA IA**, SaaS de apoyo emocional construido con React, Vite, TypeScript y Tailwind CSS. La autenticacion y las funcionalidades principales consumen el backend Spring Boot real.

## Estado

| Hito   | Alcance                                          | Estado     |
| ------ | ------------------------------------------------ | ---------- |
| Hito 1 | Scaffolding, providers, rutas base y tooling     | Completado |
| Hito 2 | UI library brutalista y playground               | Completado |
| Hito 3 | Landing publica completa                         | Completado |
| Hito 4 | Auth real, guards y panel interior               | Completado |
| Hito 5 | Inicio, SOS 4-4-6 y chatbot streaming            | Completado |
| Hito 6 | Minijuegos, sonidos muted, diario y mood tracker | Completado |
| Hito 7 | Contactos, configuracion, i18n, tests y Docker   | Completado |

## Stack

- React 18 + TypeScript 5.7
- Vite 6
- Tailwind CSS 3.4
- `react-router-dom` v6 con `HashRouter`
- Axios con interceptor Bearer
- `react-i18next`
- Vitest + React Testing Library
- Docker multi-stage: Node build -> nginx alpine

## Instalacion local limpia para evaluador

El proyecto esta dividido en dos repositorios Git independientes. Para que los
scripts de arranque funcionen sin cambios, clona ambos repos como carpetas
hermanas dentro de una misma carpeta de trabajo:

```text
AURA-IA/
|-- AURA-AI-BACKEND/
`-- AURA-AI-FRONTEND/
```

Clonado recomendado:

```bash
mkdir AURA-IA
cd AURA-IA
git clone https://github.com/Emilio-prog/AURA-AI-BACKEND.git
git clone https://github.com/Emilio-prog/AURA-AI-FRONTEND.git
```

Requisitos minimos:

- Node.js 20 o superior para el frontend.
- JDK 21 solo si se quiere arrancar tambien el backend local.

El arranque por defecto esta pensado para el tutor/evaluador: no requiere
`.env`, credenciales externas, PostgreSQL local, H2 ni usuarios demo. El script
arranca Vite en `http://localhost:5173` y configura un proxy de desarrollo para
que `/api/v1` consuma el backend real desplegado en `https://api.aura-ia.es`.
De esta forma la aplicacion que se ve es la real, sin commitear secretos ni
pedir datos manuales.

Arranque completo desde la carpeta `AURA-IA`:

```powershell
.\AURA-AI-FRONTEND\scripts\start-dev.ps1
```

```bash
chmod +x AURA-AI-FRONTEND/scripts/start-dev.sh
./AURA-AI-FRONTEND/scripts/start-dev.sh
```

Verificacion rapida:

- El navegador abre `http://localhost:5173`.
- Las llamadas a `http://localhost:5173/api/v1/*` llegan al backend real
  `https://api.aura-ia.es/api/v1/*` mediante el proxy de Vite.
- Vite muestra `Local: http://localhost:5173/`.

## Backend local manual

El modo tutor del script no usa este valor, porque configura `VITE_API_BASE_URL=/api/v1`
en el proceso de Vite y lo proxifica a `https://api.aura-ia.es`. Si se arranca
el frontend manualmente contra un backend local, usar:

```txt
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

La sesion se guarda con JWT real en `localStorage` bajo `aura.token` y `aura.refreshToken`.

## Puesta en marcha

```bash
npm ci
npm run dev
```

App local: `http://localhost:5173/`

Panel: `http://localhost:5173/#/dashboard`

### Arranque completo del entorno

Desde la raiz del workspace `AURA-IA`, se puede arrancar la aplicacion visible
con una sola accion. Por defecto se arranca el frontend local y se usa el
backend real desplegado mediante proxy de Vite.

Windows:

```powershell
.\AURA-AI-FRONTEND\scripts\start-dev.ps1
```

macOS/Linux:

```bash
chmod +x AURA-AI-FRONTEND/scripts/start-dev.sh
./AURA-AI-FRONTEND/scripts/start-dev.sh
```

Ambos scripts arrancan Vite en `http://localhost:5173`, configuran
`VITE_API_BASE_URL=/api/v1`, proxifican esas llamadas al backend real
`https://api.aura-ia.es` y abren el navegador cuando el frontend responde.

Para parar los procesos:

```powershell
.\AURA-AI-FRONTEND\scripts\start-dev.ps1 -Stop
```

```bash
./AURA-AI-FRONTEND/scripts/start-dev.sh stop
```

Para arrancar tambien el backend local contra PostgreSQL/Supabase real, usar el
modo avanzado `-LocalBackend` en Windows o `local-backend` en macOS/Linux. En
ese caso si se requiere `AURA-AI-BACKEND/.env` con credenciales reales:

```powershell
.\AURA-AI-FRONTEND\scripts\start-dev.ps1 -LocalBackend
```

```bash
./AURA-AI-FRONTEND/scripts/start-dev.sh local-backend
```

`-RealEnv` y `real-env` siguen aceptados como alias compatibles del modo
backend local.

### Verificacion tras los cambios

- El navegador debe abrir `http://localhost:5173`.
- Vite debe anunciar `Local: http://localhost:5173/`.
- Las llamadas API del navegador deben ir a `http://localhost:5173/api/v1` y Vite las debe proxificar a `https://api.aura-ia.es/api/v1`.
- En modo tutor, una llamada sin token a `http://localhost:5173/api/v1/auth/me` debe devolver `401`, lo que confirma que el proxy alcanza el backend real.
- En modo backend local, el backend debe responder en `http://localhost:8080/actuator/health` con `{"status":"UP"}`. Si `AURA-AI-BACKEND/.env` define `SERVER_PORT`, usa ese puerto.
- Si sigue apareciendo `127.0.0.1`, revisar que no haya un Vite antiguo abierto y ejecutar `.\AURA-AI-FRONTEND\scripts\start-dev.ps1 -Stop` antes de arrancar de nuevo.
- En Windows, revisar `.dev-logs/backend-dev.err.log`, `.dev-logs/backend-dev.out.log`, `.dev-logs/frontend-dev.err.log` y `.dev-logs/frontend-dev.out.log`.
- En macOS/Linux, revisar `.dev-logs/backend-dev.log` y `.dev-logs/frontend-dev.log`.

## Scripts

| Script              | Uso                   |
| ------------------- | --------------------- |
| `npm run dev`       | Servidor Vite         |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint`      | ESLint sin warnings   |
| `npm run test:run`  | Vitest en CI          |
| `npm run build`     | Build produccion      |
| `npm run preview`   | Preview del build     |

## Auth real

- Registro: llama a `POST /auth/register` y muestra `#/verify-email`.
- Verificacion: `#/verify-email?token=...` llama a `POST /auth/verify-email?token=...`.
- Login: llama a `POST /auth/login`, guarda `accessToken` y `refreshToken`.
- Reenvio: login/verificacion permiten llamar a `POST /auth/resend-verification`.

## Funcionalidad del panel

- Panel: navegacion persistida en `aura-section`.
- Diario: CRUD contra el backend mediante `src/services/diary.ts`.
- Contactos: CRUD contra el backend mediante `src/services/contacts.ts`.
- Configuracion: tema, idioma `es/en`, exportacion de datos, borrado de cuenta y logout.
- Sonidos: ambientes sonoros funcionales desde el panel principal.
- Mood tracker: registro y consulta contra el backend mediante `src/services/mood.ts`.
- Chat IA: sesiones y mensajes contra el backend mediante `src/services/chatbot.ts`.
- Facturacion: integracion con endpoints Stripe del backend mediante `src/services/billing.ts`.

## i18n

Configurado en `src/i18n.ts`.

Catalogos:

- `src/i18n/locales/es.json`
- `src/i18n/locales/en.json`

El idioma se persiste en `localStorage` con la clave `aura.language`.

## Tests

```bash
npm run test:run
```

Cobertura funcional incluida:

- Auth flow con backend mockeado en tests.
- Registro pendiente y pantalla de verificacion.
- Reenvio de email si login queda bloqueado por cuenta no verificada.
- Guards privado/publico.
- Diario con persistencia backend mockeada en tests.
- Chatbot con typing/streaming.
- Contactos CRUD con API mockeada en tests.
- Mood tracker 30/60/90.
- Configuracion: exportar datos, eliminar cuenta y logout.

## Docker

```bash
docker build -t aura-ai-frontend .
docker run --rm -p 8080:80 aura-ai-frontend
```

Abrir `http://localhost:8080/`.

## Estructura principal

```txt
src/
|-- components/ui
|-- context
|-- data
|-- hooks
|-- i18n
|-- pages
|   |-- auth
|   |-- dashboard
|   `-- landing
|-- routes
|-- services
|-- styles
|-- test
`-- utils
```

## Notas

Las carpetas `AURA AI - LandingPage/` y `AURA AI-Panel-Interior/` son referencias visuales originales y no forman parte del bundle.

El almacenamiento local se usa para preferencias de interfaz y tokens de sesion. Los datos funcionales principales se consumen desde el backend.
