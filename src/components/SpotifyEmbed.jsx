import { useState } from "react";
import "../styles/spotify-embed.css";

const BARS = [0.55, 0.9, 0.4, 1, 0.65, 0.8, 0.45];

export default function SpotifyEmbed({ src, title, height, loading = "lazy", compact = false }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            className={`spotify-embed${loaded ? " is-loaded" : ""}${compact ? " is-compact" : ""}`}
        >
            <div className="spotify-embed-placeholder" aria-hidden="true">
                <div className="spotify-embed-eq">
                    {BARS.map((h, i) => (
                        <span key={i} style={{ "--h": h, "--i": i }} />
                    ))}
                </div>
                {!compact && <div className="spotify-embed-hint">Loading from Spotify</div>}
            </div>
            <iframe
                src={src}
                title={title}
                height={height}
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading={loading}
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
}
