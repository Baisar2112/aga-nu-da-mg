import type { AnimatronicName, GameRules } from '../game/types';
import { BASE_SPEED, clockMinutesToElapsed, SPAWN_TIMES } from '../game/constants';

const STORAGE_KEY = 'last-night-at-freddy.developer-rules.v2';
const LEGACY_STORAGE_KEY = 'last-night-at-freddy.developer-rules.v1';
export const ANIMATRONIC_NAMES: AnimatronicName[] = ['crocodile', 'dog', 'fox', 'chick', 'freddy'];

export const ANIMATRONIC_LABELS: Record<AnimatronicName, string> = {
  crocodile: 'Крокодил', dog: 'Собака', fox: 'Лиса', chick: 'Цыплёнок', freddy: 'Фредди',
};

export function createConsoleDefaults(): GameRules {
  return {
    animatronics: {
      crocodile: { enabled: true, spawnTime: SPAWN_TIMES.crocodile, speed: BASE_SPEED.crocodile },
      dog: { enabled: true, spawnTime: SPAWN_TIMES.dog, speed: BASE_SPEED.dog },
      fox: { enabled: true, spawnTime: SPAWN_TIMES.fox, speed: BASE_SPEED.fox },
      chick: { enabled: true, spawnTime: SPAWN_TIMES.chick, speed: BASE_SPEED.chick },
      freddy: { enabled: true, spawnTime: SPAWN_TIMES.freddy, speed: BASE_SPEED.freddy },
    },
    problems: {
      outage: { enabled: true, at: clockMinutesToElapsed(68) },
      static: { enabled: true, at: clockMinutesToElapsed(154) },
      rage: { enabled: true, at: clockMinutesToElapsed(300) },
    },
  };
}

export function loadDeveloperConfig(): GameRules | null {
  const current = localStorage.getItem(STORAGE_KEY);
  const raw = current ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    const rules = JSON.parse(raw) as GameRules;
    if (!current) {
      Object.values(rules.animatronics).forEach((rule) => {
        rule.spawnTime = clockMinutesToElapsed(rule.spawnTime * 360 / 480);
      });
      Object.values(rules.problems).forEach((rule) => {
        rule.at = clockMinutesToElapsed(rule.at * 360 / 480);
      });
      saveDeveloperConfig(rules);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
    return rules;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }
}

export function saveDeveloperConfig(rules: GameRules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function clearDeveloperConfig() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}
