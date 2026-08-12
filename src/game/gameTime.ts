import { GAME_MINUTES, NIGHT_SECONDS } from './constants';

export function formatGameTime(elapsed: number) {
  const totalMinutes = Math.min(GAME_MINUTES, Math.floor(elapsed * GAME_MINUTES / NIGHT_SECONDS));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function getPhase(elapsed: number) {
  if (elapsed < 160) return 1;
  if (elapsed < 320) return 2;
  return 3;
}
