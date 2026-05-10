import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/landing/LandingPage';
import { DevPlayground } from '@/pages/DevPlayground';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { AuraPanelPage } from '@/pages/dashboard/AuraPanelPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { TermsPage } from '@/pages/legal/TermsPage';
import { EmergencyPage } from '@/pages/emergency/EmergencyPage';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

export function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Legal y emergencia: accesibles siempre (con o sin sesión) */}
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/emergencia" element={<EmergencyPage />} />

        {/* Auth: solo accesibles si NO hay sesión */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Dashboard: solo accesible CON sesión */}
        <Route element={<PrivateRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
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
