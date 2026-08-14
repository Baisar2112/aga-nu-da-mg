export function playHeavySteps(audio: AudioContext) {
  const start = audio.currentTime;
  for (let step = 0; step < 5; step += 1) {
    const time = start + step * .42;
    playStepImpact(audio, time);
  }
}

function playStepImpact(audio: AudioContext, time: number) {
  const thump = audio.createOscillator();
  const thumpGain = audio.createGain();
  thump.type = 'triangle';
  thump.frequency.setValueAtTime(105, time);
  thump.frequency.exponentialRampToValueAtTime(42, time + .22);
  thumpGain.gain.setValueAtTime(.001, time);
  thumpGain.gain.exponentialRampToValueAtTime(.2, time + .012);
  thumpGain.gain.exponentialRampToValueAtTime(.001, time + .28);
  thump.connect(thumpGain).connect(audio.destination);
  thump.start(time);
  thump.stop(time + .3);

  const length = Math.floor(audio.sampleRate * .16);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * Math.exp(-index / (length * .28));
  }
  const clank = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  clank.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = 760;
  filter.Q.value = 2.4;
  gain.gain.value = .16;
  clank.connect(filter).connect(gain).connect(audio.destination);
  clank.start(time);
}

export function playWarning(audio: AudioContext, frequencies: number[]) {
  frequencies.forEach((frequency, index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const time = audio.currentTime + index * .13;
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.001, time);
    gain.gain.exponentialRampToValueAtTime(.08, time + .02);
    gain.gain.exponentialRampToValueAtTime(.001, time + .12);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(time);
    oscillator.stop(time + .13);
  });
}

export function playMetalHit(audio: AudioContext) {
  const length = Math.floor(audio.sampleRate * .35);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * Math.exp(-index / (length * .16));
  }
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  filter.type = 'bandpass';
  filter.frequency.value = 420;
  gain.gain.value = .25;
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
}
