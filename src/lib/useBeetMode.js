import { useCallback, useEffect, useRef, useState } from "react";
import { TRIGGER_EVENT } from "../components/DriveBy.jsx";
import { BURST_EVENT } from "../components/ParticleField.jsx";
import { unlock, playHonk } from "./synth.js";

// Easter egg: the Konami code (or five quick taps on the logo, for phones)
// toggles "Beet Mode". The palette goes beet-red site-wide, the home page gets
// a splat / shake / particle blast on arrival, the copy changes, beets rain,
// and the Porsche does a lap. See easter-eggs.css for the visuals.
const KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
];
const TAPS_NEEDED = 5;
const TAP_WINDOW_MS = 1800;
const WOBBLE_MS = 900;
const SHAKE_MS = 500;
const STORAGE_KEY = "bp-beet-mode";

const readStored = () => {
    try {
        return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
};

export default function useBeetMode() {
    const [beet, setBeet] = useState(readStored);
    const [wobbling, setWobbling] = useState(false);
    const [shaking, setShaking] = useState(false);
    // { id, x, y } in viewport px - where the splat expands from. null = none.
    const [burst, setBurst] = useState(null);
    const timers = useRef({});
    const taps = useRef([]);

    const toggle = useCallback(() => {
        setBeet((on) => !on);

        // Everything radiates from the logo (or the viewport centre if it's off-screen).
        const logo = document.querySelector(".home-logo")?.getBoundingClientRect();
        const onScreen = logo && logo.bottom > 0 && logo.top < window.innerHeight;
        const x = onScreen ? logo.left + logo.width / 2 : window.innerWidth / 2;
        const y = onScreen ? logo.top + logo.height / 2 : window.innerHeight / 2;

        setBurst({ id: Date.now(), x, y });
        window.dispatchEvent(new CustomEvent(BURST_EVENT, { detail: { x, y, strength: 7 } }));
        window.dispatchEvent(new Event(TRIGGER_EVENT)); // the Porsche does a lap
        unlock().then((ok) => ok && playHonk());

        setWobbling(true);
        setShaking(true);
        clearTimeout(timers.current.wobble);
        clearTimeout(timers.current.shake);
        timers.current.wobble = setTimeout(() => setWobbling(false), WOBBLE_MS);
        timers.current.shake = setTimeout(() => setShaking(false), SHAKE_MS);
    }, []);

    const clearBurst = useCallback(() => setBurst(null), []);

    // Mirror state onto <body> so the token overrides apply site-wide, and
    // remember it for the session so it survives navigating between pages.
    useEffect(() => {
        document.body.classList.toggle("beet-mode", beet);
        try {
            sessionStorage.setItem(STORAGE_KEY, beet ? "1" : "0");
        } catch {
            /* storage unavailable - beet mode just won't persist */
        }
    }, [beet]);

    // Konami code listener.
    useEffect(() => {
        let pos = 0;
        const onKey = (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            if (key === KONAMI[pos]) pos += 1;
            else pos = key === KONAMI[0] ? 1 : 0;
            if (pos === KONAMI.length) {
                pos = 0;
                toggle();
            }
        };
        window.addEventListener("keydown", onKey);
        const t = timers.current;
        return () => {
            window.removeEventListener("keydown", onKey);
            clearTimeout(t.wobble);
            clearTimeout(t.shake);
        };
    }, [toggle]);

    // Five taps on the logo inside the window - the touchscreen Konami code.
    const onLogoTap = useCallback(() => {
        const now = Date.now();
        taps.current = taps.current.filter((t) => now - t < TAP_WINDOW_MS);
        taps.current.push(now);
        if (taps.current.length >= TAPS_NEEDED) {
            taps.current = [];
            toggle();
        }
    }, [toggle]);

    return { beet, wobbling, shaking, burst, clearBurst, onLogoTap };
}
