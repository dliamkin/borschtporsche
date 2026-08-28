import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import AmbientLayers from "../components/AmbientLayers.jsx";
import ParticleField from "../components/ParticleField.jsx";
import SpotifyEmbed from "../components/SpotifyEmbed.jsx";
import BrotherCounter from "../components/BrotherCounter.jsx";
import DriveBy from "../components/DriveBy.jsx";
import BeetRain from "../components/BeetRain.jsx";
import useBeetMode from "../lib/useBeetMode.js";
import { LINKS } from "../data/links.js";
import "../styles/home.css";
import "../styles/easter-eggs.css";

// Copy for the two states of the page. Beet Mode rewrites the menu.
const COPY = {
    tagline3: " · next album simmering",
    spotify: "Listen on Spotify",
    apple: "Apple Music",
    single: "New single · feat. REDII",
    album: "The album",
    next: "Next album",
    badge: "In the works",
    caption: "No link yet - check back soon.",
    noun: "brothers",
};
const BEET_COPY = {
    tagline3: " · beets simmering",
    spotify: "Listen on Beetify",
    apple: "Apple Borscht",
    single: "New single · feat. REDDII",
    album: "The soup",
    next: "Next batch",
    badge: "In the pot",
    caption: "No ladle yet - check back soon.",
    noun: "beets",
};

export default function Home() {
    const { beet, wobbling, shaking, burst, clearBurst, onLogoTap } = useBeetMode();
    const t = beet ? BEET_COPY : COPY;

    return (
        <div className="home">
            <div className="home-bg" />
            <div className="home-scrim" />
            <AmbientLayers />
            <ParticleField />
            {beet && <BeetRain />}
            {burst && (
                <div
                    key={burst.id}
                    className="beet-splat"
                    style={{ "--x": `${burst.x}px`, "--y": `${burst.y}px` }}
                    onAnimationEnd={clearBurst}
                    aria-hidden="true"
                />
            )}

            <div className={`home-content${shaking ? " is-shaking" : ""}`}>
                <Nav />

                <div className="home-hero">
                    <img
                        className={`home-logo${wobbling ? " is-wobbling" : ""}`}
                        src="/assets/logo_no_bg.png"
                        alt="Borscht Porsche"
                        draggable="false"
                        onClick={onLogoTap}
                    />
                    <div className="home-tagline">
                        Debut album out now · new single with REDII
                        <span className="home-tagline-seg3">{t.tagline3}</span>
                    </div>
                    <div className="home-cta">
                        <a
                            className="btn btn-primary"
                            href={LINKS.spotifyAlbum}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t.spotify}
                        </a>
                        <a
                            className="btn btn-secondary"
                            href={LINKS.appleMusic}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t.apple}
                        </a>
                    </div>
                </div>

                <div className="home-release-row">
                    <div className="release-card card-single">
                        <div className="release-label">{t.single}</div>
                        <img
                            className="release-art"
                            src="/assets/single_redii.jpg"
                            alt="Single feat. REDII"
                        />
                        <SpotifyEmbed
                            src={LINKS.spotifyTrackEmbed}
                            title="Featuring REDII on Spotify"
                            height="80"
                            loading="eager"
                            compact
                        />
                    </div>

                    <div className="home-album">
                        <div className="release-label home-album-label">{t.album}</div>
                        <SpotifyEmbed
                            src={LINKS.spotifyAlbumEmbed}
                            title="Borscht Porsche album on Spotify"
                            height="410"
                            loading="eager"
                        />
                    </div>

                    <div className="release-card card-next">
                        <div className="card-next-head">
                            <div className="release-label card-next-title">{t.next}</div>
                            <div className="card-next-badge">{t.badge}</div>
                        </div>
                        <img
                            className="release-art release-art-white"
                            src="/assets/next_album_white.png"
                            alt="Next album"
                        />
                        <div className="card-next-caption">{t.caption}</div>
                    </div>
                </div>

                <DriveBy />
                <Footer>
                    <BrotherCounter noun={t.noun} />
                </Footer>
            </div>
        </div>
    );
}
