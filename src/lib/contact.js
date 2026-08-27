// Contact form backend stub.
//
// The client will wire a free contact-message service (Formspree, Web3Forms,
// Basin, etc.) later. To hook one up, set CONTACT_ENDPOINT to the service's
// POST URL — the form data is sent as JSON. While the endpoint is empty the
// submit is simulated so the UI flow (sending → sent) can be exercised.
const CONTACT_ENDPOINT = "";

export async function submitContactMessage({ name, email, message }) {
    if (!CONTACT_ENDPOINT) {
        // Simulated send — replace by setting CONTACT_ENDPOINT above.
        await new Promise((resolve) => setTimeout(resolve, 600));
        return;
    }

    const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
    });
    if (!res.ok) {
        throw new Error(`Contact service responded ${res.status}`);
    }
}
