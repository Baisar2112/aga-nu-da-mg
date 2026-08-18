import type { AnimatronicState, GameState } from './types';

export const FOX_ROUTE = ['1', '3', '5', '6', 'right'];

const FOX_ROUTE_SECONDS = 5;

export const createFoxCooldown = () => 30 + Math.random() * 30;

export function stepFox(
  fox: AnimatronicState,
  state: GameState,
  dt: number,
  defend: (message: string) => void,
) {
  if (fox.mode === 'waiting') {
    fox.timer -= dt;
    if (fox.timer <= 0) Object.assign(fox, { mode: 'moving', timer: 0, arrival: state.elapsed });
    return;
  }
  if (fox.mode === 'running') {
    if ((fox.timer -= dt) > 0) return;
    if (state.rightDoor.closed && !state.rightDoor.moving) {
      defend('Лиса с грохотом ударилась о дверь.');
    } else state.gameOver = 'Лиса ворвалась в офис.';
    return;
  }
  if (fox.mode !== 'moving') return;
  const legSeconds = FOX_ROUTE_SECONDS / (fox.route.length - 1);
  fox.timer += dt;
  if (fox.timer < legSeconds) return;
  fox.timer = 0;
  fox.routeIndex += 1;
  if (fox.routeIndex === fox.route.length - 2) {
    Object.assign(fox, { mode: 'running', timer: legSeconds });
    Object.assign(state, { message: 'Быстрый топот справа!', messageTime: 3 });
  }
}
