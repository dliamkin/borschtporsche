import { useEffect, useRef, useState } from "react";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/films.css";

// Cinemadrome entries — first is the initially featured film (FILMS_PAGE_UPDATE.md).
const FILM_IDS = [
    "1ZI7aymSjnQ",
    "c-VimQslsNs",
    "L2qmDbt0nqI",
    "t1KNuu1eLzQ",
    "x7QkbvuXKRg",
    "07GK3uXglUY",
    "IK67XcaWNsg",
];

const TICKER_ITEMS = [
    "Cinemadrome official entries",
    "Gainesville FL",
    "Seven films",
    "So many friends and good times",
    "Made fast, judged by strangers",
    "Two brothers",
    "It’s just two brothers",
    "What will they do next?",
    "I don’t know, do you know?",
];

// How many times the item run is repeated in the track. The CSS keyframe
// shifts by exactly one run (-100% / TICKER_REPEATS), so these must match —
// see @keyframes ticker in films.css.
const TICKER_REPEATS = 6;

function fallbackTitle(id) {
    return `Entry 0${FILM_IDS.indexOf(id) + 1}`;
}

// Load the official YouTube IFrame API once; subsequent calls reuse the promise.
let ytApiPromise = null;
function loadYouTubeAPI() {
    if (!ytApiPromise) {
        ytApiPromise = new Promise((resolve) => {
            if (window.YT && window.YT.Player) {
                resolve(window.YT);
                return;
            }
            const prev = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prev) prev();
                resolve(window.YT);
            };
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(script);
        });
    }
    return ytApiPromise;
}

export default function Films() {
    const [featuredId, setFeaturedId] = useState(FILM_IDS[0]);
    const [titles, setTitles] = useState({});
    const [dimmed, setDimmed] = useState(false);
    const playerHostRef = useRef(null);
    const playerRef = useRef(null);

    // Real titles via oEmbed (no API key); fallback label until loaded / on error.
    useEffect(() => {
        let cancelled = false;
        FILM_IDS.forEach(async (id) => {
            try {
                const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
                    `https://www.youtube.com/watch?v=${id}`
                )}&format=json`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`oEmbed ${res.status}`);
                const data = await res.json();
                if (!cancelled) setTitles((t) => ({ ...t, [id]: data.title }));
            } catch {
                // keep the "Entry 0N" fallback
            }
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // Featured player via the YouTube IFrame API; dim the lights while playing.
    useEffect(() => {
        let cancelled = false;
        const wrapper = playerHostRef.current;
        loadYouTubeAPI().then((YT) => {
            if (cancelled || !wrapper) return;
            const host = document.createElement("div");
            wrapper.appendChild(host);
            playerRef.current = new YT.Player(host, {
                videoId: FILM_IDS[0],
                playerVars: { rel: 0 },
                events: {
                    onStateChange: (e) => {
                        // 1 PLAYING / 3 BUFFERING → dim; 2 PAUSED / 0 ENDED → lights up.
                        if (e.data === 1 || e.data === 3) setDimmed(true);
                        else if (e.data === 2 || e.data === 0) setDimmed(false);
                    },
                },
            });
        });
        return () => {
            cancelled = true;
            if (playerRef.current && typeof playerRef.current.destroy === "function") {
                playerRef.current.destroy();
            }
            playerRef.current = null;
            if (wrapper) wrapper.innerHTML = "";
        };
    }, []);

    // "Screen it": swap the tile's film into the projector (autoplays — this is
    // always a user pick), return the old featured to the grid, lights back up
    // until the new video reports playing.
    function screenIt(id) {
        setFeaturedId(id);
        setDimmed(false);
        const player = playerRef.current;
        if (player && typeof player.loadVideoById === "function") {
            player.loadVideoById(id);
        }
    }

    const featuredTitle = titles[featuredId] ?? fallbackTitle(featuredId);
    const gridFilms = FILM_IDS.filter((id) => id !== featuredId);

    return (
        <div className={`page films-page${dimmed ? " is-dim" : ""}`}>
            {/* Backdrop: the featured film's own thumbnail, blown up + blurred */}
            <div className="films-backdrop" aria-hidden="true">
                <div
                    className="films-backdrop-img"
                    style={{
                        backgroundImage: `url(https://img.youtube.com/vi/${featuredId}/maxresdefault.jpg), url(https://img.youtube.com/vi/${featuredId}/hqdefault.jpg)`,
                    }}
                />
                <div className="films-backdrop-grad" />
                <div className="films-backdrop-dim" />
            </div>

            <div className="films-dimmable">
                <Nav />
            </div>

            <main className="page-main">
                <div className="films-shell">
                    <div className="films-col">
                        <header className="films-header films-dimmable">
                            <h1 className="h1-gradient">Films</h1>
                            <p className="page-intro">
                                Our entries from Cinemadrome, Gainesville's local film competition.
                                Made fast, scored by us, judged by strangers.
                            </p>
                            <div className="films-now">Now screening · {featuredTitle}</div>
                        </header>

                        <div className="projector">
                            <div className="projector-sprocket projector-sprocket-top" />
                            <div className="projector-screen" ref={playerHostRef} />
                            <div className="projector-sprocket projector-sprocket-bottom" />
                        </div>
                    </div>
                </div>

                {/* Full-bleed: the ticker spans the whole viewport width */}
                <div className="films-ticker films-dimmable">
                    <div className="films-ticker-track">
                        {Array.from({ length: TICKER_REPEATS }, (_, rep) => (
                            <span
                                className="films-ticker-run"
                                key={rep}
                                aria-hidden={rep > 0 ? "true" : undefined}
                            >
                                {TICKER_ITEMS.map((item) => (
                                    <span className="films-ticker-item" key={item}>
                                        {item}
                                    </span>
                                ))}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="films-shell">
                    <div className="films-col">
                        <div className="films-grid">
                            {gridFilms.map((id) => (
                                <button
                                    key={id}
                                    type="button"
                                    className="film-tile films-dimmable"
                                    onClick={() => screenIt(id)}
                                >
                                    <img
                                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                        alt=""
                                    />
                                    <span className="film-tile-scrim" />
                                    <span className="film-tile-title">
                                        {titles[id] ?? fallbackTitle(id)}
                                    </span>
                                    <span className="film-tile-badge">▶ Screen it</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <div className="films-dimmable">
                <Footer />
            </div>
        </div>
    );
}
