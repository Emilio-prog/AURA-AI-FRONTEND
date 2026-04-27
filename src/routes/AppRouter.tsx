import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { DevPlayground } from '@/pages/DevPlayground';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  DashboardHome,
  SOSPage,
  ChatbotPage,
  MoodTrackerPage,
  MinigamesPage,
  SoundscapesPage,
  DiaryPage,
  ContactsPage,
  SettingsPage,
} from '@/pages/dashboard';
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
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="sos" element={<SOSPage />} />
            <Route path="chatbot" element={<ChatbotPage />} />
            <Route path="mood" element={<MoodTrackerPage />} />
            <Route path="juegos" element={<MinigamesPage />} />
            <Route path="sonidos" element={<SoundscapesPage />} />
            <Route path="diario" element={<DiaryPage />} />
            <Route path="contactos" element={<ContactsPage />} />
            <Route path="config" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Playground del sistema de diseño — solo en desarrollo */}
        {import.meta.env.DEV && <Route path="/playground" element={<DevPlayground />} />}

        {/* Fallback → landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
