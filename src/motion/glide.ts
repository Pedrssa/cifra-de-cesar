export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Duração proporcional à distância: controles rápidos, demonstrações até 700 ms. */
export function durationForSteps(steps: number): number {
  return Math.min(700, Math.max(220, 240 + Math.abs(steps) * 26));
}

interface GlideOptions {
  /** Ponto de partida explícito; sem ele, parte da posição visual atual. */
  from?: string;
  duration: number;
  reduced: boolean;
}

/**
 * Leva `el` até `to` redirecionando qualquer movimento em curso: lê a posição
 * visual atual, cancela a animação anterior e parte dali. Nunca enfileira.
 * O estilo final é aplicado antes de animar, então o estado correto vale
 * mesmo que a animação seja cancelada ou o movimento esteja reduzido.
 */
export function glide(el: HTMLElement, to: string, { from, duration, reduced }: GlideOptions): void {
  const current = from ?? getComputedStyle(el).transform;
  for (const a of el.getAnimations()) a.cancel();
  el.style.transform = to;
  if (reduced || duration <= 0 || typeof el.animate !== 'function') return;
  el.animate([{ transform: current === 'none' ? 'none' : current }, { transform: to }], {
    duration,
    easing: EASE_OUT,
  });
}
