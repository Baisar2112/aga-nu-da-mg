import type { GameState } from '../game/types';
import { clockMinutesToElapsed, createInitialState, FIRST_PHASE_SECONDS } from '../game/constants';
import { loadDeveloperConfig } from './developerConfig';

const SAVE_KEY = 'last-night-at-freddy.phase-save.v1';
const COMPLETED_KEY = 'last-night-at-freddy.completed.v1';
export const PHASE_LENGTH = FIRST_PHASE_SECONDS;

export type SaveStatus = 'empty' | 'checkpoint' | 'completed';

export function getSaveStatus(): SaveStatus {
  if (localStorage.getItem(COMPLETED_KEY) === 'true') return 'completed';
  return localStorage.getItem(SAVE_KEY) ? 'checkpoint' : 'empty';
}

export function loadCheckpoint(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as GameState;
    const fallback = createInitialState(loadDeveloperConfig() ?? undefined);
    saved.rules ??= structuredClone(fallback.rules);
    if (saved.timeLayoutVersion !== 2) {
      if (saved.elapsed === 0) return fallback;
      migrateLegacyGameTime(saved);
    }
    if (saved.cameraLayoutVersion !== 2) {
      saved.selectedCamera = swapCameraOneAndSeven(saved.selectedCamera);
      Object.values(saved.animatronics).forEach((animatronic) => {
        animatronic.route = animatronic.route.map((spot) => swapCameraOneAndSeven(spot));
      });
      saved.cameraLayoutVersion = 2;
    }
    return {
      ...saved,
      rules: saved.rules ?? fallback.rules,
      hasFlashlight: saved.hasFlashlight ?? saved.hasTape ?? false,
      computer: saved.computer === 'ON' || saved.computer === 'WORKING' ? 'OFF' : saved.computer,
      leftDoor: { ...saved.leftDoor, blocked: saved.leftDoor.blocked ?? false },
      rightDoor: { ...saved.rightDoor, blocked: saved.rightDoor.blocked ?? false },
    };
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

function migrateLegacyGameTime(state: GameState) {
  const convert = (seconds: number) => clockMinutesToElapsed(seconds * 360 / 480);
  const convertTimestamp = (seconds: number) => seconds >= 900 ? seconds : convert(seconds);
  state.elapsed = convert(state.elapsed);
  Object.values(state.rules.animatronics).forEach((rule) => { rule.spawnTime = convert(rule.spawnTime); });
  Object.values(state.rules.problems).forEach((rule) => { rule.at = convert(rule.at); });
  state.problems.outageAt = convertTimestamp(state.problems.outageAt);
  state.problems.staticAt = convertTimestamp(state.problems.staticAt);
  state.problems.rageAt = convertTimestamp(state.problems.rageAt);
  Object.values(state.animatronics).forEach((animatronic) => {
    if (animatronic.arrival > 0) animatronic.arrival = convert(animatronic.arrival);
  });
  state.timeLayoutVersion = 2;
}

function swapCameraOneAndSeven<T extends number | string>(camera: T): T {
  if (camera === 1 || camera === '1') return (typeof camera === 'number' ? 7 : '7') as T;
  if (camera === 7 || camera === '7') return (typeof camera === 'number' ? 1 : '1') as T;
  return camera;
}

export function saveCheckpoint(state: GameState) {
  const checkpoint = structuredClone(state);
  checkpoint.elapsed = Math.floor(state.elapsed / PHASE_LENGTH) * PHASE_LENGTH;
  checkpoint.gameOver = null;
  checkpoint.won = false;
  localStorage.setItem(SAVE_KEY, JSON.stringify(checkpoint));
  localStorage.removeItem(COMPLETED_KEY);
}

export function markCompleted() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.setItem(COMPLETED_KEY, 'true');
}

export function clearGameSave() {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(COMPLETED_KEY);
}
