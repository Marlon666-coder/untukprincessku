/**
 * A tiny, gentle "music box" generated with the Web Audio API.
 * No audio files needed, so the app ships light and has no copyright issues.
 * Later a custom song URL (e.g. from Supabase Storage) can replace this.
 */

const NOTE = (semitonesFromA4) => 440 * 2 ** (semitonesFromA4 / 12);

// Soft progression in C major: C – Am – F – G (arpeggiated), 16 steps per chord.
const CHORDS = [
  [-9, -5, -2, 3, 7, 3, -2, -5], // C  E  G  C  E ...
  [-12, -9, -5, 0, 3, 0, -5, -9], // A  C  E  A  C ...
  [-16, -12, -9, -4, 0, -4, -9, -12], // F  A  C  F  A ...
  [-14, -10, -7, -2, 2, -2, -7, -10], // G  B  D  G  B ...
];

const STEP_SECONDS = 0.36;
const LOOKAHEAD_SECONDS = 0.6;

export function createMusicBox() {
  let ctx = null;
  let master = null;
  let timer = null;
  let step = 0;
  let nextTime = 0;
  let volume = 0.5;

  function setup() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Browser ini belum mendukung audio.');
    ctx = new AudioContext();

    master = ctx.createGain();
    master.gain.value = volume * 0.35;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3200;

    // Simple echo for a dreamy tail.
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.27;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    delay.connect(feedback).connect(delay);

    master.connect(lowpass);
    lowpass.connect(ctx.destination);
    lowpass.connect(delay);
    delay.connect(ctx.destination);
  }

  function playNote(frequency, time, accent) {
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    overtone.type = 'triangle';
    osc.frequency.value = frequency;
    overtone.frequency.value = frequency * 2;

    const peak = accent ? 0.5 : 0.32;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.value = 0.12;

    osc.connect(gain);
    overtone.connect(overtoneGain).connect(gain);
    gain.connect(master);

    osc.start(time);
    overtone.start(time);
    osc.stop(time + 1.7);
    overtone.stop(time + 1.7);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
      const chord = CHORDS[Math.floor(step / 16) % CHORDS.length];
      const index = step % 8;
      // Skip a few steps so the pattern breathes instead of feeling mechanical.
      if (!(step % 16 === 13 || step % 16 === 15)) {
        playNote(NOTE(chord[index] + 12), nextTime, step % 8 === 0);
      }
      step += 1;
      nextTime += STEP_SECONDS;
    }
  }

  return {
    async play() {
      if (!ctx) setup();
      if (ctx.state === 'suspended') await ctx.resume();
      if (timer) return;
      nextTime = ctx.currentTime + 0.05;
      schedule();
      timer = setInterval(schedule, 150);
    },

    pause() {
      clearInterval(timer);
      timer = null;
      if (ctx) ctx.suspend();
    },

    setVolume(value) {
      volume = value;
      if (master) master.gain.setTargetAtTime(value * 0.35, ctx.currentTime, 0.05);
    },

    destroy() {
      clearInterval(timer);
      timer = null;
      if (ctx) ctx.close();
      ctx = null;
    },
  };
}
