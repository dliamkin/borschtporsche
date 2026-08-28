import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import AmbientLayers from "../components/AmbientLayers.jsx";
import ParticleField from "../components/ParticleField.jsx";
import SpotifyEmbed from "../components/SpotifyEmbed.jsx";
import BrotherCounter from "../components/BrotherCounter.jsx";
import DriveBy from "../components/DriveBy.jsx";
import useBeetMode from "../lib/useBeetMode.js";
import { LINKS } from "../data/links.js";
import "../styles/home.css";
import "../styles/easter-eggs.css";

export default function Home() {
    const { beet, wobbling, onLogoTap } = useBeetMode();

    return (
        <div className="home">
            <div className="home-bg" />
            <div className="home-scrim" />
            <AmbientLayers />
            <ParticleField />

            <div className="home-content">
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
                        <span className="home-tagline-seg3">
                            {beet ? " · beets simmering" : " · next album simmering"}
                        </span>
                    </div>
                    <div className="home-cta">
                        <a
                            className="btn btn-primary"
                            href={LINKS.spotifyAlbum}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Listen on Spotify
                        </a>
                        <a
                            className="btn btn-secondary"
                            href={LINKS.appleMusic}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Apple Music
                        </a>
                    </div>
                </div>

                <div className="home-release-row">
                    <div className="release-card card-single">
                        <div className="release-label">New single · feat. REDII</div>
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
                        <div className="release-label home-album-label">The album</div>
                        <SpotifyEmbed
                            src={LINKS.spotifyAlbumEmbed}
                            title="Borscht Porsche album on Spotify"
                            height="410"
                            loading="eager"
                        />
                    </div>

                    <div className="release-card card-next">
                        <div className="card-next-head">
                            <div className="release-label card-next-title">Next album</div>
                            <div className="card-next-badge">In the works</div>
                        </div>
                        <img
                            className="release-art release-art-white"
                            src="/assets/next_album_white.png"
                            alt="Next album"
                        />
                        <div className="card-next-caption">No link yet - check back soon.</div>
                    </div>
                </div>

                <DriveBy />
                <Footer>
                    <BrotherCounter />
                </Footer>
            </div>
        </div>
    );
}
