// Tiny WebAudio synth for the contact page.
//
// Every letter typed into the message box is a note on a minor pentatonic
// scale (so anything you type sounds like a tune, never a wrong note), spaces
// and punctuation are rests, and on send the whole message plays back as a
// melody. Nothing here makes a sound until `unlock()` runs from a user
// gesture - browsers require that, and nobody should be ambushed by audio.

let ctx = null;
let master = null;

const ROOT = 196; // G3
// Minor pentatonic over two octaves, in semitones from the root.
const SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22];

export function isSupported() {
    return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
}

function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0.3;
    master.connect(ctx.destination);

    // A soft feedback delay so single notes bloom into the room.
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.28;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.34;
    const darken = ctx.createBiquadFilter();
    darken.type = "lowpass";
    darken.frequency.value = 1800;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    master.connect(delay);
    delay.connect(darken);
    darken.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(ctx.destination);
    return ctx;
}

// Call from a click/keypress handler once; resumes the context.
export async function unlock() {
    if (!isSupported()) return false;
    const c = ensure();
    if (c.state === "suspended") await c.resume();
    return c.state === "running";
}

export function noteForChar(ch) {
    if (!/[a-z0-9]/i.test(ch)) return null; // rests
    const code = ch.toLowerCase().charCodeAt(0);
    const semis = SCALE[code % SCALE.length];
    return ROOT * 2 ** (semis / 12);
}

export function playNote(freq, { at = 0, dur = 0.42, vel = 0.5, out = null } = {}) {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + at;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = freq * 2.003; // slightly detuned octave
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.25;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 2;
    filter.frequency.setValueAtTime(Math.min(freq * 6, 9000), t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.1, 200), t + dur);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(filter);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(filter);
    filter.connect(env);
    env.connect(out || master);

    osc.start(t);
    shimmer.start(t);
    osc.stop(t + dur + 0.05);
    shimmer.stop(t + dur + 0.05);
}

// Play `text` as a sequence, never longer than `total` seconds: long messages
// play faster (down to `minStep`), anything past that is dropped, and the
// tail fades out so it never just stops. Returns the length in seconds.
export function playMelody(text, { total = 3.6, maxStep = 0.095, minStep = 0.05 } = {}) {
    if (!ctx || ctx.state !== "running") return 0;
    const chars = Array.from(text).slice(0, Math.floor(total / minStep));
    const step = Math.min(maxStep, Math.max(minStep, total / Math.max(1, chars.length)));
    const length = Math.min(total, chars.length * step);

    const bus = ctx.createGain();
    bus.connect(master);
    const t0 = ctx.currentTime;
    bus.gain.setValueAtTime(1, t0);
    bus.gain.setValueAtTime(1, t0 + Math.max(0, length - 1.2));
    bus.gain.linearRampToValueAtTime(0.0001, t0 + length + 0.3);

    chars.forEach((ch, i) => {
        const f = noteForChar(ch);
        if (f) playNote(f, { at: i * step, dur: 0.5, vel: 0.42, out: bus });
    });
    return length;
}

// Drag-to-play: pitch follows the pointer's height (ny: 0 = top = high).
// Repeated calls at the same height alternate a step up so a sideways drag
// still arpeggiates instead of hammering one note.
let lastDegree = -1;
let lastDragAt = 0;
export function playAtHeight(ny) {
    if (!ctx || ctx.state !== "running") return;
    const top = SCALE.length - 1;
    let i = Math.round((1 - Math.min(1, Math.max(0, ny))) * top);
    if (i === lastDegree) i = i >= top ? i - 1 : i + 1;
    lastDegree = i;
    // Don't let very fast drags pile notes on top of each other.
    const now = ctx.currentTime;
    if (now - lastDragAt < 0.045) return;
    lastDragAt = now;
    playNote(ROOT * 2 ** (SCALE[i] / 12 + 1), { dur: 0.38, vel: 0.22 });
}

// A little two-note spark for clicks on the background: a random note from
// the top of the scale and a step above it, high and quiet.
export function playSpark() {
    if (!ctx || ctx.state !== "running") return;
    const i = 4 + Math.floor(Math.random() * (SCALE.length - 5));
    const a = ROOT * 2 * 2 ** (SCALE[i] / 12);
    const b = ROOT * 2 * 2 ** (SCALE[i + 1] / 12);
    playNote(a, { dur: 0.3, vel: 0.2 });
    playNote(b, { at: 0.09, dur: 0.45, vel: 0.16 });
}

// Filtered noise sweep - the flames whooshing out on send.
export function playWhoosh() {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const len = 0.9;
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 0.35);
    bp.frequency.exponentialRampToValueAtTime(400, t + len);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.35, t + 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, t + len);

    src.connect(bp);
    bp.connect(env);
    env.connect(master);
    src.start(t);
    src.stop(t + len);
}

// Two short beep-beep horn honks - the drive-by Porsche on the home page.
export function playHonk() {
    if (!ctx || ctx.state !== "running") return;
    const honk = (at, dur) => {
        const t = ctx.currentTime + at;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
        env.gain.setValueAtTime(0.5, t + dur - 0.04);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 1400;
        // A real horn is two notes a third apart, slightly out of tune with each other.
        for (const f of [415, 523]) {
            const osc = ctx.createOscillator();
            osc.type = "square";
            osc.frequency.value = f;
            osc.detune.value = 6;
            osc.connect(lp);
            osc.start(t);
            osc.stop(t + dur + 0.05);
        }
        lp.connect(env);
        env.connect(master);
    };
    honk(0, 0.16);
    honk(0.24, 0.22);
}
