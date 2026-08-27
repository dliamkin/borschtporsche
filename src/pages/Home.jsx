import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import AmbientLayers from "../components/AmbientLayers.jsx";
import { LINKS } from "../data/links.js";
import "../styles/home.css";

export default function Home() {
    return (
        <div className="home">
            <div className="home-bg" />
            <div className="home-scrim" />
            <AmbientLayers />

            <div className="home-content">
                <Nav />

                <div className="home-hero">
                    <img className="home-logo" src="/assets/logo_no_bg.png" alt="Borscht Porsche" />
                    <div className="home-tagline">
                        Debut album out now · new single with REDII
                        <span className="home-tagline-seg3"> · next album simmering</span>
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
                        <iframe
                            src={LINKS.spotifyTrackEmbed}
                            title="Featuring REDII on Spotify"
                            height="80"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    </div>

                    <div className="home-album">
                        <div className="release-label home-album-label">The album</div>
                        <iframe
                            src={LINKS.spotifyAlbumEmbed}
                            title="Borscht Porsche album on Spotify"
                            height="410"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
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

                <Footer />
            </div>
        </div>
    );
}
