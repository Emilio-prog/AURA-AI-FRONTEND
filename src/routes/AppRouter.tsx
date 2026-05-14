import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';

const LandingPage = lazy(() => import('@/pages/landing/LandingPage').then((module) => ({ default: module.LandingPage })));
const DevPlayground = lazy(() => import('@/pages/DevPlayground').then((module) => ({ default: module.DevPlayground })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })),
);
const VerifyEmailPage = lazy(() =>
  import('@/pages/auth/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })),
);
const GoogleOAuthCallbackPage = lazy(() =>
  import('@/pages/auth/GoogleOAuthCallbackPage').then((module) => ({ default: module.GoogleOAuthCallbackPage })),
);
const OnboardingPage = lazy(() =>
  import('@/pages/onboarding/OnboardingPage').then((module) => ({ default: module.OnboardingPage })),
);
const AuraPanelPage = lazy(() =>
  import('@/pages/dashboard/AuraPanelPage').then((module) => ({ default: module.AuraPanelPage })),
);
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage').then((module) => ({ default: module.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage').then((module) => ({ default: module.TermsPage })));
const EmergencyPage = lazy(() =>
  import('@/pages/emergency/EmergencyPage').then((module) => ({ default: module.EmergencyPage })),
);

function RouteFallback() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] p-6 font-mono text-sm font-black uppercase text-black">
      CARGANDO_AURA...
    </main>
  );
}

export function AppRouter() {
  return (
    <HashRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/emergencia" element={<EmergencyPage />} />
          <Route path="/auth/google/callback" element={<GoogleOAuthCallbackPage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard/*" element={<AuraPanelPage />} />
          </Route>

          {import.meta.env.DEV && <Route path="/playground" element={<DevPlayground />} />}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
