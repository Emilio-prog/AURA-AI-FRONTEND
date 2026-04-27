import { HashRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { DevPlayground } from '@/pages/DevPlayground';

/**
 * Router principal de la aplicación (HashRouter para compatibilidad con cualquier PaaS
 * sin reescritura de rutas en servidor).
 *
 * Hito 4 añadirá: /login, /register, /forgot-password, /dashboard/*
 */
export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Playground del sistema de diseño — solo en desarrollo */}
        {import.meta.env.DEV && <Route path="/playground" element={<DevPlayground />} />}

        {/* Fallback → landing mientras no haya 404 page */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </HashRouter>
  );
}
