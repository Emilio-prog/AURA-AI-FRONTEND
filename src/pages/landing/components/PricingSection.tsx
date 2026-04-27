const plans = [
  {
    name: 'Gratis',
    price: '0€',
    id: 'ID: ACCESO_BÁSICO_LIMITADO',
    features: ['Botón SOS Básico', 'Diario simple', '3 Ambientes sonoros'],
    cta: 'ACTIVAR_LICENCIA',
    headerClassName: 'bg-brutal-teal text-black',
    className: 'bg-white/80 backdrop-blur-md border-4 border-brutal-black p-8 flex flex-col h-full',
    buttonClassName: 'bg-brutal-teal text-black',
    checkClassName: 'text-brutal-teal',
  },
  {
    name: 'Personal',
    price: '6€',
    id: 'ID: EQUILIBRIO_OPTIMIZADO',
    features: [
      'Todo lo de Gratis',
      'Chatbot con IA (Ilimitado)',
      'Insights de Mood Tracker',
      'Todos los minijuegos',
    ],
    cta: 'EJECUTAR_PLAN',
    headerClassName: 'bg-brutal-purple text-white',
    className:
      'relative z-10 flex h-full -translate-y-4 flex-col border-4 border-l-0 border-brutal-black bg-white/90 p-8 shadow-brutal backdrop-blur-md md:border-l-4',
    buttonClassName: 'bg-brutal-purple text-white',
    checkClassName: 'text-brutal-purple',
    popular: true,
  },
  {
    name: 'Premium',
    price: '12€',
    id: 'ID: CUIDADO_PROFUNDO_MAX',
    features: [
      'Todo lo de Personal',
      'Sesiones de audio guiadas',
      'Red de contactos ilimitada',
      'Reportes exportables',
    ],
    cta: 'UPGRADE_FULL',
    headerClassName: 'bg-brutal-coral text-white',
    className:
      'flex h-full flex-col border-4 border-l-0 border-brutal-black bg-white/80 p-8 backdrop-blur-md',
    buttonClassName: 'bg-brutal-coral text-white',
    checkClassName: 'text-brutal-coral',
  },
];

export function PricingSection() {
  return (
    <section className="relative z-10 max-w-full overflow-x-hidden px-6 py-24" id="precios">
      <div
        aria-hidden="true"
        className="glowing-orb"
        style={{ width: 300, height: 300, top: '30%', right: '-5%', animationDelay: '4s' }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="section-heading-mobile mb-4 font-headline text-5xl font-black uppercase tracking-tighter">
            ADQUISICIÓN_DE_PLANES
          </h2>
          <p className="font-mono font-bold uppercase">SELECCIONE NIVEL DE ACCESO REQUERIDO</p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 font-mono md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={plan.className}>
              {plan.popular && (
                <div className="absolute -top-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 border-4 border-brutal-black bg-white px-4 py-1 text-xs font-black uppercase">
                  ★ MÁS POPULAR
                </div>
              )}

              <div
                className={`mb-6 border-4 border-brutal-black p-2 text-center text-xl font-black uppercase ${plan.headerClassName}`}
              >
                {plan.name}
              </div>

              <div className="mb-6">
                <span className="text-6xl font-black">{plan.price}</span>
                <span className="text-xs font-bold uppercase">/UNIDAD_TIEMPO</span>
              </div>

              <p className="mb-8 border-b-2 border-black pb-4 text-xs font-bold uppercase">
                {plan.id}
              </p>

              <ul className="mb-auto space-y-4 text-sm font-bold uppercase">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className={`material-symbols-outlined ${plan.checkClassName}`}>
                      check
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-12 w-full border-4 border-brutal-black px-6 py-3 font-bold uppercase tracking-tighter shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${plan.buttonClassName}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
