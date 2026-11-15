// All sound is generated in the browser. No samples, no copyrighted music.
// Music: one layer per theme (pads + sparse pings in that theme's mode), crossfaded on theme change.

const MODES: Record<string, { root: number; steps: number[] }> = {
  base: { root: 73.42, steps: [0, 2, 3, 5, 7, 9, 10] }, // D dorian
  orb: { root: 73.42, steps: [0, 2, 4, 6, 7, 9, 11] }, // D lydian
  moon: { root: 55, steps: [0, 3, 5, 7, 10] }, // A minor pentatonic
  mars: { root: 82.41, steps: [0, 1, 3, 5, 7, 8, 10] }, // E phrygian
  ast: { root: 65.41, steps: [0, 2, 4, 6, 8, 10] }, // C whole-tone
  deep: { root: 49, steps: [0, 7, 12, 19, 24] }, // G open fifths
};
const hz = (root: number, semis: number) => root * Math.pow(2, semis / 12);

interface Layer { id: string; gain: GainNode; stop: () => void }

class Engine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private reverb!: ConvolverNode;
  private layer: Layer | null = null;
  private theme = "base";
  private vol = { music: 0.5, sfx: 0.7, muted: false };
  private engineNodes: { src: AudioBufferSourceNode; g: GainNode } | null = null;
  private beat: ReturnType<typeof setInterval> | null = null;
  private noiseBuf: AudioBuffer | null = null;

  /** Called from the first click or key press. Browsers block audio before that. */
  start() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain();
    this.musicBus = c.createGain();
    this.sfxBus = c.createGain();
    this.reverb = c.createConvolver();
    const len = c.sampleRate * 2.8;
    const ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.reverb.buffer = ir;
    const wet = c.createGain();
    wet.gain.value = 0.5;
    this.reverb.connect(wet).connect(this.musicBus);
    this.musicBus.connect(this.master);
    this.sfxBus.connect(this.master);
    this.master.connect(c.destination);
    this.noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const nd = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    this.applyVolumes();
    this.setTheme(this.theme, true);
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  setVolumes(music: number, sfx: number, muted: boolean) {
    this.vol = { music, sfx, muted };
    this.applyVolumes();
  }
  private applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.vol.muted ? 0 : 1, t, 0.05);
    this.musicBus.gain.setTargetAtTime(this.vol.music * 0.9, t, 0.1);
    this.sfxBus.gain.setTargetAtTime(this.vol.sfx, t, 0.05);
  }

  setTheme(id: string, force = false) {
    this.theme = MODES[id] ? id : "base";
    const c = this.ctx;
    if (!c || (!force && this.layer?.id === this.theme)) return;
    const old = this.layer;
    if (old) {
      old.gain.gain.setTargetAtTime(0, c.currentTime, 0.9);
      setTimeout(old.stop, 4000);
    }
    this.layer = this.makeLayer(this.theme);
  }

  private makeLayer(id: string): Layer {
    const c = this.ctx!;
    const { root, steps } = MODES[id];
    const gain = c.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(1, c.currentTime, 1.2);
    gain.connect(this.musicBus);
    const send = c.createGain();
    send.gain.value = 0.6;
    gain.connect(send).connect(this.reverb);
    const oscs: OscillatorNode[] = [];
    const voices: OscillatorNode[][] = [];
    const chord = (k: number) => [steps[k % steps.length], steps[(k + 2) % steps.length] + 12, steps[(k + 4) % steps.length] + 12];
    chord(0).forEach((semi, i) => {
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 420 + i * 120;
      f.Q.value = 0.7;
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 0.04 + i * 0.023;
      lg.gain.value = 260;
      lfo.connect(lg).connect(f.frequency);
      lfo.start();
      const vg = c.createGain();
      vg.gain.value = 0.055;
      f.connect(vg).connect(gain);
      const pair = [-6, 7].map((det) => {
        const o = c.createOscillator();
        o.type = i === 0 ? "triangle" : "sawtooth";
        o.frequency.value = hz(root, semi);
        o.detune.value = det;
        o.connect(f);
        o.start();
        return o;
      });
      oscs.push(lfo, ...pair);
      voices.push(pair);
    });
    let k = 0;
    const chordTimer = setInterval(() => {
      k = (k + [1, 2, 3][Math.floor(Math.random() * 3)]) % steps.length;
      chord(k).forEach((semi, i) => voices[i].forEach((o) => o.frequency.setTargetAtTime(hz(root, semi), c.currentTime, 1.6)));
    }, 9000);
    const ping = () => {
      if (c.state !== "running") return;
      const o = c.createOscillator();
      const g = c.createGain();
      const semi = steps[Math.floor(Math.random() * steps.length)] + 36 + (Math.random() < 0.3 ? 12 : 0);
      o.type = "sine";
      o.frequency.value = hz(root, semi);
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(0.07, c.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, c.currentTime + 2.2);
      o.connect(g).connect(gain);
      g.connect(this.reverb);
      o.start();
      o.stop(c.currentTime + 2.3);
    };
    let pingTimer: ReturnType<typeof setTimeout>;
    const loop = () => {
      ping();
      pingTimer = setTimeout(loop, 2600 + Math.random() * 4200);
    };
    pingTimer = setTimeout(loop, 1500);
    return {
      id,
      gain,
      stop: () => {
        clearInterval(chordTimer);
        clearTimeout(pingTimer);
        oscs.forEach((o) => { try { o.stop(); } catch {} });
        gain.disconnect();
      },
    };
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, to?: number, delay = 0, bus?: AudioNode) {
    const c = this.ctx;
    if (!c || c.state !== "running") return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
    o.connect(g).connect(bus ?? this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  private noise(dur: number, vol: number, freq: number, type: BiquadFilterType = "bandpass", delay = 0) {
    const c = this.ctx;
    if (!c || c.state !== "running" || !this.noiseBuf) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0006, t + dur);
    s.connect(f).connect(g).connect(this.sfxBus);
    s.start(t);
    s.stop(t + dur + 0.02);
  }

  // Effects
  tick() { this.tone(1400, 0.04, "sine", 0.08); }
  chirp() { const f = 600 + Math.random() * 1100; this.tone(f, 0.05, "square", 0.022, f * (0.7 + Math.random() * 0.8)); }
  snap() { this.noise(0.05, 0.3, 2600, "highpass"); this.tone(320, 0.09, "triangle", 0.22, 150); this.tone(1900, 0.12, "sine", 0.06, undefined, 0.03); }
  wrong() { this.tone(190, 0.16, "sawtooth", 0.08, 120); }
  geiger() { this.noise(0.012, 0.35, 4200, "highpass"); }
  static(dur = 0.5) { this.noise(dur, 0.12, 1800, "bandpass"); }
  thud() { this.tone(90, 0.28, "sine", 0.4, 38); this.noise(0.2, 0.18, 300, "lowpass"); }
  /** A swelling cue for discoveries, in the current mode. */
  discovery() {
    const { root, steps } = MODES[this.theme];
    [0, 2, 4].forEach((d, i) => this.tone(hz(root, steps[d % steps.length] + 24), 1.4, "sine", 0.09, undefined, i * 0.13, this.musicBus));
  }
  /** Short motif for mission complete. */
  complete() {
    const { root, steps } = MODES[this.theme];
    [0, 2, 1, 4].forEach((d, i) => this.tone(hz(root, steps[d % steps.length] + (i === 3 ? 36 : 24)), i === 3 ? 1.8 : 0.35, "triangle", 0.11, undefined, i * 0.22, this.musicBus));
  }
  engine(on: boolean) {
    const c = this.ctx;
    if (!c || !this.noiseBuf) return;
    if (on && !this.engineNodes) {
      const src = c.createBufferSource();
      src.buffer = this.noiseBuf;
      src.loop = true;
      const f = c.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 240;
      const g = c.createGain();
      g.gain.value = 0;
      g.gain.setTargetAtTime(0.5, c.currentTime, 0.04);
      src.connect(f).connect(g).connect(this.sfxBus);
      src.start();
      this.engineNodes = { src, g };
    } else if (!on && this.engineNodes) {
      const { src, g } = this.engineNodes;
      g.gain.setTargetAtTime(0, c.currentTime, 0.06);
      src.stop(c.currentTime + 0.4);
      this.engineNodes = null;
    }
  }
  /** Low heartbeat under the Last Signal screen. */
  heartbeat(on: boolean) {
    if (this.beat) clearInterval(this.beat);
    this.beat = null;
    if (!on) return;
    const b = () => { this.tone(58, 0.22, "sine", 0.3, 40, 0, this.musicBus); this.tone(52, 0.26, "sine", 0.22, 36, 0.28, this.musicBus); };
    b();
    this.beat = setInterval(b, 1700);
  }
}

export const audio = new Engine();
