/**
 * Tiny self-contained audio engine for Love Pixel World.
 *
 * Uses the Web Audio API only — NO external audio files, so there is nothing
 * to download, nothing copyrighted, and nothing that can 404. Sound effects
 * are short synthesised blips; background music is a slow, gentle music-box
 * arpeggio in a major pentatonic scale (dreamy + never harsh).
 *
 * The AudioContext is created lazily on the first user gesture to respect
 * browser autoplay policies. Every method is a no-op (never throws) when the
 * Web Audio API is unavailable, so the game stays fully playable without it.
 */

const PENTATONIC = [392.0, 440.0, 523.25, 587.33, 659.25]; // G A C D E (soft, major)

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicTimer = null;
    this.musicOn = false;
    this.sfxOn = true;
    this.musicVolume = 0.35;
    this.sfxVolume = 0.5;
    this.supported =
      typeof window !== 'undefined' &&
      (typeof window.AudioContext !== 'undefined' ||
        typeof window.webkitAudioContext !== 'undefined');
    this._step = 0;
  }

  /** Create the context on demand (must be called from a user gesture). */
  _ensure() {
    if (!this.supported) return false;
    if (this.ctx) return true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.master);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.master);
      return true;
    } catch {
      this.supported = false;
      return false;
    }
  }

  /** Resume a suspended context (Safari/Chrome autoplay unlock). */
  async unlock() {
    if (!this._ensure()) return;
    try {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch {
      /* ignore */
    }
  }

  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain && this.musicOn) {
      this._ramp(this.musicGain.gain, this.musicVolume, 0.3);
    }
  }

  setSfxVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume;
  }

  setSfxEnabled(on) {
    this.sfxOn = Boolean(on);
  }

  _ramp(param, target, time) {
    try {
      const now = this.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      param.linearRampToValueAtTime(target, now + time);
    } catch {
      /* ignore */
    }
  }

  // --- Background music ---------------------------------------------------
  async startMusic() {
    if (!this._ensure()) return;
    await this.unlock();
    this.musicOn = true;
    this._ramp(this.musicGain.gain, this.musicVolume, 1.2);
    if (this.musicTimer) return;
    const stepMs = 520;
    this.musicTimer = window.setInterval(() => this._musicStep(), stepMs);
    this._musicStep();
  }

  stopMusic() {
    this.musicOn = false;
    if (this.musicGain) this._ramp(this.musicGain.gain, 0, 0.8);
    if (this.musicTimer) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  _musicStep() {
    if (!this.ctx || !this.musicOn) return;
    const i = this._step++;
    // A gentle rising/falling arpeggio with an occasional low pad note.
    const noteIndex = [0, 2, 4, 2, 1, 3, 2, 0][i % 8];
    const octave = i % 16 < 8 ? 1 : 0.5;
    const freq = PENTATONIC[noteIndex] * octave;
    this._tone(freq, 0.9, 'triangle', this.musicGain, 0.18, 0.6);
    // soft bass every 4 steps
    if (i % 4 === 0) {
      this._tone(PENTATONIC[0] * 0.25, 1.6, 'sine', this.musicGain, 0.12, 0.9);
    }
    // sparkle every 8 steps
    if (i % 8 === 3) {
      this._tone(PENTATONIC[4] * 2, 0.5, 'sine', this.musicGain, 0.08, 0.3);
    }
  }

  // --- Sound effects ------------------------------------------------------
  _tone(freq, duration, type, destination, peak, release) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * release + 0.08);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      /* ignore */
    }
  }

  _sfx(notes) {
    if (!this.sfxOn || !this._ensure()) return;
    this.unlock();
    notes.forEach(({ freq, delay = 0, dur = 0.18, type = 'sine', peak = 0.4 }) => {
      window.setTimeout(() => this._tone(freq, dur, type, this.sfxGain, peak, 0.6), delay);
    });
  }

  // Named effects used around the game.
  play(name) {
    switch (name) {
      case 'enter':
        this._sfx([
          { freq: 392, delay: 0, type: 'triangle' },
          { freq: 523.25, delay: 90, type: 'triangle' },
          { freq: 659.25, delay: 180, type: 'triangle', dur: 0.3 },
        ]);
        break;
      case 'open':
        this._sfx([
          { freq: 523.25, delay: 0, type: 'sine' },
          { freq: 783.99, delay: 70, type: 'sine', dur: 0.25 },
        ]);
        break;
      case 'reveal':
        this._sfx([
          { freq: 659.25, delay: 0, type: 'triangle' },
          { freq: 880, delay: 80, type: 'triangle' },
          { freq: 1046.5, delay: 160, type: 'triangle', dur: 0.35 },
        ]);
        break;
      case 'discover':
        this._sfx([
          { freq: 523.25, delay: 0, type: 'sine' },
          { freq: 659.25, delay: 60, type: 'sine' },
          { freq: 783.99, delay: 120, type: 'sine' },
          { freq: 1046.5, delay: 200, type: 'sine', dur: 0.4 },
        ]);
        break;
      case 'portal':
        this._sfx([
          { freq: 261.63, delay: 0, type: 'sine', dur: 0.5, peak: 0.3 },
          { freq: 392, delay: 150, type: 'sine', dur: 0.5, peak: 0.3 },
          { freq: 523.25, delay: 300, type: 'triangle', dur: 0.6 },
          { freq: 783.99, delay: 450, type: 'triangle', dur: 0.7 },
        ]);
        break;
      case 'ending':
        this._sfx([
          { freq: 523.25, delay: 0, type: 'triangle', dur: 0.6 },
          { freq: 659.25, delay: 200, type: 'triangle', dur: 0.6 },
          { freq: 783.99, delay: 400, type: 'triangle', dur: 0.6 },
          { freq: 1046.5, delay: 600, type: 'triangle', dur: 1.0 },
        ]);
        break;
      case 'click':
        this._sfx([{ freq: 587.33, delay: 0, type: 'sine', dur: 0.1, peak: 0.25 }]);
        break;
      case 'close':
        this._sfx([
          { freq: 523.25, delay: 0, type: 'sine', dur: 0.12, peak: 0.3 },
          { freq: 392, delay: 70, type: 'sine', dur: 0.14, peak: 0.3 },
        ]);
        break;
      default:
        break;
    }
  }

  dispose() {
    this.stopMusic();
    try {
      this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.ctx = null;
  }
}

// Single shared instance for the whole game.
let instance = null;
export function getAudioManager() {
  if (!instance) instance = new AudioManager();
  return instance;
}

export default getAudioManager;
