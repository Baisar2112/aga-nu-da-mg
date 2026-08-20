import type { GameState } from './types';

const BASE_MOVE_MIN = 22.1;
const BASE_MOVE_MAX = 33.8;
const HEAD_TURN_SECONDS = 3;
const ATTACK_SECONDS = 3;
const MASK_DEFENSE_SECONDS = 4;

const createMoveTimer = (speed: number) => (
  BASE_MOVE_MIN + Math.random() * (BASE_MOVE_MAX - BASE_MOVE_MIN)
) / speed;

export function createWatcherState(): GameState['watcher'] {
  return {
    active: false,
    position: 'start',
    moveTimer: 0,
    turnTimer: HEAD_TURN_SECONDS,
    attackTimer: ATTACK_SECONDS,
    maskTime: 0,
    headTurned: false,
  };
}

export function stepWatcher(state: GameState, dt: number) {
  if (state.gameOver || !state.rules.watcher.enabled) return;
  const watcher = state.watcher;
  if (!watcher.active) {
    if (state.elapsed < state.rules.watcher.spawnTime) return;
    watcher.active = true;
    watcher.moveTimer = createMoveTimer(state.rules.watcher.speed);
    Object.assign(state, { message: 'Смотритель начал двигаться в комнате 8.', messageTime: 4 });
    return;
  }

  if (watcher.position !== 'end') {
    watcher.moveTimer -= dt;
    if (watcher.moveTimer > 0) return;
    const nextPosition = watcher.position === 'start' ? 'middle' : 'end';
    const windowOccupied = Object.values(state.animatronics).some((animatronic) => animatronic.mode === 'window');
    if (nextPosition === 'end' && windowOccupied) return;
    watcher.position = nextPosition;
    watcher.moveTimer = watcher.position === 'middle' ? createMoveTimer(state.rules.watcher.speed) : 0;
    if (watcher.position === 'end') {
      watcher.turnTimer = HEAD_TURN_SECONDS;
      watcher.attackTimer = ATTACK_SECONDS;
    }
    return;
  }

  if (state.maskOn) {
    watcher.maskTime += dt;
    if (watcher.maskTime >= MASK_DEFENSE_SECONDS) resetWatcher(state);
    return;
  }

  watcher.maskTime = 0;
  if (!watcher.headTurned) {
    watcher.turnTimer -= dt;
    if (watcher.turnTimer > 0) return;
    watcher.headTurned = true;
    Object.assign(state, { message: 'Смотритель смотрит прямо на вас. Наденьте маску!', messageTime: 3 });
    return;
  }

  watcher.attackTimer -= dt;
  if (watcher.attackTimer <= 0) state.gameOver = 'Смотритель узнал человека под маской охранника.';
}

function resetWatcher(state: GameState) {
  Object.assign(state.watcher, {
    position: 'start',
    moveTimer: createMoveTimer(state.rules.watcher.speed),
    turnTimer: HEAD_TURN_SECONDS,
    attackTimer: ATTACK_SECONDS,
    maskTime: 0,
    headTurned: false,
  });
  Object.assign(state, { message: 'Смотритель принял вас за аниматроника и отошёл.', messageTime: 4 });
}
