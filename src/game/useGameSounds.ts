import { useEffect, useRef } from 'react';

export function useGameSounds(message: string) {
  const previous = useRef('');
  useEffect(() => {
    if (!message || message === previous.current) return;
    previous.current = message;
    if (message.includes('ударил') || message.includes('грохотом')) playMetalHit();
    else if (message.includes('топот')) playWarning([120, 90, 135, 80]);
    else if (message.includes('БЕШЕНСТВО')) playWarning([210, 170, 130]);
    else if (message.includes('Фредди появился')) playWarning([190, 145, 110]);
  }, [message]);
}

function createAudio() {
  return new AudioContext();
}

function playWarning(frequencies: number[]) {
  const audio = createAudio();
  frequencies.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.001, audio.currentTime + index * .13);
    gain.gain.exponentialRampToValueAtTime(.08, audio.currentTime + index * .13 + .02);
    gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + index * .13 + .12);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(audio.currentTime + index * .13);
    oscillator.stop(audio.currentTime + index * .13 + .13);
  });
  window.setTimeout(() => void audio.close(), 1000);
}

function playMetalHit() {
  const audio = createAudio();
  const length = Math.floor(audio.sampleRate * .35);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * Math.exp(-index / (length * .16));
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = 420;
  gain.gain.value = .25;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
  window.setTimeout(() => void audio.close(), 600);
}
