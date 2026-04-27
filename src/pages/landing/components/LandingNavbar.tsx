const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Testimonios', href: '#testimonios' },
];

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b-4 border-brutal-black bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-3 no-underline" aria-label="Aura AI inicio">
          <div className="h-10 w-10 border-[6px] border-brutal-black bg-gradient-to-tr from-brutal-purple to-brutal-teal" />
          <div className="font-headline text-3xl font-black uppercase tracking-tighter">
            Aura <span className="text-brutal-purple">AI</span>
          </div>
        </a>

        <div className="hidden items-center gap-8 font-mono text-sm font-bold uppercase md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={label} className="decoration-4 underline-offset-4 hover:underline" href={href}>
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="font-mono text-sm font-bold uppercase hover:underline">Log_In</button>
          <button className="border-4 border-brutal-black bg-brutal-teal px-6 py-3 font-bold uppercase tracking-tighter text-black shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none">
            START_FREE
          </button>
        </div>
      </div>
    </nav>
  );
}
