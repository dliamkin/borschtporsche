import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// File-change notifications don't cross the Windows→WSL filesystem boundary
// (/mnt/c/...), so when the dev server runs inside WSL, watch by polling
// instead - otherwise hot reload never triggers. Native Windows runs keep the
// normal event-based watcher.
// Really just a preference for dev convenience; the app itself is fully
// cross-platform and deployable anywhere.
const runningInWSL = !!process.env.WSL_DISTRO_NAME;

export default defineConfig({
    plugins: [react()],
    server: {
        watch: {
            usePolling: runningInWSL,
            interval: 300,
        },
    },
});
