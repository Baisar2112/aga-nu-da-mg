import type { AnimatronicName, GameRules, GameState } from './types';

export const NIGHT_SECONDS = 480;
export const GAME_MINUTES = 360;
export const FIRST_PHASE_SECONDS = 160;
export const SPAWN_TIMES: Record<AnimatronicName, number> = {
  crocodile: 20,
  dog: 80 / 3,
  fox: 560 / 3,
  chick: 200,
  freddy: 320,
};

export const BASE_SPEED: Record<AnimatronicName, number> = {
  crocodile: 1,
  dog: 1,
  fox: 2,
  chick: 3,
  freddy: 0.75,
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
    energy: 100,
    flashlightBattery: 100,
    hasFlashlight: false,
    flashlightOn: false,
    flashlightAtWindow: true,
    flashlightPulse: 0,
    computer: 'OFF',
    computerUseTime: 0,
    rebootTime: 0,
    selectedCamera: 1,
    leftDoor: { closed: false, moving: false },
    rightDoor: { closed: false, moving: false },
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
    message: 'Ночь началась. Продержитесь до 06:00.',
    messageTime: 5,
    gameOver: null,
    won: false,
  };
}

function createDefaultRules(): GameRules {
  return {
    animatronics: {
      crocodile: { enabled: true, spawnTime: SPAWN_TIMES.crocodile, speed: BASE_SPEED.crocodile },
      dog: { enabled: true, spawnTime: SPAWN_TIMES.dog, speed: BASE_SPEED.dog },
      fox: { enabled: true, spawnTime: SPAWN_TIMES.fox, speed: BASE_SPEED.fox },
      chick: { enabled: true, spawnTime: SPAWN_TIMES.chick, speed: BASE_SPEED.chick },
      freddy: { enabled: true, spawnTime: SPAWN_TIMES.freddy, speed: BASE_SPEED.freddy },
    },
    problems: {
      outage: { enabled: true, at: between(40, 140) },
      static: { enabled: true, at: between(520 / 3, 240) },
      rage: { enabled: true, at: between(360, 440) },
    },
  };
}
