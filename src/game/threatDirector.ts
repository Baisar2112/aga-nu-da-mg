import type { AnimatronicName, AnimatronicState, GameState } from './types';

const RESPONSE_SECONDS = 1;
const DANGEROUS_MODES = new Set<AnimatronicState['mode']>(['door', 'window', 'running']);

/** Pauses later threats and gives each one second when it becomes first in line. */
export function applyThreatDirector(state: GameState): AnimatronicName | null {
  const threats = Object.values(state.animatronics)
    .filter((anim) => DANGEROUS_MODES.has(anim.mode))
    .sort((first, second) => first.arrival - second.arrival);

  let released: AnimatronicName | null = null;
  threats.forEach((anim, index) => {
    if (index > 0) {
      anim.heldByDirector = true;
      return;
    }
    if (anim.heldByDirector) {
      anim.heldByDirector = false;
      anim.timer = RESPONSE_SECONDS;
      released = anim.name;
    }
  });
  return released;
}
