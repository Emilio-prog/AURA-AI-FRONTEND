export function ModulesSection() {
  return (
    <section id="funcionalidades" className="relative z-10 overflow-x-hidden px-4 py-24 md:px-6">
      <div className="mx-auto max-w-7xl">
        <h2 className="section-heading-mobile mb-12 break-words font-headline text-[clamp(1.2rem,8vw,2.5rem)] font-black uppercase tracking-tighter">
          MÓDULOS_
          <br className="md:hidden" />
          OPERATIVOS
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="flex flex-col justify-between border-4 border-brutal-black bg-brutal-coral/20 p-6 shadow-brutal backdrop-blur-sm md:col-span-8">
            <div>
              <span className="material-symbols-outlined mb-4 block text-5xl">emergency</span>
              <h3 className="mb-4 text-3xl font-black uppercase">Botón de Pánico SOS</h3>
              <p className="font-mono text-sm font-bold uppercase">
                PROTOCOLO DE ENRAIZAMIENTO ACTIVADO CON UN CLIC. SIN DEMORAS.
              </p>
            </div>
            <div className="mt-8 border-4 border-brutal-black bg-brutal-coral p-2 text-center font-mono font-bold uppercase">
              NIVEL_URGENCIA_ALTO
            </div>
          </div>

          <div className="border-4 border-brutal-black bg-brutal-purple/20 p-6 shadow-brutal-sm backdrop-blur-sm md:col-span-4">
            <span className="material-symbols-outlined mb-4 block text-4xl">smart_toy</span>
            <h3 className="mb-2 text-2xl font-black uppercase">Chatbot IA</h3>
            <p className="font-mono text-xs uppercase">
              ANÁLISIS EMPÁTICO SIN FILTROS. PROCESAMIENTO 24/7.
            </p>
          </div>

          <div className="border-4 border-brutal-black bg-brutal-teal/20 p-6 shadow-brutal-sm backdrop-blur-sm md:col-span-4">
            <span className="material-symbols-outlined mb-4 block text-4xl">mood</span>
            <h3 className="mb-2 text-2xl font-black uppercase">Mood Tracker</h3>
            <p className="font-mono text-xs uppercase">LOG_DIARIO_ESTADO_EMOCIONAL. SIN JUICIOS.</p>
          </div>

          <div className="flex min-h-[200px] flex-col items-center justify-center border-4 border-brutal-black bg-white/80 p-6 text-center shadow-brutal-sm backdrop-blur-sm dark:bg-zinc-900/90 md:col-span-4">
            <svg
              className="mb-4"
              fill="none"
              height="48"
              stroke="#00E5CC"
              strokeLinecap="round"
              strokeWidth="3"
              viewBox="0 0 24 24"
              width="48"
              aria-hidden="true"
            >
              <line x1="4" x2="4" y1="14" y2="10" />
              <line x1="8" x2="8" y1="18" y2="6" />
              <line x1="12" x2="12" y1="15" y2="9" />
              <line x1="16" x2="16" y1="20" y2="4" />
              <line x1="20" x2="20" y1="14" y2="10" />
            </svg>
            <h3 className="mb-2 text-3xl font-black uppercase text-brutal-teal">AUDIO_DATA</h3>
            <p className="font-mono text-xs font-bold uppercase text-black dark:text-white">
              MODULACIÓN DE FRECUENCIAS CEREBRALES VÍA BINAURAL.
            </p>
          </div>

          <div className="border-4 border-dashed border-brutal-black bg-white/60 p-6 shadow-brutal-sm backdrop-blur-sm dark:bg-zinc-900/70 md:col-span-4">
            <span className="material-symbols-outlined mb-4 block text-4xl">videogame_asset</span>
            <h3 className="mb-2 text-2xl font-black uppercase">Minijuegos</h3>
            <p className="font-mono text-xs uppercase">
              DISTRACCIÓN COGNITIVA CONTROLADA PARA CICLOS DE RUMIACIÓN.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
