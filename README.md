# Fardin-s-Portfolio

The personal portfolio of **Md. Fardin Hossain**: React browser ES modules, procedural Three.js visuals, an editorial four-chapter About story, and a server-side AI-assistant integration.

## Latest implementation

- Uses the newly supplied dark portrait at its original aspect ratio; retains the supplied light-mode portrait.
- Larger condensed, coral-accented name, including the lower-portrait mobile composition.
- Real Three.js sequence: fly in → gesture/progressively reveal the name → smooth flight around the portrait. Motion, model size, visibility and face exclusion adapt to the viewport.
- Clickable tracked robot hitbox plus an accessible persistent launcher; focus/hover/chat pause the moving target.
- Theme-aware chat dialog with loading/error states, bounded input and conversation, Escape/focus handling, failed-question restoration and text-safe replies.
- **AI is not connected yet.** The actual backend is implemented but requires a private provider key and model. It does not produce a fake answer while unconfigured. No live provider call was made in these tests.
- Existing dark wireframe landscape shared by dark Hero/About; the newly supplied coral/light landscape is used in light mode. About's scene remains behind all four chapters.
- Mobile chapter tracker sticks below the navigation through the final chapter. The old mobile overflow rule that prevented sticky behavior is corrected.
- Existing project data, journey, theme switching, résumé and contact links remain. Unrelated sections are not redesigned.

## Run locally

**Node.js 22+** is required for the website plus backend. There are no production npm dependencies; the frontend still uses its existing pinned CDN libraries/fonts.

```sh
git clone https://github.com/fardinhossain/Fardin-s-Portfolio.git
cd Fardin-s-Portfolio
npm ci
npm run dev
```

Open **http://localhost:4175**. The server binds only to 127.0.0.1. `START_PREVIEW.bat` (Windows) and `sh start-preview.sh` (macOS/Linux) start the same Node server. Keep its window open. The Windows launcher has not been tested on Windows in this Linux environment.

Without a provider key/model, the assistant opens normally, displays **Not configured**, and cannot send a question. Projects, navigation, forms and other static functionality remain available.

### Configure the AI later

Copy `.env.example` to `.env` on your machine, enter **AI_API_KEY**, **AI_MODEL**, optionally **AI_FALLBACK_MODEL** (for automatic secondary fallback if primary model fails), and **AI_BASE_URL**, then restart the server. The adapter uses an OpenAI-compatible Chat Completions endpoint (such as Google Gemini's endpoint); other API formats need an adapter. Never paste a key into chat, expose it in frontend variables, or commit a populated environment file.

See **[AI_ASSISTANT_SETUP.md](AI_ASSISTANT_SETUP.md)** for API contracts, provider configuration, professional-source grounding, privacy, security and rate-limit limitations. Configuration status does not prove provider connectivity. Test a real request after configuring your own provider.

## Inspection without a backend

Open `PREVIEW.html` directly, or use the conversation's browser preview. It is generated from the same frontend source and embeds the new imagery/modules/styles. It still needs internet for existing CDN libraries/fonts and unchanged public attachments.

This inspection page deliberately disables chat/contact submission. The assistant clearly says to run the local Node server; it does not silently connect to a provider or tools. The actual source retains the real contact form and backend integration.

Regenerate with:

```sh
python3 verification/build-browser-preview.py PREVIEW.html
```

## Build and checks

```sh
npm run lint          # JavaScript syntax and JSON configuration checks
npm run build         # Public-only static output in dist
npm run test:backend  # Native Node tests, including explicit provider mocks
cd verification
npm ci
npx playwright install chromium
cd ..
npm test             # Complete build/backend/browser suite
```

There is no TypeScript source/configuration and no TypeScript type-check command. `lint` is the project's source/configuration validation script, not a claim that ESLint was configured.

Current automated coverage: 14 server/build tests and 71 Chromium cases (47 existing regressions + 24 new assistant/animation/background cases), including all requested widths in both themes. Provider fixtures are test-only and do not establish a live AI connection. See `HERO_ABOUT_TEST_RESULTS.md` for verified scope and limitations.

## Architecture

```text
index.html, journey.html, experience/     Existing browser entrypoints
assets/js/                              React application, data and Three.js modules
assets/css/                             Shared and scoped Hero/About/chat styles
assets/images/                          Supplied portraits, wireframe scenery, project images
assets/js/vendor/                       Pinned Lenis runtime and MIT notice
api/chat.js                             Vercel POST adapter
api/assistant-status.js                 Configuration-only status adapter
server/assistant-core.mjs                Validation, limits, safe real provider transport
server/profile-context.mjs               Allowlisted professional website/résumé facts
server/dev-server.mjs                    Native local HTTP server + static-route protections
tools/build-static.mjs                   Whitelisted public build; no server/env files copied
tools/check-source.mjs                   Syntax/config checks
tests/                                  Native server/build tests
verification/                           Browser tests, dependency lockfile and results
.env.example                            Blank server configuration template only
vercel.json                             Static output and API/journey configuration
```

The assistant's professional context is derived from the website data and the professional sections of the supplied résumé. Reported metrics are attributed to those sources, not independently verified. The journey's illustrative ranker is not live model inference. No new achievements or profile claims were invented.

## Deployment and safety

`npm run build` writes only whitelisted public assets to `dist`; server source and environment files are excluded. Vercel function adapters use server-side environment variables, with a 15-second upstream timeout and clean error responses. Input/body/output limits, text-safe rendering, redirect rejection, key-echo rejection and best-effort process-local rate limiting are included. The in-memory limiter is not a distributed production quota; use a shared limiter and provider spending limits for public high-traffic deployment.

Pushing source does not itself configure a deployment. This latest implementation is not claimed deployed or connected to a live AI provider. The existing website is https://fardinflyrankai.vercel.app/.

## Contact and license

GitHub: https://github.com/fardinhossain · Email: fardin.hosn@gmail.com

Software: MIT, preserving `LICENSE`. Lenis's MIT notice is included. Personal photos, certificates, third-party marks and other portfolio materials do not imply a blanket likeness/trademark license.
