import { LINKS } from "../data/links.js";

// `children` render inside the copyright line (the home page slots an easter egg in here).
export default function Footer({ children }) {
    return (
        <footer className="footer">
            <div className="footer-copy">
                © 2026 Borscht Porsche
                {children}
            </div>
            <div className="footer-links">
                <a href={LINKS.spotifyArtist} target="_blank" rel="noreferrer">
                    Spotify
                </a>
                <a href={LINKS.youtube} target="_blank" rel="noreferrer">
                    YouTube
                </a>
                <a href={LINKS.instagram} target="_blank" rel="noreferrer">
                    Instagram
                </a>
            </div>
        </footer>
    );
}
