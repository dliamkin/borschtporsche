import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/", label: "Home" },
    // TODO: Re-enable recipes when we have more than one recipe. For now, the recipes page is just a placeholder.
    // { to: "/recipes", label: "Recipes" },
    { to: "/films", label: "Films" },
    { to: "/contact", label: "Contact" },
];

// Past this many px of scroll the bar fades from transparent to tinted.
const SCROLL_THRESHOLD = 8;

export default function Nav({ className = "" }) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Tint the sticky bar once the page has scrolled away from the top.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Escape closes the drawer; lock page scroll while it's open.
    useEffect(() => {
        if (!drawerOpen) return undefined;
        const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
        window.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [drawerOpen]);

    const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

    const headerClass = ["nav", scrolled && "is-scrolled", drawerOpen && "is-open", className]
        .filter(Boolean)
        .join(" ");

    return (
        <>
            <header className={headerClass}>
                <Link to="/" className="nav-wordmark" onClick={() => setDrawerOpen(false)}>
                    BP
                </Link>

                <nav className="nav-links">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={linkClass}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <button
                    className={`nav-hamburger${drawerOpen ? " is-open" : ""}`}
                    aria-label={drawerOpen ? "Close menu" : "Open menu"}
                    aria-expanded={drawerOpen}
                    aria-controls="nav-drawer"
                    onClick={() => setDrawerOpen((open) => !open)}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </header>

            {/* Portaled to <body> so no page-level stacking context / overflow can trap it.
                Always mounted so it can fade in and out; the header sits above it, and the
                hamburger (now an X) is the close control. */}
            {createPortal(
                <div
                    id="nav-drawer"
                    className={`nav-drawer${drawerOpen ? " is-open" : ""}`}
                    aria-hidden={!drawerOpen}
                >
                    <nav className="nav-drawer-links">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                className={linkClass}
                                tabIndex={drawerOpen ? 0 : -1}
                                onClick={() => setDrawerOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>,
                document.body
            )}
        </>
    );
}
