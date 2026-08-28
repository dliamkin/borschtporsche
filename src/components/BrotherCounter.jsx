import { useEffect, useRef, useState } from "react";

// Easter egg: tap "Two brothers." and the count climbs - until it doesn't.
const WORDS = ["Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const SNAP_AFTER_MS = 1400; // idle time before the count gets corrected
const HOLD_MS = 2600; // how long the correction stays up

export default function BrotherCounter() {
    const [count, setCount] = useState(0); // index into WORDS
    const [correcting, setCorrecting] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const correct = () => {
        setCount(0);
        setCorrecting(true);
        timer.current = setTimeout(() => setCorrecting(false), HOLD_MS);
    };

    const bump = () => {
        if (correcting) return;
        clearTimeout(timer.current);
        const next = count + 1;
        if (next >= WORDS.length) {
            correct(); // eleven brothers is a choir
            return;
        }
        setCount(next);
        timer.current = setTimeout(correct, SNAP_AFTER_MS);
    };

    const cls = ["brother-counter", count > 0 && "is-counting", correcting && "is-correcting"]
        .filter(Boolean)
        .join(" ");

    return (
        <button type="button" className={cls} onClick={bump} aria-live="polite">
            {correcting ? "It's just two brothers." : `${WORDS[count]} brothers.`}
        </button>
    );
}
