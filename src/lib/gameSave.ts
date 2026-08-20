import type { GameState } from '../game/types';
import { clockMinutesToElapsed, createInitialState, FIRST_PHASE_SECONDS, NIGHT_SECONDS } from '../game/constants';
import { createWatcherState } from '../game/watcher';

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
    const fallback = createInitialState();
    saved.rules ??= structuredClone(fallback.rules);
    saved.rules.officeBrightness ??= fallback.rules.officeBrightness;
    if (saved.timeLayoutVersion !== 3) {
      if (saved.timeLayoutVersion !== 2) migrateVersionOneTime(saved);
      migrateVersionTwoTime(saved);
    }
    if (saved.cameraLayoutVersion !== 2) {
      saved.selectedCamera = swapCameraOneAndSeven(saved.selectedCamera);
      Object.values(saved.animatronics).forEach((animatronic) => {
        animatronic.route = animatronic.route.map((spot) => swapCameraOneAndSeven(spot));
      });
      saved.cameraLayoutVersion = 2;
    }
    saved.rules.watcher ??= structuredClone(fallback.rules.watcher);
    return {
      ...saved,
      rules: saved.rules ?? fallback.rules,
      hasFlashlight: saved.hasFlashlight ?? saved.hasTape ?? false,
      hasMask: saved.hasMask ?? saved.drawerOpen ?? false,
      maskOn: false,
      watcher: saved.watcher ?? createWatcherState(),
      computer: saved.computer === 'ON' || saved.computer === 'WORKING' ? 'OFF' : saved.computer,
      leftDoor: { ...saved.leftDoor, blocked: saved.leftDoor.blocked ?? false },
      rightDoor: { ...saved.rightDoor, blocked: saved.rightDoor.blocked ?? false },
    };
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
}

const VERSION_TWO_NIGHT_SECONDS = 510;
const VERSION_TWO_START_MINUTES = 23 * 60 + 30;
const VERSION_TWO_GAME_MINUTES = 390;

function migrateVersionOneTime(state: GameState) {
  const convert = (seconds: number) => clockToVersionTwoElapsed(seconds * 360 / 480);
  convertGameTimestamps(state, convert);
  state.elapsed = convert(state.elapsed);
  Object.values(state.animatronics).forEach((animatronic) => {
    if (animatronic.arrival > 0) animatronic.arrival = convert(animatronic.arrival);
  });
  state.timeLayoutVersion = 2;
}

function migrateVersionTwoTime(state: GameState) {
  const convert = (seconds: number) => {
    const clockMinutes = (VERSION_TWO_START_MINUTES
      + seconds * VERSION_TWO_GAME_MINUTES / VERSION_TWO_NIGHT_SECONDS) % (24 * 60);
    return clockMinutesToElapsed(clockMinutes);
  };
  convertGameTimestamps(state, convert);
  state.elapsed = state.elapsed * NIGHT_SECONDS / VERSION_TWO_NIGHT_SECONDS;
  Object.values(state.animatronics).forEach((animatronic) => {
    if (animatronic.arrival > 0) animatronic.arrival *= NIGHT_SECONDS / VERSION_TWO_NIGHT_SECONDS;
  });
  state.timeLayoutVersion = 3;
}

function convertGameTimestamps(state: GameState, convert: (seconds: number) => number) {
  const timestamp = (seconds: number) => seconds >= 900 ? seconds : convert(seconds);
  Object.values(state.rules.animatronics).forEach((rule) => { rule.spawnTime = convert(rule.spawnTime); });
  if (state.rules.watcher) state.rules.watcher.spawnTime = convert(state.rules.watcher.spawnTime);
  Object.values(state.rules.problems).forEach((rule) => { rule.at = convert(rule.at); });
  state.problems.outageAt = timestamp(state.problems.outageAt);
  state.problems.staticAt = timestamp(state.problems.staticAt);
  state.problems.rageAt = timestamp(state.problems.rageAt);
}

function clockToVersionTwoElapsed(clockMinutes: number) {
  const minutesFromStart = (clockMinutes - VERSION_TWO_START_MINUTES + 24 * 60) % (24 * 60);
  return minutesFromStart * VERSION_TWO_NIGHT_SECONDS / VERSION_TWO_GAME_MINUTES;
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
