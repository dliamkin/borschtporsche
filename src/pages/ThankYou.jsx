import { Link } from "react-router-dom";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import ParticleField from "../components/ParticleField.jsx";
import { LINKS } from "../data/links.js";
import "../styles/thank-you.css";

// Post-checkout landing page - set as the return URL in Fourthwall's settings
// (https://borschtporsche.com/thank-you). Fourthwall owns the receipt email;
// this page is the one part of the purchase we fully control.
const STEPS = [
    {
        title: "The receipt is real",
        text:
            "It comes from Fourthwall - they run our store, the printing, and the " +
            "shipping. So when an email from a company you've never heard of shows " +
            "up, that's the one. Not phishing. It's the shirt.",
    },
    {
        title: "Printed just for you",
        text:
            "Nothing sits in a warehouse. Your order goes to print after checkout, " +
            "which takes about 2-7 business days before it even ships. Good things, " +
            "simmering, et cetera.",
    },
    {
        title: "Then it drives to you",
        text:
            "Shipping time comes on top of that, depending on where you live. We'd " +
            "deliver it in the Porsche ourselves, but it only seats two brothers.",
    },
];

export default function ThankYou() {
    return (
        <div className="page thanks-page">
            <div className="thanks-glow" aria-hidden="true" />
            <ParticleField />
            <Nav />
            <main className="page-main thanks-main">
                <div className="thanks-panel">
                    <div className="thanks-mark" aria-hidden="true">
                        ✓
                    </div>
                    <h1 className="h1-gradient">Order up.</h1>
                    <p className="thanks-lede">
                        Your merch is officially in the pot. Somewhere in Gainesville, two brothers
                        just high-fived about it.
                    </p>

                    <ol className="thanks-steps">
                        {STEPS.map((step, i) => (
                            <li className="thanks-step" key={step.title}>
                                <span className="thanks-step-num" aria-hidden="true">
                                    {i + 1}
                                </span>
                                <div className="thanks-step-body">
                                    <h2 className="thanks-step-title">{step.title}</h2>
                                    <p className="thanks-step-text">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className="thanks-actions">
                        <Link className="btn btn-primary" to="/">
                            Back to the site
                        </Link>
                        <Link className="btn btn-secondary" to="/films">
                            Watch our films while you wait
                        </Link>
                        <a
                            className="btn btn-secondary"
                            href={LINKS.spotifyArtist}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Or spin the album ↗
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
