import { useEffect } from 'react';
import Lenis from 'lenis';
import { BlobsBackground, CrisisFab } from '@/components/ui';
import { LandingNavbar } from './components/LandingNavbar';
import { HeroSection } from './components/HeroSection';
import { StatsMarquee } from './components/StatsMarquee';
import { ModulesSection } from './components/ModulesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { FooterSection } from './components/FooterSection';

export function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="landing-page relative min-h-screen bg-white font-sans text-ink antialiased transition-colors dark:bg-zinc-950 dark:text-white">
      <BlobsBackground />
      <LandingNavbar />
      <main>
        <HeroSection />
        <StatsMarquee />
        <ModulesSection />
        <TestimonialsSection />
        <PricingSection />
      </main>
      <FooterSection />
      <CrisisFab />
    </div>
  );
}
