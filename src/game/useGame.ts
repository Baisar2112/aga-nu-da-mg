import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState, GUARD_NOTE_SLOWDOWN_END } from './constants';
import { stepGame } from './stepGame';
import type { DoorSide, GameState } from './types';
import { clearGameSave, loadCheckpoint, markCompleted, PHASE_LENGTH, saveCheckpoint } from '../lib/gameSave';
import { consumeDeveloperConfig } from '../lib/developerConfig';

const createConfiguredState = () => {
  const rules = consumeDeveloperConfig();
  const initialState = createInitialState(rules ?? undefined);
  if (rules) saveCheckpoint(initialState);
  return initialState;
};

export function useGame(isPaused = false, isReadingGuardNote = false) {
  const [state, setState] = useState(() => loadCheckpoint() ?? createConfiguredState());
  const lastTick = useRef(performance.now());
  const paused = useRef(isPaused);
  const readingGuardNote = useRef(isReadingGuardNote);
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
    paused.current = isPaused;
    readingGuardNote.current = isReadingGuardNote;
    lastTick.current = performance.now();
  }, [isPaused, isReadingGuardNote]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now();
      if (paused.current) {
        lastTick.current = now;
        return;
      }
      const realDt = Math.min(0.25, (now - lastTick.current) / 1000);
      lastTick.current = now;
      setState((current) => {
        const canSlowTime = current.computer === 'CAMERA_VIEW'
          && current.elapsed < GUARD_NOTE_SLOWDOWN_END;
        const gameDt = readingGuardNote.current && canSlowTime ? realDt / 2 : realDt;
        return stepGame(current, gameDt);
      });
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  const toggleDoor = useCallback((side: DoorSide) => {
    setState((current) => {
      if (current.energy <= 0 || current.problems.outageActive || current.gameOver || current.won) return current;
      const own = side === 'left' ? current.leftDoor : current.rightDoor;
      const other = side === 'left' ? current.rightDoor : current.leftDoor;
      if (own.moving) return current;
      const next = structuredClone(current);
      const door = side === 'left' ? next.leftDoor : next.rightDoor;
      door.moving = true;
      if (!door.closed && other.closed) door.blocked = true;
      else door.closed = !door.closed;
      return next;
    });
    let remaining = 100;
    let previousTick = performance.now();
    const finishMovement = () => {
      const now = performance.now();
      if (!paused.current) remaining -= now - previousTick;
      previousTick = now;
      if (remaining > 0) {
        window.setTimeout(finishMovement, Math.min(50, remaining));
        return;
      }
      setState((current) => {
        const next = structuredClone(current);
        const door = side === 'left' ? next.leftDoor : next.rightDoor;
        if (!door.moving) return current;
        if (door.blocked) {
          door.blocked = false;
          window.setTimeout(() => setState((latest) => {
            const finished = structuredClone(latest);
            const returningDoor = side === 'left' ? finished.leftDoor : finished.rightDoor;
            if (!returningDoor.moving || returningDoor.blocked) return latest;
            returningDoor.moving = false;
            return finished;
          }), 100);
        } else door.moving = false;
        return next;
      });
    };
    window.setTimeout(finishMovement, 50);
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
      const initial = createConfiguredState();
      saveCheckpoint(initial);
      return initial;
    }
    return loadCheckpoint() ?? createConfiguredState();
  }), []);

  return { state, setState, toggleDoor, toggleTablet, setFlashlight, action, restart };
}
