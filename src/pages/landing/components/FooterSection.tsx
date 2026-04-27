const footerLinks = [
  { label: 'Privacidad_Data', href: '#' },
  { label: 'Términos_Legales', href: '#' },
  { label: 'Contacto_Soporte', href: '#' },
];

export function FooterSection() {
  return (
    <footer className="relative z-10 border-t-4 border-brutal-black bg-brutal-black px-8 py-16 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 font-mono md:grid-cols-3">
        {/* Brand */}
        <div>
          <div className="mb-4 font-headline text-4xl font-black uppercase tracking-tighter">
            Aura AI
          </div>
          <p className="text-[10px] font-bold uppercase text-white/40">MANIFESTO_BRUTALISTA_V2.0</p>
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-4 font-bold uppercase">
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm text-white/70 transition-colors hover:text-brutal-teal"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-xs font-black uppercase leading-relaxed text-white/50 md:text-right">
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
