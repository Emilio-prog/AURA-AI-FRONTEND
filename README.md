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

- JDK 21 para el backend.
- Node.js 20 o superior para el frontend.
- PostgreSQL accesible. Puede ser Supabase o una instancia local si se ajusta
  `SPRING_DATASOURCE_URL`.

Archivos que debe crear el evaluador despues de clonar:

```bash
cp AURA-AI-BACKEND/.env.example AURA-AI-BACKEND/.env
cp AURA-AI-FRONTEND/.env.example AURA-AI-FRONTEND/.env.local
```

En Windows PowerShell:

```powershell
Copy-Item AURA-AI-BACKEND\.env.example AURA-AI-BACKEND\.env
Copy-Item AURA-AI-FRONTEND\.env.example AURA-AI-FRONTEND\.env.local
```

Los archivos reales `.env` y `.env.local` no se versionan porque pueden contener
secretos. El tutor debe rellenar al menos la conexion PostgreSQL del backend y
mantener `VITE_API_BASE_URL=http://localhost:8080/api/v1` en el frontend si usa
el puerto local por defecto.

Si el script `start-dev.ps1` se ejecuta en un clon limpio sin `.env`, copiara
los `.env.example` necesarios y se detendra con un mensaje indicando que falta
rellenar la configuracion del backend.

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
- El backend responde `GET http://localhost:8080/actuator/health` con
  `{"status":"UP"}`.
- Vite muestra `Local: http://localhost:5173/`.

## Backend

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

Desde la raiz del workspace `AURA-IA`, se puede arrancar backend y frontend con una sola accion.

Windows:

```powershell
.\AURA-AI-FRONTEND\scripts\start-dev.ps1
```

macOS/Linux:

```bash
chmod +x AURA-AI-FRONTEND/scripts/start-dev.sh
./AURA-AI-FRONTEND/scripts/start-dev.sh
```

Ambos scripts arrancan el backend en `http://localhost:8080`, Vite en `http://localhost:5173` y abren el navegador en `http://localhost:5173` cuando el frontend responde.

Si `AURA-AI-BACKEND/.env` define `SERVER_PORT`, los scripts usan ese puerto real y muestran un aviso. En ese caso, alinea tambien `AURA-AI-FRONTEND/.env.local`:

```txt
VITE_API_BASE_URL=http://localhost:<SERVER_PORT>/api/v1
```

Para parar los procesos:

```powershell
.\AURA-AI-FRONTEND\scripts\start-dev.ps1 -Stop
```

```bash
./AURA-AI-FRONTEND/scripts/start-dev.sh stop
```

### Verificacion tras los cambios

- El navegador debe abrir `http://localhost:5173`.
- Vite debe anunciar `Local: http://localhost:5173/`.
- El backend debe responder en `http://localhost:8080/actuator/health` con `{"status":"UP"}`. Si `AURA-AI-BACKEND/.env` define `SERVER_PORT`, usa ese puerto.
- Las llamadas API del navegador deben ir a `http://localhost:8080/api/v1`.
- Si sigue apareciendo `127.0.0.1`, revisar `AURA-AI-FRONTEND/.env.local` y cambiar `VITE_API_BASE_URL` a `http://localhost:<SERVER_PORT>/api/v1`.
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
