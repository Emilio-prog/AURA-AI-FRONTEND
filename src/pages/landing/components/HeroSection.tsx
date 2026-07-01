import { Link } from 'react-router-dom';
import heroMeditationImage from '@/assets/landing/imagenYoga.png';

export function HeroSection() {
  return (
    <section className="relative px-6 pb-20 ls:pb-8 pt-40 ls:pt-16 lg:min-h-[calc(100vh-5rem)] lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 ls:grid-cols-2 ls:gap-6 lg:grid-cols-2">
        <div className="z-10 min-w-0">
          <div className="mb-6 ls:mb-2 inline-block bg-black px-3 py-1 font-mono text-xs text-white dark:border-2 dark:border-brutal-black dark:bg-brutal-purple dark:text-white dark:shadow-brutal-sm">
            STATUS: ONLINE_SECURE_ZONE
          </div>

          <h1 className="mb-8 ls:mb-3 max-w-full font-headline text-[clamp(2.65rem,11vw,4.7rem)] ls:text-[clamp(1.6rem,5vh,2.5rem)] font-black uppercase leading-[0.92] tracking-tighter text-black dark:text-white sm:text-6xl lg:text-8xl">
            BIENESTAR <br />
            <span className="bg-black px-2 text-white dark:bg-white dark:text-[#111111]">MENTAL</span> <br />
            <span className="sm:hidden">
              PARA
              <br />
              TODOS
            </span>
            <span className="hidden sm:inline">PARA TODOS</span>
          </h1>

          <p className="mb-10 ls:mb-4 max-w-[31ch] break-words border-l-8 ls:border-l-4 border-black pl-6 ls:pl-3 font-mono text-sm ls:text-xs font-bold uppercase leading-6 ls:leading-5 text-black dark:border-white dark:text-zinc-100 sm:max-w-lg sm:text-xl sm:leading-7">
            Aura AI es tu compañero 24/7. Sin adornos. Sin distracciones. Solo herramientas de
            contención pura.
          </p>

          <div className="flex flex-col gap-6 ls:flex-row ls:gap-3 sm:flex-row">
            <Link
              to="/register"
              className="border-4 border-brutal-black bg-brutal-purple px-10 py-5 ls:px-6 ls:py-3 text-center text-xl ls:text-base font-bold uppercase tracking-tighter text-white shadow-brutal transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              COMIENZA AHORA
            </Link>
            <Link
              to="/login"
              className="border-4 border-brutal-black bg-white px-10 py-5 ls:px-6 ls:py-3 text-center text-xl ls:text-base font-bold uppercase tracking-tighter text-black shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none dark:bg-brutal-coral dark:text-white"
            >
              VER DEMO_
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="border-4 border-brutal-black bg-black shadow-brutal dark:shadow-[12px_12px_0_#000]">
            <img
              src={heroMeditationImage}
              alt="Woman meditating"
              className="aspect-[16/9] w-full object-cover contrast-125 grayscale lg:aspect-[4/3]"
              decoding="async"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 border-4 border-brutal-black bg-brutal-teal p-4 font-mono text-sm font-black uppercase text-black shadow-brutal-sm">
            CALMA_INMEDIATA
          </div>
        </div>
      </div>
    </section>
  );
}
