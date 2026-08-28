# Borscht Porsche - Band Website

Marketing/fan site for the band Borscht Porsche, built with Vite + React (JavaScript, plain CSS). Five pages: Home, Recipes, Recipe Detail, Films, Contact.

## Getting started

```
npm install
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

Formatting: `npm run prettify` (write) / `npm run prettify:check`.

If the dev server runs inside WSL against a Windows checkout (`/mnt/c/...`), [vite.config.js](vite.config.js) switches to polling so hot reload works.

## Project layout

```
index.html            Vite entry
src/
  main.jsx            React root + BrowserRouter
  App.jsx             Routes: / /recipes /recipes/:slug /films /contact
  pages/              One component per page
  components/         Nav, Footer, AmbientLayers (Home background animations)
  data/
    links.js          Streaming / social URLs
    recipes.js        Recipe content driving Recipes + Recipe Detail
  lib/contact.js      Contact form submit via Web3Forms (see below)
  styles/             global.css + one stylesheet per page
public/assets/        Images and icons served at /assets/...
```

## Content and configuration

- **Recipes** - edit [src/data/recipes.js](src/data/recipes.js). Each entry: `{ slug, title, summary, prep, cook, serves, ingredients[], steps[] }`.
- **Films** - YouTube IDs live in [src/pages/Films.jsx](src/pages/Films.jsx); the first ID is the featured film.
- **Links** - Spotify / Apple Music / YouTube / Instagram URLs in [src/data/links.js](src/data/links.js).
- **Contact form** - posts to [Web3Forms](https://web3forms.com) from [src/lib/contact.js](src/lib/contact.js). Copy `.env.example` to `.env` and set `VITE_WEB3FORMS_KEY` to the account's access key; messages arrive at the email registered with that key. Without a key the send is simulated in dev (with a console warning) and throws in a production build. For production, set it in the Cloudflare dashboard under **Settings → Build → "Build variables and secrets"** - _not_ Settings → Variables & Secrets, which holds runtime bindings for a Worker script and is never visible to Vite. `VITE_*` values are inlined at build time, so the key must be present while `npm run build` runs, and build-setting changes only take effect on the **next** build (retrying a failed deployment reuses the old config - push a commit instead). The key is public by design: it only authorizes posting to that inbox. Spam is filtered by a hidden honeypot field plus Web3Forms' own checks.

## Design notes

- Colors: page black `#0c090b`, card black `#161014`, pink accent `#f28fd8`, pink mid `#d94fae`, pink light `#f7a8e0`, text `#f5eef2`.
- Fonts (Google Fonts): Oswald (headings/nav/buttons), Archivo (body), Alumni Sans (taglines).
- Breakpoints: ~700px (phone) and ~1100px (tablet).
- Home ambient animations are disabled on phones and under `prefers-reduced-motion`.
