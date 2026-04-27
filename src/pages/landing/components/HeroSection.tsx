import { Button } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative px-6 pb-20 pt-40 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left — copy */}
        <div className="z-10">
          <div className="mb-6 inline-block bg-brutal-black px-3 py-1 font-mono text-xs font-bold uppercase text-white">
            STATUS: ONLINE_SECURE_ZONE
          </div>

          <h1 className="mb-8 font-headline text-6xl font-black uppercase leading-[0.9] tracking-tighter lg:text-8xl">
            BIENESTAR <br />
            <span className="bg-brutal-black px-2 text-white">MENTAL</span>
            <br />
            PARA TODOS
          </h1>

          <p className="mb-10 max-w-lg border-l-8 border-brutal-black pl-6 font-mono text-base font-bold uppercase lg:text-xl">
            Aura AI es tu compañero 24/7. Sin adornos. Sin distracciones. Solo herramientas de
            contención pura.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            <Button variant="purple" size="lg" className="text-base sm:text-xl">
              COMIENZA AHORA
            </Button>
            <Button variant="white" size="lg" className="text-base sm:text-xl">
              VER DEMO_
            </Button>
          </div>
        </div>

        {/* Right — illustration */}
        <div className="relative">
          <div className="relative border-4 border-brutal-black bg-brutal-black shadow-brutal">
            {/* Brutalist meditation illustration */}
            <div className="aspect-square w-full overflow-hidden">
              <svg
                viewBox="0 0 400 400"
                className="h-full w-full"
                aria-label="Ilustración abstracta de meditación y calma"
              >
                {/* Background */}
                <rect width="400" height="400" fill="#0a0a0a" />

                {/* Atmospheric gradient circles */}
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1"
                  opacity="0.2"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="155"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="1"
                  opacity="0.25"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="120"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <circle
                  cx="200"
                  cy="200"
                  r="85"
                  fill="none"
                  stroke="#2DD4BF"
                  strokeWidth="2"
                  opacity="0.35"
                />

                {/* Glow center */}
                <circle cx="200" cy="200" r="55" fill="#A855F7" opacity="0.08" />

                {/* Person silhouette — simplified meditation pose */}
                {/* Head */}
                <ellipse cx="200" cy="148" rx="22" ry="24" fill="white" opacity="0.85" />
                {/* Torso */}
                <path
                  d="M172 190 Q172 255 200 262 Q228 255 228 190 Q214 172 200 172 Q186 172 172 190Z"
                  fill="white"
                  opacity="0.75"
                />
                {/* Left arm/leg */}
                <path
                  d="M172 200 Q145 220 138 250 Q150 258 160 248 Q168 225 178 210Z"
                  fill="white"
                  opacity="0.6"
                />
                {/* Right arm/leg */}
                <path
                  d="M228 200 Q255 220 262 250 Q250 258 240 248 Q232 225 222 210Z"
                  fill="white"
                  opacity="0.6"
                />
                {/* Hands resting */}
                <ellipse cx="149" cy="254" rx="12" ry="8" fill="white" opacity="0.55" />
                <ellipse cx="251" cy="254" rx="12" ry="8" fill="white" opacity="0.55" />

                {/* Decorative lines — data/signal aesthetic */}
                <line
                  x1="30"
                  y1="200"
                  x2="100"
                  y2="200"
                  stroke="#2DD4BF"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="300"
                  y1="200"
                  x2="370"
                  y2="200"
                  stroke="#2DD4BF"
                  strokeWidth="2"
                  opacity="0.5"
                />
                <line
                  x1="200"
                  y1="30"
                  x2="200"
                  y2="80"
                  stroke="#A855F7"
                  strokeWidth="2"
                  opacity="0.4"
                />

                {/* Corner labels */}
                <text
                  x="20"
                  y="380"
                  fontFamily="Space Mono, monospace"
                  fontSize="8"
                  fill="#555"
                  opacity="0.8"
                >
                  ZONA_SEGURA_DIGITAL
                </text>
                <text
                  x="280"
                  y="30"
                  fontFamily="Space Mono, monospace"
                  fontSize="8"
                  fill="#2DD4BF"
                  opacity="0.7"
                >
                  AURA_IA_v2
                </text>
              </svg>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-6 -left-6 border-4 border-brutal-black bg-brutal-teal px-4 py-3 shadow-brutal-sm">
            <span className="font-mono text-sm font-black uppercase">CALMA_INMEDIATA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
