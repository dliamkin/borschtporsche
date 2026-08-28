import { useEffect, useRef, useState } from "react";
import { unlock, playHonk } from "../lib/synth.js";

// Easter egg: once per session, a while after the home page loads, a faint
// little Porsche drives along the footer hairline. Tap it and it honks and
// floors it. Skipped under reduced motion.
const DEFAULT_DELAY_MS = 90_000;
const STORAGE_KEY = "bp-driveby-done";
const DELAY_KEY = "bp-driveby-delay"; // set in sessionStorage to test without waiting
export const TRIGGER_EVENT = "bp:driveby"; // dispatch on window to summon the car now

const alreadyDone = () => {
    try {
        return sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
};
const delayMs = () => {
    try {
        return Number(sessionStorage.getItem(DELAY_KEY)) || DEFAULT_DELAY_MS;
    } catch {
        return DEFAULT_DELAY_MS;
    }
};
const markDone = () => {
    try {
        sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
        /* no storage - it will just drive by again next visit */
    }
};

export default function DriveBy() {
    const [phase, setPhase] = useState("idle"); // idle | driving | fleeing | done
    const laneRef = useRef(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

        // Anything on the page can summon the car (Beet Mode does) - this ignores
        // the once-per-session flag, but won't interrupt a drive already underway.
        const onSummon = () =>
            setPhase((p) => (p === "driving" || p === "fleeing" ? p : "driving"));
        window.addEventListener(TRIGGER_EVENT, onSummon);

        const t = alreadyDone() ? null : setTimeout(() => setPhase("driving"), delayMs());
        return () => {
            window.removeEventListener(TRIGGER_EVENT, onSummon);
            if (t) clearTimeout(t);
        };
    }, []);

    const finish = () => {
        markDone();
        setPhase("done");
    };

    const onTap = async () => {
        if (phase !== "driving") return;
        // Freeze the lane where it is so the flee starts from the car's current spot.
        const lane = laneRef.current;
        if (lane) {
            const x =
                lane.getBoundingClientRect().left - lane.parentElement.getBoundingClientRect().left;
            lane.style.animation = "none";
            lane.style.transform = `translateX(${x}px)`;
        }
        setPhase("fleeing");
        if (await unlock()) playHonk();
    };

    if (phase === "idle" || phase === "done") return null;

    return (
        <div className="driveby" aria-hidden="true">
            <div
                ref={laneRef}
                className="driveby-lane"
                onAnimationEnd={phase === "driving" ? finish : undefined}
            >
                <button
                    type="button"
                    className={`driveby-car${phase === "fleeing" ? " is-fleeing" : ""}`}
                    onClick={onTap}
                    onAnimationEnd={phase === "fleeing" ? finish : undefined}
                    tabIndex={-1}
                >
                    <svg viewBox="0 0 120 40" width="96" height="32">
                        {/* 911-ish silhouette: low nose, long roofline sloping into the tail */}
                        <path
                            fill="currentColor"
                            d="M4 27 C4 22 8 20 14 19 L26 17 C34 9 46 6 60 6 C74 6 86 9 96 15 L110 18 C115 19 117 22 117 26 L117 29 L4 29 Z"
                        />
                        <path
                            fill="var(--page-black)"
                            d="M32 17 C38 11 48 9 58 9 L58 17 Z M62 9 C72 9 80 11 88 16 L62 16 Z"
                        />
                        <circle cx="26" cy="29" r="6.5" fill="currentColor" />
                        <circle cx="94" cy="29" r="6.5" fill="currentColor" />
                        <circle cx="26" cy="29" r="2.5" fill="var(--page-black)" />
                        <circle cx="94" cy="29" r="2.5" fill="var(--page-black)" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
