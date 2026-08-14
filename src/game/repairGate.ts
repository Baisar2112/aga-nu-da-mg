import { FIRST_PHASE_SECONDS } from './constants';
import type { AnimatronicState, GameState } from './types';

const REPAIRED_WIRES_TO_RELEASE = 3;
const RELEASE_ATTACK_SECONDS = 6;
const DOOR_DESTINATIONS = new Set(['left', 'right', 'run']);
const DOOR_THREAT_MODES = new Set<AnimatronicState['mode']>(['door', 'running']);

function gateIsClosed(state: GameState) {
  return state.elapsed < FIRST_PHASE_SECONDS
    && state.problems.outageActive
    && state.wiresFixed.length < REPAIRED_WIRES_TO_RELEASE;
}

export function shouldWaitBeforeDoor(anim: AnimatronicState, state: GameState) {
  const destination = anim.route[anim.routeIndex + 1];
  return gateIsClosed(state) && DOOR_DESTINATIONS.has(destination);
}

export function applyRepairGate(state: GameState) {
  const closed = gateIsClosed(state);
  Object.values(state.animatronics).forEach((anim) => {
    if (!DOOR_THREAT_MODES.has(anim.mode)) return;
    if (closed) anim.heldByRepair = true;
    else if (anim.heldByRepair) {
      anim.heldByRepair = false;
      anim.timer = RELEASE_ATTACK_SECONDS;
    }
  });
}

export function isHeldByRepair(anim: AnimatronicState, state: GameState) {
  return anim.heldByRepair && gateIsClosed(state);
}

export function consumeRepairAttackTimer(anim: AnimatronicState, normalSeconds: number) {
  if (!anim.heldByRepair) return normalSeconds;
  anim.heldByRepair = false;
  return RELEASE_ATTACK_SECONDS;
}
