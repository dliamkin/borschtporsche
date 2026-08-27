import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import { LINKS } from "../data/links.js";
import { submitContactMessage } from "../lib/contact.js";
import "../styles/contact.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Ghost inbox sources (CONTACT_PAGE_UPDATE.md, Feature 2) ----------
const FAN_MAIL = [
    "Is the Porsche real?",
    "Saw you at the Hardback. Still thinking about the trumpet part.",
    "My grandmother says your borscht is almost right.",
    "Do you do birthdays? Asking for a 40-year-old.",
    "Played the album on a road trip to Ocala. Nobody complained.",
    "The drummer waved at me once. Life-changing.",
    "Can you play a wedding in March? The bride is Ukrainian, the groom is nervous.",
    "Which one of you is the chess one?",
    "I made the beet salad. The kitchen is pink now.",
    "Please come to Tallahassee. We have a gymnasium.",
    "Is there vinyl? There should be vinyl.",
    "My kid thinks you are famous. I did not correct him.",
    "The film with the fridge made me cry, weirdly.",
    "Booking inquiry: my backyard, any Saturday, cash and pierogi.",
    "How long does the soup keep?",
    "You are the best band in Gainesville, and I have heard three.",
];

const COMPLAINTS = [
    "Smetana is non-negotiable.",
    "You forgot the dill. Again.",
    "Beets before onions? In this economy?",
    "A borscht without bone broth is a salad.",
    "The salt is missing. I checked twice.",
    "My babushka would like a word about the vinegar.",
    "Step 4 says “simmer”. It should say “whisper”.",
    "Cabbage goes in LAST. This is known.",
    "Who measures garlic in cloves? Measure in courage.",
    "The photo shows red soup. Mine is brown. Explain.",
    "No, the Porsche does not count as a vegetable.",
    "You call that a pierogi fold?",
    "Four hours? I have a band to see.",
    "Tomato paste is a cry for help.",
];

const KEYWORD_REPLIES = [
    ["booking", "We’ll bring the soup."],
    ["press", "No comment. Okay, one comment."],
    ["recipe", "The salt is not missing. It’s a choice."],
    ["chess", "The drummer accepts."],
    ["film", "Cinemadrome remembers."],
    ["borscht", "You rang?"],
    ["wedding", "We play weddings and hauntings."],
];

const SOURCES = [
    { key: "fan", label: "Fan mail" },
    { key: "jokes", label: "Dad jokes" },
    { key: "complaints", label: "Recipe complaints" },
    { key: "static", label: "Static" },
];

const CYRILLIC = "абвгдежзийклмнопрстуфхцчшщъыьэюяАБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ";

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function staticLine() {
    const len = Math.floor(rand(24, 55));
    let out = "";
    let run = 0;
    for (let i = 0; i < len; i++) {
        if (run > 2 && Math.random() < 0.18) {
            out += " ";
            run = 0;
        } else {
            out += CYRILLIC[Math.floor(Math.random() * CYRILLIC.length)];
            run++;
        }
    }
    return out;
}

// Small prefetch queue for icanhazdadjoke.com; returns null if nothing is ready.
const jokeQueue = [];
let jokeFetching = false;
function topUpJokes() {
    if (jokeFetching || jokeQueue.length >= 4) return;
    jokeFetching = true;
    fetch("https://icanhazdadjoke.com/", { headers: { Accept: "application/json" } })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d) => {
            if (d && d.joke) jokeQueue.push(d.joke);
        })
        .catch(() => {})
        .finally(() => {
            jokeFetching = false;
            if (jokeQueue.length < 4) setTimeout(topUpJokes, 400);
        });
}

const GHOST_DURATION = 5400;
const GHOST_MAX_CADENCE = 115;

// Spawn a line in the ghost layer. All letters are laid out at opacity 0 first
// so wrapping is settled, then each letter's animation starts on its own timer.
function spawnGhost(layer, text, { big = false, color, left, top, instant = false, auto = false }) {
    if (!layer) return;
    const max = big ? 70 : 160;
    const str = text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
    const line = document.createElement("div");
    line.className = `ghost-line${big ? " ghost-line-big" : ""}${instant ? " ghost-line-launch" : ""}`;
    if (auto) line.dataset.auto = "1";
    line.style.left = `${left}%`;
    line.style.top = `${top}%`;
    if (color) line.style.color = color;

    const chars = Array.from(str);
    const spans = chars.map((ch) => {
        const s = document.createElement("span");
        s.className = "ghost-ch";
        s.textContent = ch;
        line.appendChild(s);
        return s;
    });
    layer.appendChild(line);

    let delay = 0;
    spans.forEach((s, i) => {
        if (instant) {
            s.style.animationDelay = `${i * 50}ms`;
            s.classList.add("is-on");
        } else {
            delay += rand(45, GHOST_MAX_CADENCE);
            setTimeout(() => s.classList.add("is-on"), delay);
        }
    });
    const life = instant
        ? 6500 + chars.length * 50
        : GHOST_DURATION + chars.length * GHOST_MAX_CADENCE;
    setTimeout(() => line.remove(), life);
}

function spawnSteam(host, count = 1) {
    if (!host) return;
    const width = host.offsetWidth || 400;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.className = "steam-puff";
        const size = rand(14, 32);
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${rand(0.08, 0.92) * width}px`;
        p.style.setProperty("--dx", `${rand(-20, 20)}px`);
        p.style.setProperty("--dy", `${-rand(120, 200)}px`);
        const dur = rand(1.6, 2.5);
        p.style.animationDuration = `${dur}s`;
        host.appendChild(p);
        setTimeout(() => p.remove(), dur * 1000 + 50);
    }
}

const JET_HEIGHTS = [20, 23, 26, 29, 32, 34, 32, 29, 26, 23, 20];
const MAGNET_TILTS = [-3, 2.5, -1.5];

export default function Contact() {
    const [fields, setFields] = useState({ name: "", email: "", message: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle | sending | sent | error
    const [source, setSource] = useState("fan");
    const [cooking, setCooking] = useState(false);
    const [whoosh, setWhoosh] = useState(false);
    const [magnets, setMagnets] = useState(MAGNET_TILTS.map((r) => ({ r, x: 0 })));

    const ghostRef = useRef(null);
    const steamRef = useRef(null);
    const sourceRef = useRef(source);
    const firedRef = useRef(new Set());
    const idleTimer = useRef(null);
    const reducedMotion = useRef(false);

    useEffect(() => {
        reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);

    useEffect(() => {
        sourceRef.current = source;
        if (source === "jokes") topUpJokes();
    }, [source]);

    // Ghost engine: one line every ~2.4s, capped concurrency.
    useEffect(() => {
        if (reducedMotion.current) return undefined;
        const layer = ghostRef.current;
        const id = setInterval(() => {
            if (!layer) return;
            const cap = window.innerWidth <= 700 ? 3 : 6;
            if (layer.querySelectorAll("[data-auto]").length >= cap) return;

            let text;
            switch (sourceRef.current) {
                case "jokes":
                    text = jokeQueue.shift() ?? pick(FAN_MAIL);
                    topUpJokes();
                    break;
                case "complaints":
                    text = pick(COMPLAINTS);
                    break;
                case "static":
                    text = staticLine();
                    break;
                default:
                    text = pick(FAN_MAIL);
            }
            spawnGhost(layer, text, {
                big: Math.random() < 0.35,
                left: rand(3, 63),
                top: rand(8, 86),
                auto: true,
            });
        }, 2400);
        return () => clearInterval(id);
    }, []);

    // Steam wisps while cooking.
    useEffect(() => {
        if (!cooking || reducedMotion.current) return undefined;
        const id = setInterval(() => spawnSteam(steamRef.current), 900);
        return () => clearInterval(id);
    }, [cooking]);

    useEffect(() => () => clearTimeout(idleTimer.current), []);

    function touchBurner() {
        setCooking(true);
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => setCooking(false), 3000);
    }

    const setField = (key) => (e) => {
        const value = e.target.value;
        setFields((f) => ({ ...f, [key]: value }));
        setErrors((err) => ({ ...err, [key]: undefined }));
        touchBurner();
        if (key === "message") {
            const lower = value.toLowerCase();
            for (const [word, reply] of KEYWORD_REPLIES) {
                if (!firedRef.current.has(word) && lower.includes(word)) {
                    firedRef.current.add(word);
                    if (!reducedMotion.current) {
                        spawnGhost(ghostRef.current, reply, {
                            big: true,
                            color: "rgba(247,168,224,.5)",
                            left: rand(6, 34),
                            top: rand(15, 65),
                        });
                    }
                }
            }
        }
    };

    function validate() {
        const next = {};
        if (!fields.name.trim()) next.name = "Please tell us your name.";
        if (!fields.email.trim()) next.email = "Please add your email.";
        else if (!EMAIL_RE.test(fields.email.trim())) next.email = "That email doesn’t look right.";
        if (!fields.message.trim()) next.message = "Please write a message.";
        return next;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const next = validate();
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        // Order up: launch the message as a ghost, steam burst, burner whoosh then cut.
        const payload = { ...fields };
        if (!reducedMotion.current) {
            spawnGhost(ghostRef.current, payload.message, {
                color: "rgba(242,143,216,.55)",
                left: 52,
                top: 58,
                instant: true,
            });
            spawnSteam(steamRef.current, 6);
            setWhoosh(true);
            setTimeout(() => {
                setWhoosh(false);
                clearTimeout(idleTimer.current);
                setCooking(false);
            }, 650);
        }
        setFields({ name: "", email: "", message: "" });

        setStatus("sending");
        try {
            await submitContactMessage(payload);
            setStatus("sent");
            setTimeout(() => setStatus((s) => (s === "sent" ? "idle" : s)), 3000);
        } catch {
            setStatus("error");
        }
    }

    function nudgeMagnet(i) {
        setMagnets((m) => m.map((t, j) => (j === i ? { r: rand(-4, 4), x: rand(-3, 3) } : t)));
    }

    const heat = Math.min(1, fields.message.length / 240);
    const magnetLinks = [
        ["Spotify", LINKS.spotifyArtist],
        ["YouTube", LINKS.youtube],
        ["Instagram", LINKS.instagram],
    ];

    let buttonLabel = "Send message";
    if (status === "sending") buttonLabel = "Sending…";
    else if (status === "sent") buttonLabel = "Sent to the ghosts ✓";

    return (
        <div className="page contact-page">
            <div className="contact-glow" aria-hidden="true" />
            <div className="ghost-layer" ref={ghostRef} aria-hidden="true" />

            <Nav />
            <main className="page-main contact-main">
                <div className="contact-grid">
                    <div className="contact-intro">
                        <h1 className="h1-gradient">Say hi</h1>
                        <p className="page-intro">
                            Booking, press, recipe corrections, chess challenges. We read everything
                            — the ghosts behind this page are proof.
                        </p>
                        <div className="magnets">
                            {magnetLinks.map(([label, href], i) => (
                                <a
                                    key={label}
                                    className="magnet"
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        transform: `rotate(${magnets[i].r}deg) translateX(${magnets[i].x}px)`,
                                    }}
                                    onMouseEnter={() => nudgeMagnet(i)}
                                >
                                    {label} ↗
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="contact-stack">
                        <form className="contact-panel" onSubmit={handleSubmit} noValidate>
                            <div className="contact-field">
                                <label htmlFor="contact-name">Name</label>
                                <input
                                    id="contact-name"
                                    type="text"
                                    placeholder="Your name"
                                    value={fields.name}
                                    onChange={setField("name")}
                                />
                                {errors.name && <div className="contact-error">{errors.name}</div>}
                            </div>

                            <div className="contact-field">
                                <label htmlFor="contact-email">Email</label>
                                <input
                                    id="contact-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={fields.email}
                                    onChange={setField("email")}
                                />
                                {errors.email && (
                                    <div className="contact-error">{errors.email}</div>
                                )}
                            </div>

                            <div className="contact-field">
                                <label htmlFor="contact-message">Message</label>
                                <div className="contact-textarea-wrap">
                                    <div className="steam-host" ref={steamRef} aria-hidden="true" />
                                    <textarea
                                        id="contact-message"
                                        placeholder="What's on your mind?"
                                        rows={5}
                                        value={fields.message}
                                        onChange={setField("message")}
                                    />
                                </div>
                                {errors.message && (
                                    <div className="contact-error">{errors.message}</div>
                                )}
                            </div>

                            <div className="contact-submit-row">
                                <button
                                    className="btn btn-primary contact-submit"
                                    type="submit"
                                    disabled={status === "sending"}
                                >
                                    {buttonLabel}
                                </button>
                                <span className="contact-hint">
                                    psst — try typing "booking" or "borscht"
                                </span>
                            </div>

                            {status === "error" && (
                                <div className="contact-status contact-status-err">
                                    Something went wrong — try again in a minute.
                                </div>
                            )}
                        </form>

                        <div
                            className={`burner${cooking || whoosh ? " is-cooking" : ""}${whoosh ? " is-whoosh" : ""}`}
                            aria-hidden="true"
                        >
                            <div className="burner-glow" />
                            <div
                                className="burner-jets"
                                style={{
                                    transform: `scaleY(${0.65 + heat * 0.75})`,
                                    filter: `brightness(${1 + heat * 0.45})`,
                                }}
                            >
                                {JET_HEIGHTS.map((h, i) => (
                                    <span
                                        key={i}
                                        className="burner-jet"
                                        style={{
                                            height: `${h}px`,
                                            animationDuration: `${0.33 + ((i * 7) % 16) * 0.01}s`,
                                            animationDelay: `${-(i * 0.07)}s`,
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="burner-ring" />
                            <div className="burner-stem" />
                            <div className="burner-caption">your message is cooking</div>
                        </div>

                        <div className="dial">
                            <span className="dial-label">Tune the room</span>
                            {SOURCES.map((s) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    className={`dial-pill${source === s.key ? " is-active" : ""}`}
                                    onClick={() => setSource(s.key)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
