import { AppProviders } from '@/context/AppProviders';
import { WelcomePage } from '@/pages/WelcomePage';

export default function App() {
  return (
    <AppProviders>
      <WelcomePage />
    </AppProviders>
  );
}
