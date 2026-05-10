import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PrivateRoute() {
  const { user, isAuthenticated, isHydrating } = useAuth();
  const location = useLocation();

  if (isHydrating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-mono text-xs font-bold uppercase tracking-widest text-ink-muted">
        CARGANDO_SESIÓN...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (location.pathname.startsWith('/dashboard') && user?.onboardedAt === null) {
    return <Navigate to="/onboarding" replace />;
  }

  if (location.pathname === '/onboarding' && user?.onboardedAt !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
