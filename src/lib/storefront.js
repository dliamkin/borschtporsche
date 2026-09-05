// Merch storefront - Fourthwall (https://fourthwall.com).
//
// The token is read from VITE_FOURTHWALL_STOREFRONT_TOKEN (see .env.example).
// Like the Web3Forms key it ships in the bundle by design: it is Fourthwall's
// browser-facing storefront token (same category as a Stripe publishable key)
// and can only read public products and build carts - never orders, customers,
// or money. Checkout, payment, printing, and shipping all happen on
// shop.borschtporsche.com, hosted by Fourthwall.
const API_BASE = "https://storefront-api.fourthwall.com/v1";
const SHOP_DOMAIN = "shop.borschtporsche.com";
const COLLECTION_HANDLE = "all";
const TOKEN = import.meta.env.VITE_FOURTHWALL_STOREFRONT_TOKEN ?? "";
const TIMEOUT_MS = 15000;

async function apiGet(path, page) {
    if (!TOKEN) {
        throw new Error("VITE_FOURTHWALL_STOREFRONT_TOKEN is not set - the store cannot load.");
    }
    const url = new URL(API_BASE + path);
    url.searchParams.set("storefront_token", TOKEN);
    if (page != null) url.searchParams.set("page", page);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Storefront responded ${res.status}.`);
        return await res.json();
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("The storefront took too long to respond.");
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

// Every product in the collection, following pagination (page size is 10).
export async function fetchProducts() {
    const products = [];
    for (let page = 0; ; page++) {
        const data = await apiGet(`/collections/${COLLECTION_HANDLE}/products`, page);
        products.push(...(data.results ?? []));
        if (!data.paging?.hasNextPage) break;
    }
    return products.filter((p) => !p.access?.type || p.access.type === "PUBLIC");
}

export function productAvailable(product) {
    return product.state?.type === "AVAILABLE";
}

export function variantInStock(variant) {
    const stock = variant.stock;
    if (!stock || stock.type === "UNLIMITED") return true;
    if (stock.type === "SOLD_OUT") return false;
    // Tracked stock reports a count; treat an unknown shape as in stock rather
    // than silently disabling a sellable size.
    return typeof stock.inStock === "number" ? stock.inStock > 0 : true;
}

// { value: 20, currency: "USD" } -> "$20"; keeps cents only when present.
export function formatPrice(unitPrice) {
    if (!unitPrice || typeof unitPrice.value !== "number") return "";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: unitPrice.currency ?? "USD",
        minimumFractionDigits: Number.isInteger(unitPrice.value) ? 0 : 2,
    }).format(unitPrice.value);
}

// Direct-to-checkout on the Fourthwall-hosted shop - no cart API involved.
export function checkoutUrl(variantId, quantity = 1) {
    return `https://${SHOP_DOMAIN}/cart/checkout?products=${encodeURIComponent(variantId)}:${quantity}`;
}

// Fallback for when our page can't load: the same shop, hosted by Fourthwall.
export const SHOP_URL = `https://${SHOP_DOMAIN}`;
