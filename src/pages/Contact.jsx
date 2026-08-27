import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import { LINKS } from "../data/links.js";
import { submitContactMessage } from "../lib/contact.js";
import "../styles/contact.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Ghost inbox sources ----------
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
    "Which brother does the bass? It sounds like an argument.",
    "Played track 3 at 2am. The neighbors are fans now.",
    "Is that a real Juno or a plugin? Be honest.",
    "Sounds like Röyksopp took a wrong turn at the Waffle House.",
    "My cat only sleeps to the second album. Please release a third.",
    "Do you sell the synth patches? I’ll trade you dill.",
    "The bridge in that one song. You know the one.",
    "Two brothers, one DAW. How has nobody been hurt?",
    "I heard the arpeggio in a dream. Then I woke up and it was your song.",
    "Please score my life. It is mostly driving.",
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
    "Beets should be roasted, not boiled. I will die on this hill.",
    "You said “a pinch”. My pinch is bigger than your pinch.",
    "The recipe never says when to cry.",
    "Sour cream is not smetana and you know it.",
    "Instructions unclear. Kitchen is a synth now.",
    "Simmer for 40 minutes? At what BPM?",
    "There is no such thing as too much dill. There is such a thing as your amount.",
    "My soup came out in 4/4. Yours is clearly in 7/8.",
];

const KEYWORD_REPLIES = [
    ["booking", "We’ll bring the soup."],
    ["press", "No comment. Okay, one comment."],
    ["recipe", "The salt is not missing. It’s a choice."],
    ["chess", "The drummer accepts."],
    ["film", "Cinemadrome remembers."],
    ["borscht", "You rang?"],
    ["wedding", "We play weddings and hauntings."],
    ["synth", "Analog. Mostly. Don’t ask."],
    ["brother", "Which one? The wrong one, probably."],
    ["remix", "Send stems. We’ll bring dill."],
    ["show", "The gymnasium is under consideration."],
    ["vinyl", "There should be vinyl."],
    ["gainesville", "We know. We live here."],
    ["love", "Careful. We bruise like beets."],
    ["soup", "Always."],
    ["dill", "Finally, someone gets it."],
];

const SOURCES = [
    { key: "fan", label: "Fan mail" },
    { key: "jokes", label: "Dad jokes" },
    { key: "complaints", label: "Recipe complaints" },
];

const rand = (min, max) => min + Math.random() * (max - min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

const LAUNCH_HOLD = 120; // ms the launched message stays intact before dissolving
const LAUNCH_STAGGER = 26; // ms between letters dissolving
const LAUNCH_LETTER = 1100; // ms one letter takes to dissolve
const DISSOLVE_MS = 1000; // the form panel smoking away
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Spawn a line in a ghost layer. All letters are laid out at opacity 0 first
// so wrapping is settled, then each letter's animation starts on its own timer.
// `left`/`top` are percentages of the layer; `style` sets arbitrary px placement
// (right/width/padding...) for lines anchored to real elements.
function spawnGhost(
    layer,
    text,
    { size, color, left, top, style, className = "", instant = false, auto = false }
) {
    if (!layer) return;
    const max = instant ? 400 : 120;
    const str = text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
    const line = document.createElement("div");
    line.className = `ghost-line${instant ? " ghost-line-launch" : ""}${className ? " " + className : ""}`;
    if (auto) line.dataset.auto = "1";
    if (size) line.style.setProperty("--gs", String(size));
    if (left != null) line.style.left = `${left}%`;
    if (top != null) line.style.top = `${top}%`;
    if (style) Object.assign(line.style, style);
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
            // Whole line lifts off intact, then letters dissolve one after another.
            s.style.animationDelay = `${LAUNCH_HOLD + i * LAUNCH_STAGGER}ms`;
            s.classList.add("is-off");
        } else {
            delay += rand(45, GHOST_MAX_CADENCE);
            setTimeout(() => s.classList.add("is-on"), delay);
        }
    });
    const life = instant
        ? LAUNCH_HOLD + chars.length * LAUNCH_STAGGER + LAUNCH_LETTER + 200
        : GHOST_DURATION + chars.length * GHOST_MAX_CADENCE;
    setTimeout(() => line.remove(), life);
}

// Rect of `el` in the coordinate space of `page` (the ghost layers fill it).
function rectIn(page, el) {
    const p = page.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { left: r.left - p.left, top: r.top - p.top, width: r.width, height: r.height };
}

// Wisps curl off the top edge of the message box. `burst` = the big puff on send.
function spawnSteam(host, count = 1, burst = false) {
    if (!host) return;
    const width = host.offsetWidth || 400;
    for (let i = 0; i < count; i++) {
        const p = document.createElement("span");
        p.className = `steam-puff${burst ? " steam-puff-burst" : ""}`;
        const w = burst ? rand(34, 64) : rand(16, 30);
        p.style.width = `${w}px`;
        p.style.height = `${burst ? w * rand(0.9, 1.3) : w * rand(1.8, 2.8)}px`;
        p.style.left = `${rand(0.06, 0.94) * width}px`;
        const sway = rand(10, 26) * (Math.random() < 0.5 ? -1 : 1);
        p.style.setProperty("--sx", `${sway}px`);
        p.style.setProperty("--dx", `${sway * rand(-0.4, 0.6)}px`);
        p.style.setProperty("--dy", `${-(burst ? rand(150, 260) : rand(90, 150))}px`);
        p.style.setProperty("--rot", `${rand(-14, 14)}deg`);
        const dur = burst ? rand(1.4, 2.2) : rand(2.2, 3.2);
        p.style.animationDuration = `${dur}s`;
        p.style.animationDelay = `${burst ? rand(0, 180) : 0}ms`;
        host.appendChild(p);
        setTimeout(() => p.remove(), dur * 1000 + 250);
    }
}

const JET_HEIGHTS = [20, 23, 26, 29, 32, 34, 32, 29, 26, 23, 20];
// Mixer channels under "Say hi": each outbound link is a fader with a meter
// that comes alive on hover. Bar heights are fixed per channel so the idle
// state looks like a paused mix, not a random pile.
const CHANNEL_METERS = [
    [40, 70, 55, 90, 62],
    [65, 45, 85, 50, 72],
    [50, 80, 42, 66, 88],
];

export default function Contact() {
    const [fields, setFields] = useState({ name: "", email: "", message: "" });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("idle"); // idle | sending | sent | error
    const [sendError, setSendError] = useState("");
    // Honeypot - hidden from people, catnip for bots. See src/lib/contact.js.
    const [botcheck, setBotcheck] = useState("");
    const [source, setSource] = useState("fan");
    const [cooking, setCooking] = useState(false);
    const [whoosh, setWhoosh] = useState(false); // flames flare out on send
    const [cut, setCut] = useState(false); // ...then the gas is cut
    const [dissolving, setDissolving] = useState(false); // form smoking away after send

    const pageRef = useRef(null);
    const ghostRef = useRef(null); // behind the content: ambient inbox
    const frontRef = useRef(null); // above the form: replies + the launched message
    const steamRef = useRef(null);
    const textareaRef = useRef(null);
    const panelRef = useRef(null);
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
                default:
                    text = pick(FAN_MAIL);
            }
            // Long lines lean small so they wrap into a block rather than a wall.
            const size = text.length > 60 ? rand(20, 30) : rand(22, 46);
            spawnGhost(layer, text, {
                size,
                left: rand(3, 63),
                top: rand(8, 86),
                auto: true,
            });
        }, 2400);
        return () => clearInterval(id);
    }, []);

    // Steam wisps while cooking (mmmmmm, borscht).
    useEffect(() => {
        if (!cooking || reducedMotion.current) return undefined;
        const id = setInterval(
            () => spawnSteam(steamRef.current, Math.random() < 0.35 ? 2 : 1),
            700
        );
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
        setStatus((s) => (s === "error" ? "idle" : s));
        touchBurner();
        if (key === "message") {
            const lower = value.toLowerCase();
            for (const [word, reply] of KEYWORD_REPLIES) {
                if (!firedRef.current.has(word) && lower.includes(word)) {
                    firedRef.current.add(word);
                    if (!reducedMotion.current) spawnReply(reply);
                }
            }
        }
    };

    // The form talks back: a reply floats up beside the message box (above the
    // form on narrow layouts), styled apart from the ambient inbox.
    function spawnReply(reply) {
        const page = pageRef.current;
        const panel = panelRef.current;
        const box = textareaRef.current;
        if (!page || !panel || !box) return;
        const p = rectIn(page, panel);
        const b = rectIn(page, box);
        const narrow = window.innerWidth <= 700 || p.left < 260;
        // Narrow: the reply rises out of the burner just under the form.
        const style = narrow
            ? {
                  left: `${p.left}px`,
                  width: `${p.width}px`,
                  top: `${p.top + p.height + 12}px`,
                  textAlign: "center",
              }
            : {
                  right: `${page.clientWidth - p.left + 22}px`,
                  width: `${Math.min(360, p.left - 44)}px`,
                  top: `${b.top + rand(-30, 40)}px`,
                  textAlign: "right",
              };
        spawnGhost(frontRef.current, reply, {
            className: `ghost-line-reply${narrow ? " ghost-line-reply-narrow" : ""}`,
            style,
        });
    }

    // Send = launch: the typed message lifts off the textarea, floats up and
    // dissolves letter by letter.
    function launchMessage(message) {
        const page = pageRef.current;
        const box = textareaRef.current;
        if (!page || !box) return;
        const b = rectIn(page, box);
        const cs = getComputedStyle(box);
        spawnGhost(frontRef.current, message, {
            instant: true,
            style: {
                left: `${b.left}px`,
                top: `${b.top}px`,
                width: `${b.width}px`,
                padding: cs.padding,
                font: cs.font,
                lineHeight: cs.lineHeight,
            },
        });
    }

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

        // Order up: the message leaves the kitchen as a ghost, steam puffs up,
        // the flames whoosh out and then the gas is cut.
        const payload = { ...fields };
        if (!reducedMotion.current) {
            launchMessage(payload.message);
            spawnSteam(steamRef.current, 7, true);
            clearTimeout(idleTimer.current);
            setCooking(true);
            setWhoosh(true);
            setTimeout(() => {
                setWhoosh(false);
                setCut(true);
                setCooking(false);
                setTimeout(() => setCut(false), 700);
            }, 520);
        }
        setFields({ name: "", email: "", message: "" });

        // The form itself smokes away while the message is in flight; the
        // confirmation only replaces it once both are done.
        setStatus("sending");
        setSendError("");
        setDissolving(true);
        if (!reducedMotion.current) {
            setTimeout(() => spawnSteam(steamRef.current, 5, true), 350);
        }
        try {
            await Promise.all([
                submitContactMessage({ ...payload, botcheck }),
                delay(reducedMotion.current ? 0 : DISSOLVE_MS),
            ]);
            setStatus("sent");
        } catch (err) {
            // Put the message back in the box so nothing typed is lost.
            setFields(payload);
            setSendError(err?.message ?? "");
            setStatus("error");
        } finally {
            setDissolving(false);
        }
    }

    function resetForm() {
        setFields({ name: "", email: "", message: "" });
        setErrors({});
        setSendError("");
        setStatus("idle");
    }

    const heat = whoosh ? 1 : Math.min(1, fields.message.length / 240);
    const channels = [
        ["Spotify", LINKS.spotifyArtist, "Listen"],
        ["YouTube", LINKS.youtube, "Watch"],
        ["Instagram", LINKS.instagram, "Follow"],
    ];

    const buttonLabel = status === "sending" ? "Sending…" : "Send message";

    return (
        <div className="page contact-page" ref={pageRef}>
            <div className="contact-glow" aria-hidden="true" />
            <div className="ghost-layer" ref={ghostRef} aria-hidden="true" />
            <div className="ghost-layer ghost-layer-front" ref={frontRef} aria-hidden="true" />

            <Nav />
            <main className="page-main contact-main">
                <div className="contact-grid">
                    <div className="contact-intro">
                        <h1 className="h1-gradient">Say hi</h1>
                        <p className="page-intro">
                            Booking, press, recipe corrections, chess challenges. We read everything
                            - the messages drifting behind this page are proof.
                        </p>
                        <div className="channels" aria-label="Find us elsewhere">
                            {channels.map(([label, href, verb], i) => (
                                <a
                                    key={label}
                                    className="channel"
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <span className="channel-meter" aria-hidden="true">
                                        {CHANNEL_METERS[i].map((h, j) => (
                                            <span
                                                key={j}
                                                className="channel-bar"
                                                style={{
                                                    height: `${h}%`,
                                                    animationDelay: `${-(j * 0.13 + i * 0.07)}s`,
                                                }}
                                            />
                                        ))}
                                    </span>
                                    <span className="channel-text">
                                        <span className="channel-verb">{verb}</span>
                                        <span className="channel-label">{label} ↗</span>
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="contact-stack">
                        {status === "sent" ? (
                            <div
                                className="contact-panel contact-sent"
                                ref={panelRef}
                                role="status"
                            >
                                <div className="contact-sent-mark" aria-hidden="true">
                                    ✓
                                </div>
                                <h2 className="contact-sent-title">Order up.</h2>
                                <p className="contact-sent-text">
                                    Your message is on the stove. We read everything, and we’ll
                                    write back to the email you left.
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-primary contact-submit"
                                    onClick={resetForm}
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form
                                className={`contact-panel${dissolving ? " is-dissolving" : ""}`}
                                ref={panelRef}
                                onSubmit={handleSubmit}
                                noValidate
                            >
                                <div className="contact-field">
                                    <label htmlFor="contact-name">Name</label>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        placeholder="Your name"
                                        value={fields.name}
                                        onChange={setField("name")}
                                    />
                                    {errors.name && (
                                        <div className="contact-error">{errors.name}</div>
                                    )}
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
                                        <div
                                            className="steam-host"
                                            ref={steamRef}
                                            aria-hidden="true"
                                        />
                                        <textarea
                                            id="contact-message"
                                            ref={textareaRef}
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

                                <input
                                    className="contact-botcheck"
                                    type="text"
                                    name="botcheck"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    value={botcheck}
                                    onChange={(e) => setBotcheck(e.target.value)}
                                />

                                <div className="contact-submit-row">
                                    <button
                                        className="btn btn-primary contact-submit"
                                        type="submit"
                                        disabled={status === "sending"}
                                    >
                                        {buttonLabel}
                                    </button>
                                    <span className="contact-hint">
                                        psst - try typing "booking" or "borscht"
                                    </span>
                                </div>

                                <div className="contact-status-slot" aria-live="polite">
                                    {status === "error" && (
                                        <div className="contact-status contact-status-err">
                                            Something went wrong - try again in a minute.
                                            {sendError && (
                                                <span className="contact-status-detail">
                                                    {sendError}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </form>
                        )}

                        <div
                            className={`burner${cooking || whoosh ? " is-cooking" : ""}${whoosh ? " is-whoosh" : ""}${cut ? " is-cut" : ""}`}
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
