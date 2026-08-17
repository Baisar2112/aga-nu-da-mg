import { NIGHT_SECONDS } from './constants';
import { stepAnimatronics } from './animatronics';
import type { GameState } from './types';

export function stepGame(previous: GameState, dt: number) {
  if (previous.gameOver || previous.won) return previous;
  const state = structuredClone(previous);
  state.elapsed = Math.min(NIGHT_SECONDS, state.elapsed + dt);
  state.messageTime = Math.max(0, state.messageTime - dt);
  if (state.messageTime === 0) state.message = '';

  updateProblems(state, dt);
  updatePower(state, dt);
  stepAnimatronics(state, dt);

  if (state.elapsed >= NIGHT_SECONDS && !state.gameOver) state.won = true;
  return state;
}

function updatePower(state: GameState, dt: number) {
  const usingComputer = ['WORKING', 'CAMERA_VIEW', 'REBOOTING'].includes(state.computer);
  state.computerUseTime = usingComputer ? state.computerUseTime + dt : 0;
  let drain = 0;
  if (usingComputer) drain += state.computerUseTime > 40 ? 0.25 : state.computerUseTime > 20 ? 0.15 : 0.1;
  if (state.leftDoor.closed) drain += 0.2;
  if (state.rightDoor.closed) drain += 0.2;
  state.energy = Math.max(0, state.energy - drain * dt);
  if (state.flashlightOn) state.flashlightBattery = Math.max(0, state.flashlightBattery - 0.416 * dt);
  if (state.flashlightBattery === 0) state.flashlightOn = false;
  if (state.energy === 0) {
    state.computer = 'OFF';
    state.leftDoor.closed = false;
    state.rightDoor.closed = false;
    state.leftDoor.moving = false;
    state.rightDoor.moving = false;
    state.leftDoor.blocked = false;
    state.rightDoor.blocked = false;
  }
  if (state.computer === 'REBOOTING') {
    state.rebootTime = Math.max(0, state.rebootTime - dt);
    if (state.rebootTime === 0) {
      state.computer = 'WORKING';
      if (state.problems.staticActive) {
        state.problems.staticActive = false;
        state.problems.staticCount += 1;
        state.problems.staticAt = state.problems.staticCount < 3 ? state.elapsed + 45 + Math.random() * 45 : 999;
      }
      Object.assign(state, { message: 'Перезагрузка завершена.', messageTime: 3 });
    }
  }
}

function updateProblems(state: GameState, _dt: number) {
  const problem = state.problems;
  if (!problem.outageDone && !problem.outageActive && state.elapsed >= problem.outageAt) {
    problem.outageActive = true;
    state.computer = 'OFF';
    state.leftDoor.closed = false;
    state.rightDoor.closed = false;
    state.leftDoor.moving = false;
    state.rightDoor.moving = false;
    state.leftDoor.blocked = false;
    state.rightDoor.blocked = false;
    Object.assign(state, { message: 'Авария питания! Возьмите изоленту и почините щиток.', messageTime: 6 });
  }
  if (!problem.staticActive && problem.staticCount < 3 && state.elapsed >= problem.staticAt) {
    problem.staticActive = true;
    problem.staticAt = 999;
    Object.assign(state, { message: 'Датчик движения сломан. Нужна перезагрузка.', messageTime: 5 });
  }
  if (!problem.rageActive && state.elapsed >= problem.rageAt) {
    problem.rageActive = true;
    Object.assign(state, { message: 'БЕШЕНСТВО: аниматроники ускорились до конца ночи.', messageTime: 6 });
  }
}
