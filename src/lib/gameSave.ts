import type { GameState } from '../game/types';

const SAVE_KEY = 'last-night-at-freddy.phase-save.v1';
const COMPLETED_KEY = 'last-night-at-freddy.completed.v1';
export const PHASE_LENGTH = 160;

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
    return {
      ...saved,
      hasFlashlight: saved.hasFlashlight ?? saved.hasTape ?? false,
      computer: saved.computer === 'ON' || saved.computer === 'WORKING' ? 'OFF' : saved.computer,
    };
  } catch {
    localStorage.removeItem(SAVE_KEY);
    return null;
  }
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
