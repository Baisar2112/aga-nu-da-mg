import { useEffect, useRef } from 'react';
import { playHeavySteps, playMetalHit, playPowerFailure, playWarning } from './gameAudio';
import type { AnimatronicName, AnimatronicState, GameState } from './types';

type AnimSnapshot = Record<AnimatronicName, Pick<AnimatronicState, 'mode' | 'routeIndex'>>;

const DOOR_KNOCK_DURATION_MS = 850;

const snapshot = (state: GameState): AnimSnapshot => Object.fromEntries(
  Object.entries(state.animatronics).map(([name, anim]) => [name, {
    mode: anim.mode,
    routeIndex: anim.routeIndex,
  }]),
) as AnimSnapshot;

export function useGameSounds(state: GameState, isPaused = false) {
  const audio = useRef<AudioContext | null>(null);
  const fanAudio = useRef<HTMLAudioElement | null>(null);
  const doorLoop = useRef<HTMLAudioElement | null>(null);
  const doorKnock = useRef<HTMLAudioElement | null>(null);
  const doorKnockTimer = useRef<number | null>(null);
  const dogWindowKnock = useRef<HTMLAudioElement | null>(null);
  const freddyLaugh = useRef<HTMLAudioElement | null>(null);
  const freddySlowLaugh = useRef<HTMLAudioElement | null>(null);
  const doorThreatActive = useRef(false);
  const previousMessage = useRef('');
  const previousAnims = useRef(snapshot(state));
  const previousOutage = useRef(state.problems.outageActive);
  const paused = useRef(isPaused);
  const dogAtWindow = !state.gameOver && !state.won
    && state.animatronics.dog.mode === 'window';
  const dogWindowThreatActive = useRef(dogAtWindow);
  dogWindowThreatActive.current = dogAtWindow;

  useEffect(() => {
    paused.current = isPaused;
    const context = audio.current;
    if (isPaused) {
      fanAudio.current?.pause();
      doorLoop.current?.pause();
      doorKnock.current?.pause();
      dogWindowKnock.current?.pause();
      if (doorKnockTimer.current !== null) window.clearTimeout(doorKnockTimer.current);
      freddyLaugh.current?.pause();
      freddySlowLaugh.current?.pause();
      if (context?.state === 'running') void context.suspend();
      return;
    }
    if (context?.state === 'suspended') void context.resume();
    if (fanAudio.current?.paused) void fanAudio.current.play().catch(() => undefined);
    if (doorThreatActive.current && doorLoop.current?.paused) {
      void doorLoop.current.play().catch(() => undefined);
    }
    if (dogWindowThreatActive.current && dogWindowKnock.current?.paused) {
      void dogWindowKnock.current.play().catch(() => undefined);
    }
  }, [isPaused]);

  useEffect(() => {
    const startAudio = () => {
      if (paused.current) return;
      if (!audio.current) {
        audio.current = new AudioContext();
      }
      if (audio.current.state === 'suspended') void audio.current.resume();
      if (fanAudio.current?.paused) void fanAudio.current.play().catch(() => undefined);
      if (doorThreatActive.current && doorLoop.current?.paused) {
        void doorLoop.current.play().catch(() => undefined);
      }
      if (dogWindowThreatActive.current && dogWindowKnock.current?.paused) {
        void dogWindowKnock.current.play().catch(() => undefined);
      }
    };
    fanAudio.current = new Audio('/audio/fan-loop.m4a');
    fanAudio.current.preload = 'auto';
    fanAudio.current.loop = true;
    fanAudio.current.volume = .19;
    doorLoop.current = new Audio('/audio/animatronic-door.m4a');
    doorLoop.current.preload = 'auto';
    doorLoop.current.loop = true;
    doorLoop.current.volume = .8;
    doorKnock.current = new Audio('/audio/door-knock.mp3');
    doorKnock.current.preload = 'auto';
    doorKnock.current.volume = .9;
    dogWindowKnock.current = new Audio('/audio/dog-window-knock.mp3');
    dogWindowKnock.current.preload = 'auto';
    dogWindowKnock.current.loop = true;
    dogWindowKnock.current.volume = .85;
    freddyLaugh.current = new Audio('/audio/freddy-laugh.mp3');
    freddyLaugh.current.preload = 'auto';
    freddyLaugh.current.volume = .85;
    freddySlowLaugh.current = new Audio('/audio/freddy-laugh.mp3');
    freddySlowLaugh.current.preload = 'auto';
    freddySlowLaugh.current.playbackRate = 2 / 3;
    freddySlowLaugh.current.preservesPitch = false;
    freddySlowLaugh.current.volume = .85;
    startAudio();
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('keydown', startAudio);
    return () => {
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
      fanAudio.current?.pause();
      doorLoop.current?.pause();
      doorKnock.current?.pause();
      dogWindowKnock.current?.pause();
      if (doorKnockTimer.current !== null) window.clearTimeout(doorKnockTimer.current);
      freddyLaugh.current?.pause();
      freddySlowLaugh.current?.pause();
      const currentAudio = audio.current;
      audio.current = null;
      fanAudio.current = null;
      doorLoop.current = null;
      doorKnock.current = null;
      dogWindowKnock.current = null;
      doorKnockTimer.current = null;
      freddyLaugh.current = null;
      freddySlowLaugh.current = null;
      if (currentAudio) void currentAudio.close();
    };
  }, []);

  useEffect(() => {
    const knock = dogWindowKnock.current;
    if (!knock) return;
    if (isPaused || !dogAtWindow) {
      knock.pause();
      knock.currentTime = 0;
      return;
    }
    void knock.play().catch(() => undefined);
    return () => {
      knock.pause();
      knock.currentTime = 0;
    };
  }, [dogAtWindow, isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const context = audio.current;
    doorThreatActive.current = !state.gameOver && !state.won
      && Object.values(state.animatronics).some((anim) => anim.mode === 'door');
    if (doorThreatActive.current && doorLoop.current?.paused) {
      void doorLoop.current.play().catch(() => undefined);
    } else if (!doorThreatActive.current && doorLoop.current && !doorLoop.current.paused) {
      doorLoop.current.pause();
      doorLoop.current.currentTime = 0;
    }

    const justRepelledAtDoor = (Object.keys(state.animatronics) as AnimatronicName[]).some((name) => {
      const current = state.animatronics[name];
      const previous = previousAnims.current[name];
      return current.mode === 'retreating'
        && (previous.mode === 'door' || previous.mode === 'running');
    });
    if (justRepelledAtDoor) previousMessage.current = state.message;

    (Object.keys(state.animatronics) as AnimatronicName[]).forEach((name) => {
      const current = state.animatronics[name];
      const previous = previousAnims.current[name];
      const finishedWaitingAtDoor = previous.mode === 'retreating'
        && current.mode !== 'retreating';
      if (finishedWaitingAtDoor && doorKnock.current) {
        if (doorKnockTimer.current !== null) window.clearTimeout(doorKnockTimer.current);
        doorKnock.current.currentTime = 0;
        void doorKnock.current.play().catch(() => undefined);
        doorKnockTimer.current = window.setTimeout(() => {
          doorKnock.current?.pause();
          doorKnockTimer.current = null;
        }, DOOR_KNOCK_DURATION_MS);
      }
      const arrivedAtRightDoor = name === 'freddy'
        && current.mode === 'door'
        && current.route[current.routeIndex] === 'right'
        && (previous.mode !== 'door' || previous.routeIndex !== current.routeIndex);
      if (arrivedAtRightDoor && freddyLaugh.current) {
        freddyLaugh.current.currentTime = 0;
        void freddyLaugh.current.play().catch(() => undefined);
      }
      const arrivedAtLeftDoor = name === 'freddy'
        && current.mode === 'door'
        && current.route[current.routeIndex] === 'left'
        && (previous.mode !== 'door' || previous.routeIndex !== current.routeIndex);
      if (arrivedAtLeftDoor && freddySlowLaugh.current) {
        freddySlowLaugh.current.currentTime = 0;
        void freddySlowLaugh.current.play().catch(() => undefined);
      }
      const previousSpot = current.route[previous.routeIndex];
      const currentSpot = current.route[current.routeIndex];
      const changedCamera = current.routeIndex > previous.routeIndex
        && /^\d+$/.test(previousSpot ?? '')
        && /^\d+$/.test(currentSpot ?? '');
      if (context && changedCamera) playHeavySteps(context);
    });
    previousAnims.current = snapshot(state);

    const outageStarted = state.problems.outageActive && !previousOutage.current;
    previousOutage.current = state.problems.outageActive;
    if (context && outageStarted) playPowerFailure(context);

    if (!state.message || state.message === previousMessage.current || !context) return;
    previousMessage.current = state.message;
    if (state.message.includes('ударил') || state.message.includes('грохотом')) playMetalHit(context);
    else if (state.message.includes('топот')) playWarning(context, [120, 90, 135, 80]);
    else if (state.message.includes('БЕШЕНСТВО')) playWarning(context, [210, 170, 130]);
    else if (state.message.includes('Фредди появился')) playWarning(context, [190, 145, 110]);
  }, [isPaused, state]);
}
