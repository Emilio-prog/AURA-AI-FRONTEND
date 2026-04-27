import { AppProviders } from '@/context/AppProviders';
import { WelcomePage } from '@/pages/WelcomePage';
import { DevPlayground } from '@/pages/DevPlayground';

// En desarrollo, ?playground en la URL muestra el playground de componentes.
// En producción siempre muestra la app real (Hito 3+ pondrá el router aquí).
const showPlayground =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('playground');

export default function App() {
  return <AppProviders>{showPlayground ? <DevPlayground /> : <WelcomePage />}</AppProviders>;
}
