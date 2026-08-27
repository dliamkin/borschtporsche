// Contact form backend - Web3Forms (https://web3forms.com).
//
// The access key is read from VITE_WEB3FORMS_KEY (see .env.example). Vite
// inlines VITE_* vars at build time, so the key ships in the bundle - that is
// how Web3Forms is designed to work: the key only authorizes posting to the
// account's own inbox, it grants no read access. Spam is handled by the
// honeypot field below plus Web3Forms' own filtering.
//
// Without a key the submit is simulated in dev (so the UI flow can be
// exercised on a fresh clone) and fails loudly in a production build.
const ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? "";
const TIMEOUT_MS = 15000;

let warnedMissingKey = false;

export async function submitContactMessage({ name, email, message, botcheck = "" }) {
    if (!ACCESS_KEY) {
        if (import.meta.env.PROD) {
            throw new Error("VITE_WEB3FORMS_KEY is not set - contact form cannot send.");
        }
        if (!warnedMissingKey) {
            warnedMissingKey = true;
            console.warn(
                "[contact] VITE_WEB3FORMS_KEY is not set - simulating the send. " +
                    "Copy .env.example to .env and add your Web3Forms access key."
            );
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
        return;
    }

    // Honeypot: only a bot fills this, so drop the message and report success
    // rather than telling the bot it was caught.
    if (botcheck) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res;
    let data;
    try {
        res = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                access_key: ACCESS_KEY,
                subject: `borschtporsche.com - message from ${name}`,
                from_name: "Borscht Porsche website",
                replyto: email,
                name,
                email,
                message,
            }),
            signal: controller.signal,
        });
        data = await res.json().catch(() => null);
    } catch (err) {
        if (err.name === "AbortError") {
            throw new Error("The contact service took too long to respond.");
        }
        throw new Error("Could not reach the contact service.");
    } finally {
        clearTimeout(timer);
    }

    if (!res.ok || !data?.success) {
        throw new Error(data?.message || `Contact service responded ${res.status}.`);
    }
}
