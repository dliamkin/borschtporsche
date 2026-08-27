import "./ambient.css";

// Ambient background animation layers for the Home page (mockup 4a):
// pulsing glow, drifting low-poly shards, twinkling dust, equalizer bars.
// Hidden below 700px and reduced below 1100px (mockups 6a/6b); all
// animations stop under prefers-reduced-motion — see ambient.css.
export default function AmbientLayers() {
    return (
        <div className="ambient" aria-hidden="true">
            <div className="ambient-glow" />

            <div className="ambient-shard ambient-shard-1" />
            <div className="ambient-shard ambient-shard-2" />
            <div className="ambient-shard ambient-shard-3" />
            <div className="ambient-shard ambient-shard-4" />
            <div className="ambient-shard ambient-shard-5" />
            <div className="ambient-shard ambient-shard-6" />

            <div className="ambient-dot ambient-dot-1" />
            <div className="ambient-dot ambient-dot-2" />
            <div className="ambient-dot ambient-dot-3" />
            <div className="ambient-dot ambient-dot-4" />
            <div className="ambient-dot ambient-dot-5" />
            <div className="ambient-dot ambient-dot-6" />
            <div className="ambient-dot ambient-dot-7" />

            <div className="ambient-eq">
                {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} />
                ))}
            </div>
        </div>
    );
}
