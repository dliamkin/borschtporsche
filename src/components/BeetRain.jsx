import { useMemo } from "react";

// Beet Mode: a handful of beet silhouettes drift down the page at low
// opacity, like the ghost inbox on Contact but vegetables. Pure CSS motion;
// each beet gets its own lane, delay, speed, size and sway from a one-time
// random draw so the pattern doesn't look tiled.
const COUNT_DESKTOP = 9;
const COUNT_MOBILE = 6;

function Beet() {
    return (
        <svg viewBox="0 0 40 60" aria-hidden="true">
            {/* leaves */}
            <path
                className="beet-leaf"
                d="M20 23 C18 13 14 7 7 4 C11 12 15 19 20 23 Z M20 23 C20 12 22 5 26 0 C27 10 24 18 20 23 Z M20 23 C24 15 30 11 35 11 C31 15 26 21 20 23 Z"
            />
            {/* root */}
            <path
                className="beet-root"
                d="M20 22 C30 22 34 32 30 44 C26 54 22 59 20 59 C18 59 14 54 10 44 C6 32 10 22 20 22 Z"
            />
            {/* rings */}
            <path className="beet-ring" d="M14 32 C18 30 22 30 26 32 M13 40 C17 38 23 38 27 40" />
        </svg>
    );
}

export default function BeetRain() {
    const beets = useMemo(() => {
        const count = window.innerWidth <= 700 ? COUNT_MOBILE : COUNT_DESKTOP;
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: 4 + Math.random() * 92, // vw
            size: 22 + Math.random() * 26, // px wide
            delay: -(Math.random() * 14), // negative: already mid-fall on mount
            dur: 11 + Math.random() * 9, // s
            sway: 14 + Math.random() * 30, // px
            spin: (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 18), // deg
        }));
    }, []);

    return (
        <div className="beet-rain" aria-hidden="true">
            {beets.map((b) => (
                <div
                    key={b.id}
                    className="beet-drop"
                    style={{
                        left: `${b.x}vw`,
                        width: `${b.size}px`,
                        animationDelay: `${b.delay}s, ${b.delay}s`,
                        animationDuration: `${b.dur}s, ${b.dur / 3}s`,
                        "--sway": `${b.sway}px`,
                        "--spin": `${b.spin}deg`,
                    }}
                >
                    <Beet />
                </div>
            ))}
        </div>
    );
}
