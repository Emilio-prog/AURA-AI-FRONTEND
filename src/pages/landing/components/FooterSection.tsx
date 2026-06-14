import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Privacidad_Data', to: '/privacy' },
  { label: 'Términos_Legales', to: '/terms' },
  { label: 'Politica_Cookies', to: '/cookies' },
  { label: 'Contacto_Soporte', to: '/terms#12' },
];

export function FooterSection() {
  return (
    <footer className="relative z-10 border-t-4 border-brutal-black bg-black px-8 py-16 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 font-mono md:grid-cols-3">
        <div>
          <div className="mb-4 text-4xl font-black uppercase tracking-tighter">Aura AI</div>
          <p className="text-xs font-bold uppercase text-gray-400">MANIFESTO_BRUTALISTA_V1.0</p>
        </div>

        <div className="flex flex-col gap-4 font-bold uppercase">
          {footerLinks.map(({ label, to }) => (
            <Link key={label} className="hover:text-brutal-teal" to={to}>
              {label}
            </Link>
          ))}
        </div>

        <div className="font-black uppercase md:text-right">
          © 2026 Aura AI.
          <br />
          REFUGIO_DIGITAL_TOTAL.
          <br />
          SISTEMA_OPERATIVO.
        </div>
      </div>
    </footer>
  );
}
