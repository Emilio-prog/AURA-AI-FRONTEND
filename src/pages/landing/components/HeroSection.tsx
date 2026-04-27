import { Link } from 'react-router-dom';
import heroMeditationImage from '@/assets/landing/imagenYoga.png';

export function HeroSection() {
  return (
    <section className="relative px-6 pb-20 pt-40 lg:px-8">
      <div
        aria-hidden="true"
        className="glowing-orb"
        style={{ width: 250, height: 250, top: '10%', right: '5%', animationDelay: '0s' }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="z-10">
          <div className="mb-6 inline-block bg-black px-3 py-1 font-mono text-xs text-white">
            STATUS: ONLINE_SECURE_ZONE
          </div>

          <h1 className="mb-8 font-headline text-6xl font-black uppercase leading-[0.9] tracking-tighter lg:text-8xl">
            BIENESTAR <br />
            <span className="bg-black px-2 text-white">MENTAL</span> <br />
            PARA TODOS
          </h1>

          <p className="mb-10 max-w-lg border-l-8 border-black pl-6 font-mono text-xl font-bold uppercase">
            Aura AI es tu compañero 24/7. Sin adornos. Sin distracciones. Solo herramientas de
            contención pura.
          </p>

          <div className="flex flex-col gap-6 sm:flex-row">
            <Link
              to="/register"
              className="border-4 border-brutal-black bg-brutal-purple px-10 py-5 text-center text-xl font-bold uppercase tracking-tighter text-white shadow-brutal transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              COMIENZA AHORA
            </Link>
            <Link
              to="/login"
              className="border-4 border-brutal-black bg-white px-10 py-5 text-center text-xl font-bold uppercase tracking-tighter text-black shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              VER DEMO_
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="border-4 border-brutal-black bg-black shadow-brutal">
            <img
              src={heroMeditationImage}
              alt="Woman meditating"
              className="aspect-square w-full object-cover contrast-125 grayscale"
              decoding="async"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 border-4 border-brutal-black bg-brutal-teal p-4 font-mono text-sm font-black uppercase shadow-brutal-sm">
            CALMA_INMEDIATA
          </div>
        </div>
      </div>
    </section>
  );
}
