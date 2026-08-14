import type { AnimatronicName, GameRules } from '../game/types';

const STORAGE_KEY = 'last-night-at-freddy.developer-rules.v1';
export const ANIMATRONIC_NAMES: AnimatronicName[] = ['crocodile', 'dog', 'fox', 'chick', 'freddy'];

export const ANIMATRONIC_LABELS: Record<AnimatronicName, string> = {
  crocodile: 'Крокодил', dog: 'Собака', fox: 'Лиса', chick: 'Цыплёнок', freddy: 'Фредди',
};

export function createConsoleDefaults(): GameRules {
  return {
    animatronics: {
      crocodile: { enabled: true, spawnTime: 20, speed: 1 },
      dog: { enabled: true, spawnTime: 27, speed: 1 },
      fox: { enabled: true, spawnTime: 187, speed: 2 },
      chick: { enabled: true, spawnTime: 200, speed: 3 },
      freddy: { enabled: true, spawnTime: 320, speed: .75 },
    },
    problems: {
      outage: { enabled: true, at: 90 },
      static: { enabled: true, at: 205 },
      rage: { enabled: true, at: 400 },
    },
  };
}

export function loadDeveloperConfig(): GameRules | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GameRules;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveDeveloperConfig(rules: GameRules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function clearDeveloperConfig() {
  localStorage.removeItem(STORAGE_KEY);
}
