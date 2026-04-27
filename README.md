# AURA IA — Frontend

Frontend del SaaS **AURA IA**, una plataforma de apoyo emocional para personas que sufren ansiedad, estrés u otros problemas de salud mental.

> **Estado actual:** Hito 1 (cimientos) completo. La app arranca con una página de bienvenida que valida que el sistema de diseño brutalista está operativo. Los siguientes hitos van añadiendo, sección a sección, la landing pública y el panel interior.

---

## 🧱 Stack

| Capa          | Tecnología                                                   |
| ------------- | ------------------------------------------------------------ |
| Build         | Vite 6                                                       |
| Lenguaje      | TypeScript 5.7 (`strict`)                                    |
| UI            | React 18                                                     |
| Estilos       | Tailwind CSS 3.4 (config con tokens brutalistas)             |
| Routing       | `react-router-dom` v6 (HashRouter)                           |
| HTTP          | Axios — cliente centralizado en `src/services/httpClient.ts` |
| Estado        | React Context API                                            |
| Iconos        | `lucide-react`                                               |
| Animaciones   | `framer-motion` + CSS keyframes                              |
| Smooth scroll | `lenis` (solo landing)                                       |
| i18n          | `react-i18next` (es por defecto)                             |
| Testing       | Vitest + React Testing Library + jsdom                       |
| Calidad       | ESLint 9 (flat config) + Prettier + Husky + lint-staged      |

---

## 🚀 Puesta en marcha

### Requisitos

- **Node.js** ≥ 20 (testeado con Node 24)
- **npm** ≥ 10 (también funciona con `pnpm` o `yarn`; este repo usa npm por defecto)

### Instalar y arrancar

```bash
# 1) Clonar y entrar
git clone <url-del-repo> aura-ai-frontend
cd aura-ai-frontend

# 2) Variables de entorno
cp .env.example .env

# 3) Instalar dependencias
npm install

# 4) Arrancar el servidor de desarrollo
npm run dev
```

La app abrirá automáticamente en [http://localhost:5173](http://localhost:5173).

### Scripts disponibles

| Script                 | Descripción                                               |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Arranca Vite en modo desarrollo con HMR                   |
| `npm run build`        | Type-check + build de producción a `dist/`                |
| `npm run preview`      | Sirve el build de producción para verificación local      |
| `npm run lint`         | Linter sobre `src/**/*.{ts,tsx}` (sin warnings tolerados) |
| `npm run lint:fix`     | Linter con auto-fix                                       |
| `npm run format`       | Formatea con Prettier                                     |
| `npm run format:check` | Verifica formato sin escribir                             |
| `npm run typecheck`    | TypeScript sin emitir output                              |
| `npm run test`         | Vitest en modo watch                                      |
| `npm run test:run`     | Vitest una sola pasada (CI)                               |

---

## 📁 Estructura

```
aura-ai-frontend/
├── public/                 # Estáticos (favicon, robots.txt en el futuro)
├── src/
│   ├── assets/             # Imágenes, iconos custom, fuentes
│   ├── components/
│   │   ├── ui/             # Piezas atómicas reutilizables (Hito 2)
│   │   ├── layout/         # Sidebar, Drawer, Topbar (Hito 5)
│   │   └── features/       # Componentes por dominio (Hitos 5–7)
│   ├── pages/
│   │   ├── landing/        # Home, Pricing, About (Hito 3)
│   │   ├── auth/           # Login, Register, ForgotPassword (Hito 4)
│   │   ├── dashboard/      # 9 secciones del panel (Hitos 5–7)
│   │   └── WelcomePage.tsx # Placeholder del Hito 1
│   ├── hooks/              # Custom hooks
│   ├── context/            # AuthContext, ThemeContext, AppProviders
│   ├── services/           # Cliente HTTP + servicios por dominio
│   ├── utils/              # Helpers (cn, formatters, validadores)
│   ├── routes/             # AppRouter, PrivateRoute (Hito 4)
│   ├── data/               # Mocks centralizados
│   ├── styles/             # globals.css con utilidades brutalistas
│   ├── test/               # Setup de Vitest
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json (+ app, node)
├── eslint.config.js
├── .env.example
└── package.json
```

---

## 🎨 Sistema de diseño (resumen)

El estilo es **brutalismo neo-suizo**: bordes 3-4px negros, sombras duras `8px 8px 0 0 #000`, tipografías **Inter** (400/700/900) + **Space Mono**, paleta `teal #2DD4BF`, `purple #A855F7`, `coral #FB7185`.

Las utilidades canónicas viven en `src/styles/globals.css` (capa `@layer components`):

- `.brutal-card`, `.brutal-card-sm`
- `.brutal-btn`, `.brutal-btn-{coral,purple,teal,black}`
- `.brutal-chip-{coral,purple,teal,black}`
- `.brutal-label`
- `.brutal-input`

Los tokens (colores, sombras, animaciones) están extendidos en `tailwind.config.ts`.

> Las carpetas `AURA AI - LandingPage/` y `AURA AI-Panel-Interior/` que verás en la raíz del repo son las **referencias visuales originales** (HTML estáticos + screenshots + DESIGN.md). No forman parte del bundle, pero son la fuente de verdad del diseño.

---

## 🔐 Variables de entorno

Definidas en `.env` (ver `.env.example`):

| Variable              | Descripción                                                 |
| --------------------- | ----------------------------------------------------------- |
| `VITE_API_BASE_URL`   | URL del backend Spring Boot. Vacía en Fase 1 (mocks).       |
| `VITE_DEV_MODE`       | Habilita banners y pantallas de debug.                      |
| `VITE_DEFAULT_LOCALE` | Idioma por defecto si el navegador no aporta uno soportado. |

---

## 🧭 Roadmap por hitos

- ✅ **Hito 1** — Cimientos (scaffolding + design tokens + tooling)
- ⏭ **Hito 2** — Sistema de diseño (componentes UI base + playground)
- ⏭ **Hito 3** — Landing pública (Hero, Pricing, Footer)
- ⏭ **Hito 4** — Auth simulada + DashboardLayout
- ⏭ **Hito 5** — Panel: Inicio, Pánico, Chatbot
- ⏭ **Hito 6** — Panel: Minijuegos, Sonidos, Diario, Mood Tracker
- ⏭ **Hito 7** — Contactos, Configuración, i18n, tests, Dockerfile

---

## 🐳 Deploy (próximos pasos)

El frontend está pensado para desplegarse vía Docker (multi-stage Node build → nginx alpine) en **Dokploy**, **Railway** u otra PaaS junto al backend Spring Boot. El `Dockerfile` se añade en el Hito 7.

`HashRouter` se usa por ahora para evitar configurar reescrituras de rutas en el proxy. Cuando se adopte nginx con su `try_files`, se puede migrar a `BrowserRouter` sin cambios de código de aplicación.

---

## 📝 Notas

- La app está preparada para conectarse al backend real **sin refactor**: todo HTTP pasa por `src/services/httpClient.ts`, que respeta `VITE_API_BASE_URL` y añade el bearer token desde `localStorage` (`aura.token`).
- El diario y los contactos persisten en `localStorage`. Es **información sensible** y no está cifrada — adecuado para una demo, no para producción.
- Los ambientes sonoros tienen UI funcional pero **sin audio real** en esta fase.
