const stats = [
  { value: '12K+', label: 'USUARIOS_ACTIVOS', color: 'text-brutal-teal' },
  { value: '94%', label: 'EFICIENCIA_ANSIEDAD', color: 'text-brutal-purple' },
  { value: '4.9★', label: 'RATING_CRÍTICO', color: 'text-brutal-coral' },
  { value: '24/7', label: 'SUPPORT_ENGINE', color: 'text-white' },
];

// Duplicamos para el loop infinito del marquee
const doubled = [...stats, ...stats];

export function StatsMarquee() {
  return (
    <section
      className="relative z-10 overflow-hidden border-y-4 border-brutal-black bg-brutal-black py-12 text-white"
      aria-label="Estadísticas de AURA IA"
    >
      <div className="flex w-max animate-marquee items-center gap-0">
        {doubled.map(({ value, label, color }, i) => (
          <div
            key={i}
            className="flex shrink-0 flex-col items-center border-r border-white/20 px-16"
          >
            <span className="font-headline text-6xl font-black leading-none">{value}</span>
            <span className={`mt-1 font-mono text-xs font-bold uppercase tracking-widest ${color}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
