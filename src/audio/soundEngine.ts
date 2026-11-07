// Original Web Audio API 8-Bit Chiptune & SFX Synthesizer
// Supports 5 distinct BGM modes: 'welcome' | 'runner' | 'boss' | 'victory' | 'gameover'

export type BgmMode = 'welcome' | 'runner' | 'boss' | 'victory' | 'gameover';

class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private sfxMuted: boolean = false;
  private bgmEnabled: boolean = true;
  private volume: number = 0.55;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private currentBgmMode: BgmMode = 'welcome';
  private unlockListenersBound: boolean = false;

  constructor() {
    this.bindAutoUnlockListeners();
  }

  private bindAutoUnlockListeners() {
    if (typeof window === 'undefined' || this.unlockListenersBound) return;
    this.unlockListenersBound = true;

    const unlock = () => {
      const ctx = this.ensureContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      if (this.bgmEnabled && !this.sfxMuted && this.bgmInterval === null) {
        this.startBGM(this.currentBgmMode);
      }
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public initOnUserGesture() {
    const ctx = this.ensureContext();
    if (ctx && this.bgmEnabled && !this.sfxMuted && this.bgmInterval === null) {
      this.startBGM(this.currentBgmMode);
    }
  }

  public setMuted(muted: boolean) {
    this.sfxMuted = muted;
    if (muted) {
      this.stopBGM();
    } else if (this.bgmEnabled) {
      this.startBGM(this.currentBgmMode, true);
    }
  }

  public getMuted(): boolean {
    return this.sfxMuted;
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBGM();
    } else if (!this.sfxMuted) {
      this.startBGM(this.currentBgmMode, true);
    }
  }

  public getBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    delay: number = 0,
    gainScale: number = 0.25,
    slideToFreq?: number
  ) {
    if (this.sfxMuted || this.volume <= 0.01) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (slideToFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideToFreq, startTime + duration);
    }

    const peakGain = Math.max(0.001, this.volume * gainScale);
    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  // Cheerful greeting chirp when clicking the smiling dinosaur
  public playGreeting() {
    this.playTone(523.25, 0.07, 'square', 0, 0.22);
    this.playTone(659.25, 0.07, 'square', 0.08, 0.22);
    this.playTone(783.99, 0.12, 'square', 0.16, 0.24);
    this.playTone(1046.5, 0.18, 'triangle', 0.26, 0.26);
  }

  // Original short 8-bit jump sound
  public playJump() {
    this.playTone(240, 0.11, 'square', 0, 0.18, 520);
  }

  // Subtle footstep tick or UI click
  public playClick() {
    this.playTone(660, 0.04, 'square', 0, 0.12);
  }

  // Pause / Resume toggle sound
  public playPauseToggle(paused: boolean) {
    if (paused) {
      this.playTone(523.25, 0.07, 'square', 0, 0.18);
      this.playTone(392.0, 0.1, 'square', 0.08, 0.18);
    } else {
      this.playTone(392.0, 0.07, 'square', 0, 0.18);
      this.playTone(523.25, 0.1, 'square', 0.08, 0.18);
    }
  }

  // Original obstacle / checkpoint reached chime
  public playCheckpoint() {
    this.playTone(440, 0.08, 'square', 0, 0.2);
    this.playTone(554.37, 0.08, 'square', 0.08, 0.2);
    this.playTone(659.25, 0.14, 'square', 0.16, 0.22);
  }

  // Retro achievement unlocked fanfare
  public playAchievement() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.28 : 0.09, 'square', idx * 0.09, 0.22);
    });
  }

  // Boss arena entry sound
  public playBossEntry() {
    const notes = [196, 185, 174.61, 164.81];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.14, 'sawtooth', idx * 0.15, 0.25);
    });
  }

  // Player dino attacks Boss (correct quiz answer)
  public playPlayerAttack() {
    this.playTone(880, 0.08, 'square', 0, 0.26, 220);
    this.playTone(587.33, 0.09, 'triangle', 0.08, 0.26, 880);
    this.playTone(1174.66, 0.16, 'square', 0.16, 0.26);
  }

  // Boss attacks Player (incorrect quiz answer)
  public playBossAttack() {
    this.playTone(150, 0.18, 'sawtooth', 0, 0.3, 65);
    this.playTone(110, 0.22, 'square', 0.12, 0.28, 55);
  }

  // Subtle firework burst sound during Victory
  public playFireworkBurst() {
    this.playTone(780, 0.06, 'triangle', 0, 0.09, 180);
    this.playTone(1120, 0.08, 'square', 0.04, 0.07, 320);
  }

  // Victory fanfare + switches BGM to celebratory victory theme
  public playVictory() {
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.13 },
      { f: 523.25, d: 0.12, t: 0.26 },
      { f: 659.25, d: 0.24, t: 0.4 },
      { f: 587.33, d: 0.14, t: 0.66 },
      { f: 659.25, d: 0.14, t: 0.82 },
      { f: 783.99, d: 0.4, t: 0.98 },
    ];
    melody.forEach((n) => {
      this.playTone(n.f, n.d, 'square', n.t, 0.24);
    });
    this.startBGM('victory', true);
  }

  // Game Over fanfare + switches BGM to defeat theme
  public playGameOver() {
    const melody = [
      { f: 392.0, d: 0.18, t: 0 },
      { f: 369.99, d: 0.18, t: 0.2 },
      { f: 349.23, d: 0.18, t: 0.4 },
      { f: 329.63, d: 0.42, t: 0.6 },
    ];
    melody.forEach((n) => {
      this.playTone(n.f, n.d, 'sawtooth', n.t, 0.24);
    });
    this.startBGM('gameover', true);
  }

  // Multi-theme retro 8-bit background soundtrack loop
  // IMPORTANT: If already playing the requested mode, do NOT reset bgmStep or restart the track!
  public startBGM(mode: BgmMode = 'runner', forceRestart: boolean = false) {
    if (!forceRestart && this.currentBgmMode === mode && this.bgmInterval !== null) {
      this.ensureContext();
      return;
    }

    const modeChanged = this.currentBgmMode !== mode;
    this.currentBgmMode = mode;
    this.stopBGM();
    if (this.sfxMuted || !this.bgmEnabled) return;

    this.ensureContext();

    // 1. Welcome Screen BGM: Catchy, cheerful 16-step retro arcade title screen melody
    const welcomeNotes = [
      { f: 392.0, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 523.25, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 659.25, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 783.99, type: 'triangle' as OscillatorType, dur: 0.22 },
      { f: 659.25, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 523.25, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 587.33, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 698.46, type: 'triangle' as OscillatorType, dur: 0.22 },
      { f: 587.33, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 493.88, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 392.0, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 493.88, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 523.25, type: 'square' as OscillatorType, dur: 0.16 },
      { f: 392.0, type: 'triangle' as OscillatorType, dur: 0.14 },
      { f: 329.63, type: 'triangle' as OscillatorType, dur: 0.14 },
      { f: 523.25, type: 'square' as OscillatorType, dur: 0.24 },
    ];

    // 2. Runner Gameplay BGM: Continuous 16-step driving adventure melody (never resets between cacti!)
    const runnerNotes = [
      { f: 220.0, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 261.63, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 329.63, type: 'square' as OscillatorType, dur: 0.12 },
      { f: 440.0, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 392.0, type: 'square' as OscillatorType, dur: 0.12 },
      { f: 329.63, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 293.66, type: 'square' as OscillatorType, dur: 0.12 },
      { f: 261.63, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 196.0, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 246.94, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 293.66, type: 'square' as OscillatorType, dur: 0.12 },
      { f: 392.0, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 329.63, type: 'square' as OscillatorType, dur: 0.12 },
      { f: 293.66, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 261.63, type: 'triangle' as OscillatorType, dur: 0.12 },
      { f: 246.94, type: 'square' as OscillatorType, dur: 0.12 },
    ];

    // 3. Boss Battle BGM: Intense fast-paced minor-key arcade tension
    const bossNotes = [
      { f: 146.83, type: 'sawtooth' as OscillatorType, dur: 0.11 },
      { f: 174.61, type: 'square' as OscillatorType, dur: 0.11 },
      { f: 220.0, type: 'sawtooth' as OscillatorType, dur: 0.11 },
      { f: 164.81, type: 'square' as OscillatorType, dur: 0.11 },
      { f: 146.83, type: 'sawtooth' as OscillatorType, dur: 0.11 },
      { f: 207.65, type: 'square' as OscillatorType, dur: 0.11 },
      { f: 196.0, type: 'sawtooth' as OscillatorType, dur: 0.11 },
      { f: 130.81, type: 'square' as OscillatorType, dur: 0.11 },
    ];

    // 4. Victory BGM: Joyful celebratory major-key chiptune march
    const victoryNotes = [
      { f: 523.25, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 659.25, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 783.99, type: 'square' as OscillatorType, dur: 0.16 },
      { f: 1046.5, type: 'triangle' as OscillatorType, dur: 0.22 },
      { f: 783.99, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 880.0, type: 'square' as OscillatorType, dur: 0.14 },
      { f: 987.77, type: 'square' as OscillatorType, dur: 0.16 },
      { f: 1046.5, type: 'square' as OscillatorType, dur: 0.24 },
    ];

    // 5. Game Over / Defeat BGM: Slow, somber descending minor cadence
    const gameOverNotes = [
      { f: 293.66, type: 'triangle' as OscillatorType, dur: 0.26 },
      { f: 261.63, type: 'triangle' as OscillatorType, dur: 0.26 },
      { f: 246.94, type: 'sawtooth' as OscillatorType, dur: 0.26 },
      { f: 220.0, type: 'triangle' as OscillatorType, dur: 0.34 },
      { f: 196.0, type: 'triangle' as OscillatorType, dur: 0.26 },
      { f: 174.61, type: 'sawtooth' as OscillatorType, dur: 0.26 },
      { f: 164.81, type: 'triangle' as OscillatorType, dur: 0.34 },
      { f: 146.83, type: 'triangle' as OscillatorType, dur: 0.4 },
    ];

    if (modeChanged || forceRestart) {
      this.bgmStep = 0;
    }

    const tempoMap: Record<BgmMode, number> = {
      welcome: 220,
      runner: 240,
      boss: 195,
      victory: 210,
      gameover: 420,
    };

    const seqMap = {
      welcome: welcomeNotes,
      runner: runnerNotes,
      boss: bossNotes,
      victory: victoryNotes,
      gameover: gameOverNotes,
    };

    // Play the first note immediately so there is zero delay
    const playStep = () => {
      if (this.sfxMuted || !this.bgmEnabled || this.volume <= 0.01) return;
      const seq = seqMap[this.currentBgmMode];
      const item = seq[this.bgmStep % seq.length];
      const gainLevel =
        this.currentBgmMode === 'welcome'
          ? 0.09
          : this.currentBgmMode === 'victory'
          ? 0.09
          : this.currentBgmMode === 'gameover'
          ? 0.08
          : 0.065;
      this.playTone(item.f, item.dur, item.type, 0, gainLevel);
      this.bgmStep++;
    };

    playStep();
    this.bgmInterval = window.setInterval(playStep, tempoMap[mode]);
  }

  public stopBGM() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new RetroSoundEngine();
