export class SFX {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this._warmup = false;
    // Pre-bind user gesture to unlock audio
    window.addEventListener('keydown', () => this._ensureContext(), { once: true });
    window.addEventListener('pointerdown', () => this._ensureContext(), { once: true });
  }

  _ensureContext() {
    if (!this.enabled) return;
    if (this.audioContext) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      this.enabled = false;
      return;
    }
    this.audioContext = new Ctx();
    // Warm up a silent sound to reduce first-play latency
    if (!this._warmup) {
      this._warmup = true;
      this._playTone({ frequency: 220, duration: 0.01, volume: 0.0 });
    }
  }

  play(name) {
    if (!this.enabled) return;
    this._ensureContext();
    switch (name) {
      case 'jump':
        this._playTone({ type: 'square', frequency: 680, duration: 0.08, slide: -400, volume: 0.18, attack: 0.002, decay: 0.08 });
        break;
      case 'stomp':
        this._playTone({ type: 'square', frequency: 280, duration: 0.12, slide: -120, volume: 0.22, attack: 0.002, decay: 0.12 });
        break;
      case 'hit':
        this._playTone({ type: 'triangle', frequency: 160, duration: 0.18, slide: -60, volume: 0.22, attack: 0.001, decay: 0.18 });
        break;
      case 'coin':
        this._chord([880, 1320], 0.09, 0.16, 0.15);
        break;
      case 'goal':
        this._melody([660, 880, 990, 1320], 0.06);
        break;
      case 'shoot':
        this._playTone({ type: 'square', frequency: 1200, duration: 0.06, slide: -300, volume: 0.18, attack: 0.001, decay: 0.06 });
        break;
      case 'bossHit':
        this._playTone({ type: 'sawtooth', frequency: 520, duration: 0.2, slide: -300, volume: 0.22, attack: 0.002, decay: 0.2 });
        break;
      case 'bossDie':
        this._melody([660, 550, 520, 440, 880], 0.08);
        break;
      default:
        break;
    }
  }

  _melody(notes, noteDuration = 0.08) {
    let time = 0;
    for (const f of notes) {
      this._playTone({ frequency: f, duration: noteDuration, volume: 0.18, attack: 0.002, decay: noteDuration }, time);
      time += noteDuration * 0.9;
    }
  }

  _chord(freqs, duration, volume = 0.15, detune = 0) {
    freqs.forEach((f, idx) => this._playTone({ frequency: f + (idx % 2 === 0 ? detune : -detune), duration, volume: volume / freqs.length }));
  }

  _playTone(options, timeOffset = 0) {
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const now = ctx.currentTime + timeOffset;
    const {
      type = 'square',
      frequency = 440,
      duration = 0.1,
      volume = 0.2,
      attack = 0.005,
      decay = duration,
      slide = 0,
    } = options;

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    const gain = ctx.createGain();
    oscillator.connect(gain).connect(ctx.destination);

    oscillator.frequency.setValueAtTime(frequency, now);
    if (slide !== 0) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    }

    const startVol = 0.0001;
    gain.gain.setValueAtTime(startVol, now);
    gain.gain.linearRampToValueAtTime(volume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(attack, decay));

    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}


