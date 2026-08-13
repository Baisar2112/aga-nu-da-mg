import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState } from './constants';
import { stepGame } from './stepGame';
import type { DoorSide, GameState } from './types';
import { clearGameSave, loadCheckpoint, markCompleted, PHASE_LENGTH, saveCheckpoint } from '../lib/gameSave';

export function useGame() {
  const [state, setState] = useState(() => loadCheckpoint() ?? createInitialState());
  const lastTick = useRef(performance.now());
  const savedPhase = useRef(Math.floor(state.elapsed / PHASE_LENGTH));

  useEffect(() => {
    if (!loadCheckpoint() && !state.won) saveCheckpoint(state);
  }, []);

  useEffect(() => {
    const phase = Math.min(2, Math.floor(state.elapsed / PHASE_LENGTH));
    if (phase > savedPhase.current && !state.gameOver && !state.won) {
      savedPhase.current = phase;
      saveCheckpoint(state);
    }
    if (state.won) markCompleted();
  }, [state]);

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

  const toggleTablet = useCallback(() => setState((current) => {
    if (current.energy <= 0 || current.problems.outageActive) return current;
    const next = structuredClone(current);
    if (next.computer === 'OFF') next.computer = 'CAMERA_VIEW';
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

  const action = useCallback((change: (next: GameState) => void) => setState((current) => {
    const next = structuredClone(current);
    change(next);
    return next;
  }), []);

  const restart = useCallback(() => setState((current) => {
    lastTick.current = performance.now();
    if (current.won) {
      clearGameSave();
      savedPhase.current = 0;
      const initial = createInitialState();
      saveCheckpoint(initial);
      return initial;
    }
    return loadCheckpoint() ?? createInitialState();
  }), []);

  return { state, setState, toggleDoor, toggleTablet, setFlashlight, action, restart };
}
