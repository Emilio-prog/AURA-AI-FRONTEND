import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { DevPlayground } from '@/pages/DevPlayground';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { AuraPanelPage } from '@/pages/dashboard/AuraPanelPage';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Auth: solo accesibles si NO hay sesión */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Dashboard: solo accesible CON sesión */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard/*" element={<AuraPanelPage />} />
        </Route>

        {/* Playground del sistema de diseño — solo en desarrollo */}
        {import.meta.env.DEV && <Route path="/playground" element={<DevPlayground />} />}

        {/* Fallback → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
