import { useEffect, useRef } from 'react';
import { playGlassKnock, playHeavySteps, playMetalHit, playPowerFailure, playWarning } from './gameAudio';
import type { AnimatronicName, AnimatronicState, GameState } from './types';

type AnimSnapshot = Record<AnimatronicName, Pick<AnimatronicState, 'mode' | 'routeIndex'>>;

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
  const doorThreatActive = useRef(false);
  const previousMessage = useRef('');
  const previousAnims = useRef(snapshot(state));
  const previousOutage = useRef(state.problems.outageActive);
  const paused = useRef(isPaused);
  const dogAtDarkWindow = !state.gameOver && !state.won
    && state.animatronics.dog.mode === 'window'
    && !(state.flashlightOn && state.flashlightAtWindow);

  useEffect(() => {
    paused.current = isPaused;
    const context = audio.current;
    if (isPaused) {
      fanAudio.current?.pause();
      doorLoop.current?.pause();
      if (context?.state === 'running') void context.suspend();
      return;
    }
    if (context?.state === 'suspended') void context.resume();
    if (fanAudio.current?.paused) void fanAudio.current.play().catch(() => undefined);
    if (doorThreatActive.current && doorLoop.current?.paused) {
      void doorLoop.current.play().catch(() => undefined);
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
    };
    fanAudio.current = new Audio('/audio/fan-loop.m4a');
    fanAudio.current.preload = 'auto';
    fanAudio.current.loop = true;
    fanAudio.current.volume = .19;
    doorLoop.current = new Audio('/audio/animatronic-door.m4a');
    doorLoop.current.preload = 'auto';
    doorLoop.current.loop = true;
    doorLoop.current.volume = .8;
    startAudio();
    window.addEventListener('pointerdown', startAudio);
    window.addEventListener('keydown', startAudio);
    return () => {
      window.removeEventListener('pointerdown', startAudio);
      window.removeEventListener('keydown', startAudio);
      fanAudio.current?.pause();
      doorLoop.current?.pause();
      const currentAudio = audio.current;
      audio.current = null;
      fanAudio.current = null;
      doorLoop.current = null;
      if (currentAudio) void currentAudio.close();
    };
  }, []);

  useEffect(() => {
    if (isPaused || !dogAtDarkWindow) return;
    let output: GainNode | null = null;
    const knock = () => {
      const context = audio.current;
      if (!context || context.state !== 'running') return;
      if (!output) {
        output = context.createGain();
        output.gain.value = .75;
        output.connect(context.destination);
      }
      playGlassKnock(context, output);
    };
    knock();
    const timer = window.setInterval(knock, 950);
    return () => {
      window.clearInterval(timer);
      if (!output) return;
      const context = audio.current;
      if (context) output.gain.setValueAtTime(0, context.currentTime);
      output.disconnect();
    };
  }, [dogAtDarkWindow, isPaused]);

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

    (Object.keys(state.animatronics) as AnimatronicName[]).forEach((name) => {
      const current = state.animatronics[name];
      const previous = previousAnims.current[name];
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
