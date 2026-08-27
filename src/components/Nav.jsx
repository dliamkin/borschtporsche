import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/", label: "Home" },
    { to: "/recipes", label: "Recipes" },
    { to: "/films", label: "Films" },
    { to: "/contact", label: "Contact" },
];

export default function Nav() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

    return (
        <header className="nav">
            <Link to="/" className="nav-wordmark">
                BP
            </Link>

            <nav className="nav-links">
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button
                className="nav-hamburger"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
            >
                <span />
                <span />
                <span />
            </button>

            {drawerOpen && (
                <div className="nav-drawer">
                    <div className="nav-drawer-top">
                        <span className="nav-wordmark">BP</span>
                        <button
                            className="nav-drawer-close"
                            aria-label="Close menu"
                            onClick={() => setDrawerOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                    <nav className="nav-drawer-links">
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                className={linkClass}
                                onClick={() => setDrawerOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
