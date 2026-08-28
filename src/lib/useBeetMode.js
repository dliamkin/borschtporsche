import { useCallback, useEffect, useRef, useState } from "react";

// Easter egg: the Konami code (or five quick taps on the logo, for phones)
// toggles "Beet Mode" - the pink palette turns beet-red for the session, the
// logo wobbles, and the tagline changes. See `body.beet-mode` in easter-eggs.css.
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
    const wobbleTimer = useRef(null);
    const taps = useRef([]);

    const toggle = useCallback(() => {
        setBeet((on) => !on);
        setWobbling(true);
        clearTimeout(wobbleTimer.current);
        wobbleTimer.current = setTimeout(() => setWobbling(false), WOBBLE_MS);
    }, []);

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
        return () => {
            window.removeEventListener("keydown", onKey);
            clearTimeout(wobbleTimer.current);
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

    return { beet, wobbling, onLogoTap };
}
