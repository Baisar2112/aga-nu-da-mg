import { FIRST_PHASE_SECONDS, GAME_MINUTES, GAME_START_MINUTES, NIGHT_SECONDS } from './constants';

export function formatGameTime(elapsed: number) {
  const elapsedMinutes = Math.min(GAME_MINUTES, Math.floor(elapsed * GAME_MINUTES / NIGHT_SECONDS));
  const totalMinutes = (GAME_START_MINUTES + elapsedMinutes) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getPhase(elapsed: number) {
  if (elapsed < FIRST_PHASE_SECONDS) return 1;
  if (elapsed < FIRST_PHASE_SECONDS * 2) return 2;
  return 3;
}
