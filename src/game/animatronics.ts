import { BASE_SPEED } from './constants';
import { createFoxCooldown, FOX_ROUTE, stepFox } from './fox';
import { applyRepairGate, consumeRepairAttackTimer, isHeldByRepair, shouldWaitBeforeDoor } from './repairGate';
import { applyThreatDirector } from './threatDirector';
import type { AnimatronicName, AnimatronicState, GameState } from './types';

const fixedRoutes = {
  crocodile: ['1', '2', '7', 'left'],
  fox: FOX_ROUTE,
};

const routeCooldown = () => Math.floor(Math.random() * 13) + 5;

function chooseRoute(name: 'dog' | 'freddy', previous: string[]) {
  if (name === 'dog') {
    return Math.random() < 0.5 ? ['1', '3', '5', '6', 'right'] : ['1', '3', '5', '8', 'window'];
  }
  const options = [
    ['4', '3', '5', '6', 'right'],
    ['4', '3', '7', '2', '1', 'left'],
    ['4', '3', '5', '8', 'window'],
  ];
  const repeated = previous.length >= 2 && previous[previous.length - 1] === previous[previous.length - 2] ? previous[previous.length - 1] : '';
  const allowed = options.filter((route) => route[route.length - 1] !== repeated);
  const roll = Math.random();
  const preferred = roll < 0.35 ? 'right' : roll < 0.7 ? 'left' : 'window';
  return allowed.find((route) => route[route.length - 1] === preferred) ?? allowed[0];
}

export function resetAnimatronic(anim: AnimatronicState) {
  const route = anim.name === 'dog' || anim.name === 'freddy'
    ? chooseRoute(anim.name, anim.lastRoutes)
    : anim.name === 'chick' ? ['2', 'office'] : fixedRoutes[anim.name];
  anim.lastRoutes = [...anim.lastRoutes.slice(-1), route[route.length - 1] ?? ''];
  Object.assign(anim, {
    route,
    routeIndex: 0,
    mode: 'waiting',
    timer: anim.name === 'fox' ? createFoxCooldown() : routeCooldown(),
    litTime: 0,
    heldByDirector: false,
    heldByRepair: false,
  });
}

function defend(anim: AnimatronicState, state: GameState, message: string) {
  resetAnimatronic(anim);
  Object.assign(state, { message, messageTime: 3 });
}

function damageWires(state: GameState) {
  if (!state.rules.problems.outage.enabled) return;
  state.problems.outageActive = true;
  state.wiresFixed = [];
  state.selectedWire = null;
  state.computer = 'OFF';
  state.leftDoor = { closed: false, moving: false, blocked: false };
  state.rightDoor = { closed: false, moving: false, blocked: false };
  Object.assign(state, { message: 'Цыплёнок повредил провода! Нужен ремонт.', messageTime: 5 });
}

function attackDoor(anim: AnimatronicState, state: GameState, dt: number) {
  const side = anim.route[anim.route.length - 1] as 'left' | 'right';
  const door = side === 'left' ? state.leftDoor : state.rightDoor;
  const queued = Object.values(state.animatronics).some((item) =>
    item.mode === 'door' && item.route[item.route.length - 1] === side && item.arrival < anim.arrival);
  if (queued || door.moving) return;
  if (anim.name === 'freddy' && side === 'left') {
    if (state.flashlightOn && !state.flashlightAtWindow) anim.litTime += dt;
    if (door.closed && anim.litTime < 0.08) state.gameOver = 'Фредди открыл заранее закрытую левую дверь.';
    else if (door.closed) defend(anim, state, 'Фредди ослеплён и остановлен дверью!');
    else if ((anim.timer -= dt) <= 0) state.gameOver = 'Сломанный Фредди добрался до охранника.';
    return;
  }
  if (door.closed) defend(anim, state, `${label(anim.name)} ударился о закрытую дверь.`);
  else if ((anim.timer -= dt) <= 0) state.gameOver = `${label(anim.name)} проник в офис.`;
}

function attackWindow(anim: AnimatronicState, state: GameState, dt: number) {
  const lit = state.flashlightOn && state.flashlightAtWindow;
  if (anim.name === 'dog') {
    if (!lit) anim.timer -= dt;
    if (lit) anim.litTime += dt;
    if (anim.litTime >= 3) defend(anim, state, 'Собака скатилась вниз за стеклом.');
    else if (anim.timer <= 0) state.gameOver = 'Собака разбила окно.';
    return;
  }
  if (lit) anim.litTime += dt;
  if (anim.litTime >= 3 && state.flashlightPulse >= 3) defend(anim, state, 'Фредди скатился вниз за стеклом.');
  else if (anim.litTime === 0 && (anim.timer -= dt) <= 0) state.gameOver = 'Фредди атаковал через окно.';
}

function advance(anim: AnimatronicState, state: GameState, dt: number) {
  if (anim.name === 'fox') return stepFox(anim, state, dt, (message) => defend(anim, state, message));
  if (anim.mode === 'retreating' || anim.mode === 'waiting') {
    if (anim.mode === 'retreating') resetAnimatronic(anim);
    else if ((anim.timer -= dt) <= 0) anim.mode = 'moving';
    return;
  }
  if (anim.mode === 'office') {
    if ((anim.timer -= dt) <= 0) resetAnimatronic(anim);
    return;
  }
  if (anim.mode === 'door') return attackDoor(anim, state, dt);
  if (anim.mode === 'window') return attackWindow(anim, state, dt);
  const multiplier = (state.problems.rageActive ? 1.5 : 1) / (state.computer === 'REBOOTING' ? 1.5 : 1);
  anim.timer += dt;
  const movementTime = 15 / ((state.rules.animatronics[anim.name]?.speed ?? BASE_SPEED[anim.name]) * multiplier);
  if (anim.timer < movementTime) return;
  if (shouldWaitBeforeDoor(anim, state)) {
    anim.timer = movementTime;
    anim.heldByRepair = true;
    return;
  }
  anim.timer = 0;
  anim.routeIndex += 1;
  const spot = anim.route[anim.routeIndex];
  if (spot === 'office') {
    Object.assign(anim, { mode: 'office', timer: 6 });
    damageWires(state);
  }
  if (spot === 'left' || spot === 'right') {
    const normalTimer = anim.name === 'crocodile' ? 9 : anim.name === 'freddy' ? (spot === 'left' ? 1 : 1.5) : 5;
    const timer = consumeRepairAttackTimer(anim, normalTimer);
    Object.assign(anim, { mode: 'door', timer, arrival: state.elapsed });
  }
  if (spot === 'window') {
    Object.assign(anim, { mode: 'window', timer: anim.name === 'freddy' ? 1.5 : 5, arrival: state.elapsed });
    if (anim.name === 'freddy') state.flashlightPulse = 0;
  }
}

export function stepAnimatronics(state: GameState, dt: number) {
  (Object.keys(state.animatronics) as AnimatronicName[]).forEach((name) => {
    const anim = state.animatronics[name];
    const rule = state.rules.animatronics[name];
    if (anim.mode === 'hidden' && rule.enabled && state.elapsed >= rule.spawnTime) {
      resetAnimatronic(anim);
      Object.assign(state, { message: `${label(name)} появился на камере ${anim.route[0]}.`, messageTime: 3 });
    }
  });

  applyRepairGate(state);
  const released = applyThreatDirector(state);
  if (released) Object.assign(state, {
    message: `${label(released)} продолжает атаку!`,
    messageTime: 1,
  });

  (Object.keys(state.animatronics) as AnimatronicName[]).forEach((name) => {
    const anim = state.animatronics[name];
    if (anim.mode !== 'hidden' && !anim.heldByDirector && !isHeldByRepair(anim, state)) advance(anim, state, dt);
  });
}

export function label(name: AnimatronicName) {
  return { crocodile: 'Крокодил', dog: 'Собака', fox: 'Лиса', chick: 'Цыплёнок', freddy: 'Фредди' }[name];
}
