const stats = [
  { value: '12K+', label: 'USUARIOS_ACTIVOS', color: 'text-brutal-teal' },
  { value: '94%', label: 'EFICIENCIA_ANSIEDAD', color: 'text-brutal-purple' },
  { value: '4.9★', label: 'RATING_CRÍTICO', color: 'text-brutal-coral' },
  { value: '24/7', label: 'SUPPORT_ENGINE', color: 'text-white' },
];

const tickerItems = [...stats, ...stats];

export function StatsMarquee() {
  return (
    <section className="relative z-10 bg-black py-12 text-white" aria-label="Estadísticas">
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="landing-ticker-container font-mono">
            {tickerItems.map(({ value, label, color }, index) => (
              <div key={`${label}-${index}`} className="landing-ticker-item">
                <span className="text-6xl font-black">{value}</span>
                <span className={color}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
