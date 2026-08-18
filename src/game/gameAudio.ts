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

export function playGlassKnock(audio: AudioContext, output: AudioNode = audio.destination) {
  const start = audio.currentTime;
  const length = Math.floor(audio.sampleRate * .24);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * Math.exp(-index / (length * .12));
  }

  const impact = audio.createBufferSource();
  const impactFilter = audio.createBiquadFilter();
  const impactGain = audio.createGain();
  impact.buffer = buffer;
  impactFilter.type = 'bandpass';
  impactFilter.frequency.value = 520;
  impactFilter.Q.value = 1.8;
  impactGain.gain.value = .3;
  impact.connect(impactFilter).connect(impactGain).connect(output);
  impact.start(start);

  [1180, 1760].forEach((frequency, index) => {
    const ring = audio.createOscillator();
    const ringGain = audio.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(frequency, start);
    ring.frequency.exponentialRampToValueAtTime(frequency * .82, start + .18);
    ringGain.gain.setValueAtTime(.055 / (index + 1), start);
    ringGain.gain.exponentialRampToValueAtTime(.001, start + .2);
    ring.connect(ringGain).connect(output);
    ring.start(start);
    ring.stop(start + .21);
  });
}

export function playPowerFailure(audio: AudioContext) {
  const start = audio.currentTime;
  const duration = 1.35;
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * duration), audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    const burst = Math.random() > .82 ? 1 : .08;
    samples[index] = (Math.random() * 2 - 1) * burst;
  }
  const crackle = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  crackle.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = 900;
  gain.gain.setValueAtTime(.24, start);
  gain.gain.exponentialRampToValueAtTime(.001, start + duration);
  crackle.connect(filter).connect(gain).connect(audio.destination);
  crackle.start(start);

  const hum = audio.createOscillator();
  const humGain = audio.createGain();
  hum.type = 'sawtooth';
  hum.frequency.setValueAtTime(90, start);
  hum.frequency.exponentialRampToValueAtTime(35, start + .45);
  humGain.gain.setValueAtTime(.12, start);
  humGain.gain.exponentialRampToValueAtTime(.001, start + .5);
  hum.connect(humGain).connect(audio.destination);
  hum.start(start);
  hum.stop(start + .52);
}
