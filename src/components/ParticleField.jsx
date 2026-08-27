import { useEffect, useRef } from "react";

// Full-page particle field with depth. Particles live in a unit cube (z = 0
// far, 1 near): near ones are bigger, brighter, parallax more with the mouse,
// and the nearest render as soft out-of-focus discs. They drift up slowly
// like steam off a pot.
//
// Pressing on empty background sends out a ripple and shoves nearby particles
// away (`onSpark`). Holding and dragging draws a wave: smaller rings trail the
// pointer, particles are pushed along the path, and `onDrag(ny)` fires every
// few dozen pixels with the pointer's height (0 = top) so the page can play a
// scale that follows the hand.
//
// Fills its positioned parent. Renders once, static, under reduced motion.
const COUNT_DESKTOP = 140;
const COUNT_MOBILE = 70;
const INTERACTIVE = "a, button, input, textarea, select, label, form, [role='button']";
const DRAG_STEP = 44; // px of travel between wave rings / notes

export default function ParticleField({ onSpark, onDrag }) {
    const canvasRef = useRef(null);
    const sparkRef = useRef(onSpark);
    const dragRef = useRef(onDrag);
    sparkRef.current = onSpark;
    dragRef.current = onDrag;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const host = canvas.parentElement;
        const g = canvas.getContext("2d");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let w = 0;
        let h = 0;
        const size = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = host.clientWidth;
            h = host.clientHeight;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        size();

        const count = window.innerWidth <= 700 ? COUNT_MOBILE : COUNT_DESKTOP;
        const rnd = (a, b) => a + Math.random() * (b - a);
        const particles = Array.from({ length: count }, () => ({
            x: Math.random(),
            y: Math.random(),
            z: Math.random() ** 1.6, // most particles far away, a few close
            vx: 0,
            vy: 0,
            tw: Math.random() * Math.PI * 2, // twinkle phase
            ts: rnd(0.4, 1.4), // twinkle speed
        }));
        const ripples = [];

        // Parallax target and smoothed value, in -0.5..0.5.
        const mouse = { x: 0, y: 0 };
        const par = { x: 0, y: 0 };
        const onMove = (e) => {
            mouse.x = e.clientX / window.innerWidth - 0.5;
            mouse.y = e.clientY / window.innerHeight - 0.5;
        };

        const local = (e) => {
            const r = host.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        };

        // Push particles away from (cx, cy); `dir` biases the push along the
        // drag direction so a wave rolls with the hand.
        const shove = (cx, cy, strength, dir) => {
            for (const p of particles) {
                const px = p.x * w + par.x * p.z * 40;
                const py = p.y * h + par.y * p.z * 40;
                const dx = px - cx;
                const dy = py - cy;
                const d = Math.hypot(dx, dy) || 1;
                const reach = 180 + p.z * 120;
                if (d > reach) continue;
                const k = (1 - d / reach) * (0.35 + p.z) * strength;
                p.vx += (dx / d) * k + (dir ? dir.x * k * 0.6 : 0);
                p.vy += (dy / d) * k + (dir ? dir.y * k * 0.6 : 0);
            }
        };

        // Press / hold / drag.
        const drag = { on: false, x: 0, y: 0, travel: 0 };
        const onDown = (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            if (e.target.closest(INTERACTIVE)) return;
            const { x, y } = local(e);
            ripples.push({ x, y, t: 0, big: true });
            shove(x, y, 3.2, null);
            if (sparkRef.current) sparkRef.current();
            drag.on = true;
            drag.x = x;
            drag.y = y;
            drag.travel = 0;
            document.body.style.userSelect = "none";
        };
        const onDragMove = (e) => {
            if (!drag.on) return;
            const { x, y } = local(e);
            const dx = x - drag.x;
            const dy = y - drag.y;
            const d = Math.hypot(dx, dy);
            if (d < 1) return;
            drag.travel += d;
            drag.x = x;
            drag.y = y;
            if (drag.travel < DRAG_STEP) return;
            drag.travel = 0;
            ripples.push({ x, y, t: 0, big: false });
            shove(x, y, 1.6, { x: dx / d, y: dy / d });
            if (dragRef.current) dragRef.current(e.clientY / window.innerHeight);
        };
        const onUp = () => {
            if (!drag.on) return;
            drag.on = false;
            document.body.style.userSelect = "";
        };

        const drawParticle = (p, time) => {
            const px = p.x * w + par.x * p.z * 40;
            const py = p.y * h + par.y * p.z * 40;
            const twinkle = 0.75 + 0.25 * Math.sin(time * p.ts + p.tw);
            if (p.z > 0.82) {
                // Near and out of focus: big soft disc.
                const R = 10 + (p.z - 0.82) * 90;
                const grad = g.createRadialGradient(px, py, 0, px, py, R);
                grad.addColorStop(0, `rgba(247, 168, 224, ${0.09 * twinkle})`);
                grad.addColorStop(1, "rgba(247, 168, 224, 0)");
                g.fillStyle = grad;
                g.beginPath();
                g.arc(px, py, R, 0, Math.PI * 2);
                g.fill();
                return;
            }
            const r = 0.6 + p.z * 1.9;
            const a = (0.18 + p.z * 0.5) * twinkle;
            g.fillStyle = `rgba(250, 226, 242, ${a})`;
            g.beginPath();
            g.arc(px, py, r, 0, Math.PI * 2);
            g.fill();
        };

        const drawRipples = (dt) => {
            for (let i = ripples.length - 1; i >= 0; i--) {
                const rp = ripples[i];
                rp.t += dt;
                const life = rp.big ? 1.4 : 0.9;
                if (rp.t > life) {
                    ripples.splice(i, 1);
                    continue;
                }
                const rings = rp.big ? 2 : 1;
                for (let k = 0; k < rings; k++) {
                    const t = Math.max(0, rp.t - k * 0.18);
                    const R = (rp.big ? 14 : 6) + t * (rp.big ? 190 : 110);
                    const a =
                        Math.max(0, (rp.big ? 0.32 : 0.22) * (1 - t / (life - 0.2))) *
                        (k ? 0.5 : 1);
                    if (a <= 0) continue;
                    g.strokeStyle = `rgba(247, 168, 224, ${a})`;
                    g.lineWidth = k ? 1 : 1.5;
                    g.beginPath();
                    g.arc(rp.x, rp.y, R, 0, Math.PI * 2);
                    g.stroke();
                }
            }
        };

        const step = (dt) => {
            par.x += (mouse.x - par.x) * 0.04;
            par.y += (mouse.y - par.y) * 0.04;
            for (const p of particles) {
                // Slow rise, faster for near particles; wrap around.
                p.y -= (0.006 + p.z * 0.014) * dt;
                p.x += Math.sin(p.tw + p.y * 6) * 0.0015 * dt;
                p.x += (p.vx / w) * dt * 60;
                p.y += (p.vy / h) * dt * 60;
                p.vx *= 0.92;
                p.vy *= 0.92;
                if (p.y < -0.05) {
                    p.y = 1.05;
                    p.x = Math.random();
                }
                if (p.x < -0.05) p.x = 1.05;
                else if (p.x > 1.05) p.x = -0.05;
            }
        };

        const render = (time, dt) => {
            g.clearRect(0, 0, w, h);
            // Far to near so near discs sit on top.
            const sorted = particles.slice().sort((a, b) => a.z - b.z);
            for (const p of sorted) drawParticle(p, time);
            drawRipples(dt);
        };

        const ro = new ResizeObserver(size);
        ro.observe(host);

        if (reduced) {
            render(0, 0);
            return () => ro.disconnect();
        }

        window.addEventListener("pointermove", onMove, { passive: true });
        host.addEventListener("pointerdown", onDown);
        window.addEventListener("pointermove", onDragMove, { passive: true });
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);

        let raf = 0;
        let last = performance.now();
        const frame = (now) => {
            raf = requestAnimationFrame(frame);
            if (document.hidden) {
                last = now;
                return;
            }
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            step(dt);
            render(now / 1000, dt);
        };
        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener("pointermove", onMove);
            host.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointermove", onDragMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            document.body.style.userSelect = "";
        };
    }, []);

    return <canvas className="field-layer" ref={canvasRef} aria-hidden="true" />;
}
