export function playThunder() {
  const AudioContextClass = window.AudioContext;
  const context = new AudioContextClass();
  const duration = 1.4;
  const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let index = 0; index < samples.length; index += 1) {
    const time = index / context.sampleRate;
    const crack = time < 0.08 ? 1 - time / 0.08 : Math.exp(-time * 3.2);
    samples[index] = (Math.random() * 2 - 1) * crack * 0.65;
  }
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  filter.type = 'lowpass';
  filter.frequency.value = 520;
  gain.gain.setValueAtTime(0.8, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
  source.buffer = buffer;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
  source.onended = () => void context.close();
}
