import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Recipes from "./pages/Recipes.jsx";
import RecipeDetail from "./pages/RecipeDetail.jsx";
import Films from "./pages/Films.jsx";
import Contact from "./pages/Contact.jsx";
import Merch from "./pages/Merch.jsx";
import ThankYou from "./pages/ThankYou.jsx";

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

// Google Analytics: the gtag snippet in index.html has send_page_view off, so
// report a page_view here on the initial load and on every client-side route change.
function PageViews() {
    const { pathname, search } = useLocation();
    useEffect(() => {
        if (typeof window.gtag !== "function") return; // e.g. blocked by an ad blocker
        window.gtag("event", "page_view", {
            page_path: pathname + search,
            page_location: window.location.href,
            page_title: document.title,
        });
    }, [pathname, search]);
    return null;
}

export default function App() {
    return (
        <>
            <ScrollToTop />
            <PageViews />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/recipes/:slug" element={<RecipeDetail />} />
                <Route path="/films" element={<Films />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/merch" element={<Merch />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </>
    );
}
