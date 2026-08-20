import { useEffect, useRef } from 'react';
import type { GameState, WatcherPosition } from './types';

const STEP_VOLUME = .75;
const ECHO_DELAY_MS = 180;
const DISTANCE_BY_POSITION: Record<WatcherPosition, number> = {
  start: 3,
  middle: 2,
  end: 1,
};

export function useWatcherSounds(state: GameState, isPaused: boolean) {
  const steps = useRef<HTMLAudioElement | null>(null);
  const echo = useRef<HTMLAudioElement | null>(null);
  const threat = useRef<HTMLAudioElement | null>(null);
  const echoTimer = useRef<number | null>(null);
  const previousPosition = useRef(state.watcher.position);
  const previousHeadTurned = useRef(state.watcher.headTurned);

  useEffect(() => {
    steps.current = createAudio('/audio/watcher-steps.mp3');
    echo.current = createAudio('/audio/watcher-steps.mp3');
    threat.current = createAudio('/audio/animatronic-door.m4a');
    return () => {
      if (echoTimer.current !== null) window.clearTimeout(echoTimer.current);
      [steps.current, echo.current, threat.current].forEach((sound) => sound?.pause());
      steps.current = null;
      echo.current = null;
      threat.current = null;
    };
  }, []);

  useEffect(() => {
    if (isPaused) {
      if (echoTimer.current !== null) window.clearTimeout(echoTimer.current);
      [steps.current, echo.current, threat.current].forEach((sound) => sound?.pause());
      return;
    }

    const previousRank = positionRank(previousPosition.current);
    const currentRank = positionRank(state.watcher.position);
    if (currentRank > previousRank) playSteps(state.watcher.position, steps.current, echo.current, echoTimer);
    if (state.watcher.headTurned && !previousHeadTurned.current && threat.current) {
      threat.current.currentTime = 0;
      threat.current.volume = .8;
      void threat.current.play().catch(() => undefined);
    }
    previousPosition.current = state.watcher.position;
    previousHeadTurned.current = state.watcher.headTurned;
  }, [isPaused, state.watcher.headTurned, state.watcher.position]);
}

function playSteps(
  position: WatcherPosition,
  steps: HTMLAudioElement | null,
  echo: HTMLAudioElement | null,
  echoTimer: React.MutableRefObject<number | null>,
) {
  if (!steps || !echo) return;
  const volume = STEP_VOLUME * (1 - DISTANCE_BY_POSITION[position] * .05);
  steps.currentTime = 0;
  steps.volume = volume;
  void steps.play().catch(() => undefined);
  if (echoTimer.current !== null) window.clearTimeout(echoTimer.current);
  echoTimer.current = window.setTimeout(() => {
    echo.currentTime = 0;
    echo.volume = volume * .32;
    void echo.play().catch(() => undefined);
    echoTimer.current = null;
  }, ECHO_DELAY_MS);
}

function createAudio(src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  return audio;
}

function positionRank(position: WatcherPosition) {
  return { start: 0, middle: 1, end: 2 }[position];
}
