import type Lenis from 'lenis';

let _lenis: Lenis | null = null;

export function registerLenis(lenis: Lenis): void {
  _lenis = lenis;
}

export function unregisterLenis(): void {
  _lenis = null;
}

/**
 * Scroll suave a un target usando Lenis cuando está disponible,
 * con fallback a scrollIntoView nativo.
 * @param target  Selector CSS, elemento o posición numérica (px desde el top)
 * @param offset  Desplazamiento vertical extra (negativo = sube, p.ej. -80 para navbar fija)
 */
export function smoothScrollTo(
  target: string | number | HTMLElement,
  offset = 0,
): void {
  if (_lenis) {
    _lenis.scrollTo(target as string & HTMLElement & number, { offset });
    return;
  }
  // Fallback sin Lenis
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  } else {
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
