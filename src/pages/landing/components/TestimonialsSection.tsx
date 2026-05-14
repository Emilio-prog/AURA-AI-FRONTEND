const testimonials = [
  {
    quote:
      'El botón SOS ha sido un salvavidas en mis momentos de mayor ansiedad. Saber que está ahí me da una paz inmensa.',
    author: '— Maria G.',
    color: 'text-brutal-teal',
  },
  {
    quote:
      'El diseño es tan suave y sin distracciones. Abro la app y automáticamente siento que mi ritmo cardíaco baja.',
    author: '— Carlos T.',
    color: 'text-brutal-purple',
  },
  {
    quote:
      'El diario y el mood tracker me han ayudado a identificar qué desencadena mis bajones. Es como tener un psicólogo de bolsillo.',
    author: '— Laura M.',
    color: 'text-brutal-coral',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="relative z-10 px-6 py-24">
      <div
        aria-hidden="true"
        className="glowing-orb"
        style={{ width: 200, height: 200, bottom: '10%', left: '5%', animationDelay: '2s' }}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="mb-4 font-mono text-sm font-bold uppercase">
            // EXPERIENCIAS REALES DE USUARIOS ACTIVOS
          </p>
          <h2 className="section-heading-mobile font-headline text-5xl font-black uppercase tracking-tighter">
            VOCES_COMUNIDAD
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, author, color }) => (
            <div
              key={author}
              className="flex flex-col justify-between border-4 border-brutal-black bg-white p-6 shadow-brutal-sm"
            >
              <div>
                <div
                  className="mb-4 flex gap-1 text-[#F59E0B]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                  aria-label="5 estrellas"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index} className="material-symbols-outlined">
                      star
                    </span>
                  ))}
                </div>
                <p className="mb-8 italic text-black">"{quote}"</p>
              </div>
              <p className={`font-mono font-bold uppercase ${color}`}>{author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
