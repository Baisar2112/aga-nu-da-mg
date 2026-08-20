import type { AnimatronicName, GameRules, GameState } from './types';

export const NIGHT_SECONDS = 480;
export const GAME_START_MINUTES = 23 * 60 + 50;
export const GAME_MINUTES = 370;
export const FIRST_PHASE_SECONDS = NIGHT_SECONDS / 3;
export const DEFAULT_OFFICE_BRIGHTNESS = 40;

export function clockMinutesToElapsed(clockMinutes: number) {
  const minutesFromStart = (clockMinutes - GAME_START_MINUTES + 24 * 60) % (24 * 60);
  return minutesFromStart * NIGHT_SECONDS / GAME_MINUTES;
}

export const GUARD_NOTE_SLOWDOWN_END = clockMinutesToElapsed(10);

export const SPAWN_TIMES: Record<AnimatronicName, number> = {
  crocodile: clockMinutesToElapsed(15),
  dog: clockMinutesToElapsed(20),
  fox: clockMinutesToElapsed(2 * 60 + 20),
  chick: clockMinutesToElapsed(2 * 60 + 30),
  freddy: clockMinutesToElapsed(4 * 60),
};

export const WATCHER_SPAWN_TIME = clockMinutesToElapsed(2 * 60 + 20);
export const WATCHER_SPEED = 1.3;

export const BASE_SPEED: Record<AnimatronicName, number> = {
  crocodile: 1,
  dog: 1,
  fox: 2,
  chick: 3,
  freddy: 0.7,
};

const animatronic = (name: AnimatronicName) => ({
  name,
  mode: 'hidden' as const,
  route: [],
  routeIndex: 0,
  timer: 0,
  arrival: 0,
  heldByDirector: false,
  heldByRepair: false,
  lastRoutes: [],
  litTime: 0,
});

const between = (min: number, max: number) => min + Math.random() * (max - min);

export function createInitialState(customRules?: GameRules): GameState {
  const rules = customRules ? structuredClone(customRules) : createDefaultRules();
  return {
    elapsed: 0,
    timeLayoutVersion: 3,
    energy: 100,
    flashlightBattery: 100,
    hasFlashlight: false,
    hasMask: false,
    maskOn: false,
    flashlightOn: false,
    flashlightAtWindow: true,
    flashlightPulse: 0,
    computer: 'OFF',
    computerUseTime: 0,
    rebootTime: 0,
    selectedCamera: 7,
    cameraLayoutVersion: 2,
    leftDoor: { closed: false, moving: false, blocked: false },
    rightDoor: { closed: false, moving: false, blocked: false },
    drawerOpen: false,
    hasTape: false,
    repairOpen: false,
    wiresFixed: [],
    selectedWire: null,
    rules,
    problems: {
      outageAt: rules.problems.outage.enabled ? rules.problems.outage.at : 999,
      outageActive: false,
      outageDone: false,
      staticAt: rules.problems.static.enabled ? rules.problems.static.at : 999,
      staticActive: false,
      staticCount: 0,
      rageAt: rules.problems.rage.enabled ? rules.problems.rage.at : 999,
      rageActive: false,
    },
    animatronics: {
      crocodile: animatronic('crocodile'),
      dog: animatronic('dog'),
      fox: animatronic('fox'),
      chick: animatronic('chick'),
      freddy: animatronic('freddy'),
    },
    watcher: {
      active: false,
      position: 'start',
      moveTimer: 0,
      turnTimer: 3,
      attackTimer: 3,
      maskTime: 0,
      headTurned: false,
    },
    message: 'Ночь началась. Продержитесь до 06:00.',
    messageTime: 5,
    gameOver: null,
    won: false,
  };
}

function createDefaultRules(): GameRules {
  return {
    officeBrightness: DEFAULT_OFFICE_BRIGHTNESS,
    animatronics: {
      crocodile: { enabled: true, spawnTime: SPAWN_TIMES.crocodile, speed: BASE_SPEED.crocodile },
      dog: { enabled: true, spawnTime: SPAWN_TIMES.dog, speed: BASE_SPEED.dog },
      fox: { enabled: true, spawnTime: SPAWN_TIMES.fox, speed: BASE_SPEED.fox },
      chick: { enabled: true, spawnTime: SPAWN_TIMES.chick, speed: BASE_SPEED.chick },
      freddy: { enabled: true, spawnTime: SPAWN_TIMES.freddy, speed: BASE_SPEED.freddy },
    },
    watcher: { enabled: true, spawnTime: WATCHER_SPAWN_TIME, speed: WATCHER_SPEED },
    problems: {
      outage: { enabled: true, at: between(clockMinutesToElapsed(30), clockMinutesToElapsed(105)) },
      static: { enabled: true, at: between(clockMinutesToElapsed(130), clockMinutesToElapsed(180)) },
      rage: { enabled: true, at: between(clockMinutesToElapsed(270), clockMinutesToElapsed(330)) },
    },
  };
}
