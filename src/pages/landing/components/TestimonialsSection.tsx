import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  accentColor: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'El botón SOS ha sido un salvavidas en mis momentos de mayor ansiedad. Saber que está ahí me da una paz inmensa.',
    author: '— Maria G.',
    accentColor: 'text-brutal-teal',
  },
  {
    quote:
      'El diseño es tan directo y sin ruido. Abro la app y automáticamente siento que mi ritmo cardíaco baja.',
    author: '— Carlos T.',
    accentColor: 'text-brutal-purple',
  },
  {
    quote:
      'El diario y el mood tracker me han ayudado a identificar qué desencadena mis bajones. Es como tener un psicólogo de bolsillo.',
    author: '— Laura M.',
    accentColor: 'text-brutal-coral',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="relative z-10 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="mb-4 font-mono text-xs font-bold uppercase">
            // EXPERIENCIAS REALES DE USUARIOS ACTIVOS
          </p>
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter lg:text-5xl">
            VOCES_COMUNIDAD
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, author, accentColor }) => (
            <div
              key={author}
              className="flex flex-col justify-between border-4 border-brutal-black bg-brutal-black p-6 text-white shadow-brutal-sm transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <div>
                {/* Stars */}
                <div className="mb-4 flex gap-1 text-yellow-400" aria-label="5 estrellas">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mb-8 text-base italic leading-relaxed text-white">{`"${quote}"`}</p>
              </div>
              <p className={`font-mono text-xs font-bold uppercase ${accentColor}`}>{author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
