import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState } from './constants';
import { stepGame } from './stepGame';
import type { DoorSide, GameState } from './types';

export function useGame() {
  const [state, setState] = useState(createInitialState);
  const lastTick = useRef(performance.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(0.25, (now - lastTick.current) / 1000);
      lastTick.current = now;
      setState((current) => stepGame(current, dt));
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  const toggleDoor = useCallback((side: DoorSide) => {
    setState((current) => {
      if (current.energy <= 0 || current.problems.outageActive || current.gameOver || current.won) return current;
      const own = side === 'left' ? current.leftDoor : current.rightDoor;
      const other = side === 'left' ? current.rightDoor : current.leftDoor;
      if (own.moving || (!own.closed && other.closed)) return current;
      const next = structuredClone(current);
      (side === 'left' ? next.leftDoor : next.rightDoor).moving = true;
      return next;
    });
    window.setTimeout(() => setState((current) => {
      const next = structuredClone(current);
      const door = side === 'left' ? next.leftDoor : next.rightDoor;
      if (!door.moving) return current;
      door.closed = !door.closed;
      door.moving = false;
      return next;
    }), 500);
  }, []);

  const toggleComputer = useCallback(() => setState((current) => {
    if (current.energy <= 0 || current.problems.outageActive) return current;
    const next = structuredClone(current);
    if (next.computer === 'OFF') next.computer = 'ON';
    else {
      next.computer = 'OFF';
      next.rebootTime = 0;
    }
    return next;
  }), []);

  const setFlashlight = useCallback((on: boolean) => setState((current) => {
    if (current.flashlightBattery <= 0 || current.flashlightOn === on) return current;
    return { ...current, flashlightOn: on, flashlightPulse: on ? current.flashlightPulse + 1 : current.flashlightPulse };
  }), []);

  const enterComputer = useCallback(() => setState((current) =>
    current.computer === 'ON' ? { ...current, computer: 'WORKING' } : current), []);

  const action = useCallback((change: (next: GameState) => void) => setState((current) => {
    const next = structuredClone(current);
    change(next);
    return next;
  }), []);

  const restart = useCallback(() => {
    lastTick.current = performance.now();
    setState(createInitialState());
  }, []);

  return { state, setState, toggleDoor, toggleComputer, setFlashlight, enterComputer, action, restart };
}
