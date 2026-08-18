import type { AnimatronicName, GameRules } from '../game/types';
import { BASE_SPEED, clockMinutesToElapsed, DEFAULT_OFFICE_BRIGHTNESS, SPAWN_TIMES } from '../game/constants';

const STORAGE_KEY = 'last-night-at-freddy.developer-rules.v3';
const PREVIOUS_STORAGE_KEY = 'last-night-at-freddy.developer-rules.v2';
const LEGACY_STORAGE_KEY = 'last-night-at-freddy.developer-rules.v1';
export const ANIMATRONIC_NAMES: AnimatronicName[] = ['crocodile', 'dog', 'fox', 'chick', 'freddy'];

export const ANIMATRONIC_LABELS: Record<AnimatronicName, string> = {
  crocodile: 'Крокодил', dog: 'Собака', fox: 'Лиса', chick: 'Цыплёнок', freddy: 'Фредди',
};

export function createConsoleDefaults(): GameRules {
  return {
    officeBrightness: DEFAULT_OFFICE_BRIGHTNESS,
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
  const previous = localStorage.getItem(PREVIOUS_STORAGE_KEY);
  const raw = current ?? previous ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    const rules = JSON.parse(raw) as GameRules;
    rules.officeBrightness ??= DEFAULT_OFFICE_BRIGHTNESS;
    if (!current) {
      const convert = previous ? versionTwoToCurrentElapsed
        : (seconds: number) => clockMinutesToElapsed(seconds * 360 / 480);
      Object.values(rules.animatronics).forEach((rule) => {
        rule.spawnTime = convert(rule.spawnTime);
      });
      Object.values(rules.problems).forEach((rule) => {
        rule.at = convert(rule.at);
      });
      saveDeveloperConfig(rules);
      localStorage.removeItem(PREVIOUS_STORAGE_KEY);
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

export function consumeDeveloperConfig(): GameRules | null {
  const rules = loadDeveloperConfig();
  if (rules) clearDeveloperConfig();
  return rules;
}

export function clearDeveloperConfig() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PREVIOUS_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

function versionTwoToCurrentElapsed(seconds: number) {
  const clockMinutes = (23 * 60 + 30 + seconds * 390 / 510) % (24 * 60);
  return clockMinutesToElapsed(clockMinutes);
}
