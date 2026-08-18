import type { AnimatronicName, AnimatronicState, GameState } from './types';

const DANGEROUS_MODES = new Set<AnimatronicState['mode']>(['door', 'window', 'running']);

const isThreat = (anim: AnimatronicState) => DANGEROUS_MODES.has(anim.mode)
  || (anim.name === 'fox' && anim.mode === 'moving');

/** Pauses later threats without changing their remaining attack time. */
export function applyThreatDirector(state: GameState): AnimatronicName | null {
  const threats = Object.values(state.animatronics)
    .filter(isThreat)
    .sort((first, second) => {
      if (first.name === 'fox') return -1;
      if (second.name === 'fox') return 1;
      return first.arrival - second.arrival;
    });

  let released: AnimatronicName | null = null;
  threats.forEach((anim, index) => {
    if (index > 0) {
      anim.heldByDirector = true;
      return;
    }
    if (anim.heldByDirector) {
      anim.heldByDirector = false;
      released = anim.name;
    }
  });
  return released;
}
