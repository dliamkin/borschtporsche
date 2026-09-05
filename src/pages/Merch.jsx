import { useEffect, useMemo, useState } from "react";
import Nav from "../components/Nav.jsx";
import Footer from "../components/Footer.jsx";
import ParticleField from "../components/ParticleField.jsx";
import {
    fetchProducts,
    productAvailable,
    variantInStock,
    formatPrice,
    checkoutUrl,
    SHOP_URL,
} from "../lib/storefront.js";
import "../styles/merch.css";

// One card per product. Fourthwall models each colorway of our shirts as its
// own product, so most cards have a single color - but the picker is built
// from the variant data, so a true multi-color product would just work.
function ProductCard({ product }) {
    const available = productAvailable(product);

    // Colors and sizes in the order the API lists variants (XS -> 5XL).
    const colors = useMemo(() => {
        const seen = new Map();
        for (const v of product.variants) {
            const c = v.attributes?.color;
            if (c?.name && !seen.has(c.name)) seen.set(c.name, c);
        }
        return [...seen.values()];
    }, [product]);

    const sizeNames = useMemo(() => {
        const seen = new Set();
        for (const v of product.variants) {
            const s = v.attributes?.size?.name;
            if (s) seen.add(s);
        }
        return [...seen];
    }, [product]);

    const [colorName, setColorName] = useState(colors[0]?.name ?? null);
    const [sizeName, setSizeName] = useState(null); // no default - pick your size
    const [imageIndex, setImageIndex] = useState(0);

    const variantFor = (color, size) =>
        product.variants.find(
            (v) =>
                (!color || v.attributes?.color?.name === color) &&
                (!size || v.attributes?.size?.name === size)
        );

    // Gallery follows the selected color; variants carry their own image sets.
    const images = variantFor(colorName)?.images?.length
        ? variantFor(colorName).images
        : product.images;
    const image = images[Math.min(imageIndex, images.length - 1)];

    const selectedVariant = sizeName ? variantFor(colorName, sizeName) : null;
    const canBuy = available && selectedVariant && variantInStock(selectedVariant);

    const price = formatPrice((selectedVariant ?? product.variants[0])?.unitPrice);

    function pickColor(name) {
        setColorName(name);
        setImageIndex(0);
        // Keep the size if the new color has it in stock, otherwise reset.
        const v = variantFor(name, sizeName);
        if (!v || !variantInStock(v)) setSizeName(null);
    }

    function buy() {
        if (!canBuy) return;
        if (typeof window.gtag === "function") {
            window.gtag("event", "begin_checkout", {
                currency: selectedVariant.unitPrice?.currency ?? "USD",
                value: selectedVariant.unitPrice?.value,
                items: [{ item_id: selectedVariant.id, item_name: product.name }],
            });
        }
        window.location.assign(checkoutUrl(selectedVariant.id));
    }

    const buyLabel = !available
        ? "Sold out"
        : !sizeName
          ? "Pick a size"
          : !canBuy
            ? "Out of stock"
            : `Buy · ${price}`;

    const sizeGroupId = `sizes-${product.id}`;
    const colorGroupId = `colors-${product.id}`;

    return (
        <article className={`merch-card${available ? "" : " is-soldout"}`}>
            <div className="merch-gallery">
                <img
                    src={image?.url}
                    alt={`${product.name} - photo ${imageIndex + 1} of ${images.length}`}
                    loading="lazy"
                />
                {!available && <span className="merch-soldout-badge">Sold out</span>}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="merch-gallery-nav merch-gallery-prev"
                            aria-label="Previous photo"
                            onClick={() =>
                                setImageIndex((i) => (i - 1 + images.length) % images.length)
                            }
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="merch-gallery-nav merch-gallery-next"
                            aria-label="Next photo"
                            onClick={() => setImageIndex((i) => (i + 1) % images.length)}
                        >
                            ›
                        </button>
                        <span className="merch-gallery-count" aria-hidden="true">
                            {imageIndex + 1} / {images.length}
                        </span>
                    </>
                )}
            </div>

            <div className="merch-card-body">
                <div className="merch-card-top">
                    <h2 className="merch-card-name">{product.name}</h2>
                    <span className="merch-card-price">{price}</span>
                </div>
                {product.description && <p className="merch-card-desc">{product.description}</p>}

                <div className="merch-field">
                    <span className="merch-label" id={colorGroupId}>
                        Color · {colorName}
                    </span>
                    <div className="merch-swatches" role="group" aria-labelledby={colorGroupId}>
                        {colors.map((c) => (
                            <button
                                key={c.name}
                                type="button"
                                className="merch-swatch"
                                aria-label={c.name}
                                aria-pressed={c.name === colorName}
                                disabled={colors.length === 1}
                                onClick={() => pickColor(c.name)}
                            >
                                <span style={{ background: c.swatch }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="merch-field">
                    <span className="merch-label" id={sizeGroupId}>
                        Size
                    </span>
                    <div className="merch-sizes" role="group" aria-labelledby={sizeGroupId}>
                        {sizeNames.map((s) => {
                            const v = variantFor(colorName, s);
                            const inStock = v && variantInStock(v);
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    className="merch-size"
                                    aria-pressed={s === sizeName}
                                    disabled={!available || !inStock}
                                    title={inStock ? undefined : "Out of stock"}
                                    onClick={() => setSizeName(s)}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type="button"
                    className="btn btn-primary merch-buy"
                    disabled={!canBuy}
                    onClick={buy}
                >
                    {buyLabel}
                </button>
                <p className="merch-checkout-note">
                    Checkout happens securely on our Fourthwall shop.
                </p>
            </div>
        </article>
    );
}

function SkeletonCard() {
    return (
        <div className="merch-card merch-skeleton" aria-hidden="true">
            <div className="merch-gallery photo-placeholder">
                <span>loading the rack…</span>
            </div>
            <div className="merch-card-body">
                <span className="merch-skeleton-line" style={{ width: "70%" }} />
                <span className="merch-skeleton-line" style={{ width: "40%" }} />
                <span className="merch-skeleton-line" style={{ width: "85%" }} />
            </div>
        </div>
    );
}

export default function Merch() {
    const [products, setProducts] = useState(null);
    const [error, setError] = useState(null);

    function load() {
        setError(null);
        setProducts(null);
        fetchProducts()
            .then(setProducts)
            .catch((err) => {
                console.error("[merch] failed to load products:", err);
                setError(err?.message ?? "Could not load the store.");
            });
    }

    useEffect(load, []);

    return (
        <div className="page merch-page">
            <ParticleField />
            <Nav />
            <main className="page-main merch-main">
                <div className="page-wrap">
                    <header className="merch-header">
                        <h1 className="h1-gradient">Merch</h1>
                        <p className="page-intro">
                            Two designs, two brothers, one very pink car. Everything is printed when
                            you order it, so nothing sits in a warehouse getting sad.
                        </p>
                    </header>

                    {error ? (
                        <div className="merch-status" role="alert">
                            <h2 className="merch-status-title">The merch rack tipped over.</h2>
                            <p className="merch-status-text">
                                We couldn't load the store right now. Give it another go, or shop
                                straight from the source - same shirts, same checkout.
                            </p>
                            <div className="merch-status-actions">
                                <button type="button" className="btn btn-primary" onClick={load}>
                                    Try again
                                </button>
                                <a
                                    className="btn btn-secondary"
                                    href={SHOP_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open the shop ↗
                                </a>
                            </div>
                        </div>
                    ) : products === null ? (
                        <div className="merch-grid">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="merch-status" role="status">
                            <h2 className="merch-status-title">The rack is empty.</h2>
                            <p className="merch-status-text">
                                Nothing for sale right now - new merch is simmering.
                            </p>
                        </div>
                    ) : (
                        <div className="merch-grid">
                            {products.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
