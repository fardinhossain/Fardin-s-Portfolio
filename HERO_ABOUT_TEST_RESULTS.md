# Verification scope — latest implementation

Environment: Node 24 executing Node-22-compatible source; Chromium 141 / Playwright 1.56.1 / Linux headless software WebGL. No AI provider key or live AI request was used.

## Build and source checks

- npm run lint: JavaScript syntax and JSON configuration validation.
- npm run build: whitelisted static assets generated in dist.
- No TypeScript source/configuration or type-check command exists.
- Environment files and private server sources are excluded from static output. Real .env variants are ignored; only the blank example is tracked.

## 14 native Node backend/build tests

Vercel handler exports, missing-key/model behavior, configuration-only status with no credential leakage, methods, JSON/content-type/body and message bounds, role/client-configuration rejection, rate-limit TTL/bounds, provider request shape, server-only auth, profile context, HTTPS/redirect constraints, safe upstream failure, timeout/abort including stalled output, output/echo limits, native server route/MIME/private-file protections and public-build exclusions.

All provider tests use injected mock responses. They do not prove live provider connectivity or model answer quality.

## 47 existing browser regression cases

The eight requested widths (320,375,390,768,1024,1366,1440,1920) in both themes; correct image/theme/typography, no selected-element clipping or horizontal overflow, four chapters/five process stages, résumé path, chapter/Home/contact/theme navigation, reduced-motion static rendering, actual WebGL changes/disposal/fallback, literal quote spacing, all-chapter scenery, native wheel/keyboard/touch/nested-dialog behavior, interruptible smooth navigation, no project auto-follow, journey back-to-top and failed-enhancement fallback.

Checks were updated for the newly supplied dark portrait, measured chapter offsets, and coordinated name completion rather than expecting the previous fixed spacing.

## 24 new browser cases

- 16 theme/width cases: portrait aspect-ratio behavior, safe robot hitbox outside the conservative face box, accessible honest unconfigured dialog, initial input focus, keyboard containment, prompt population without fabricated reply, disabled Send, popup viewport bounds and Escape/focus restoration.
- Two mobile theme cases: tracker remains sticky below the header through all four chapters; active marker and actual light/dark scenery remain correct through the final process chapter.
- Actual Three.js phase transitions enter → reveal → orbit, with progressive intermediate name-word opacity observed in the actual DOM.
- The tracked robot pauses for pointer interaction and opens/closes the dialog.
- A short mobile/keyboard-sized viewport retains reachable close and send controls.
- Local real server/client transport, loading and grounded system context tested with an explicit mock provider only.
- Provider error handling preserves the question and hides upstream details.
- Provider-supplied HTML is displayed as inert React text, not executed.

The inspection preview is tested separately to ensure its chat makes no API requests and clearly explains its static-only state.

## Limits

These checks are not physical-device/Safari certification, hardware FPS/battery benchmarks, a complete-site accessibility audit, live credential/model validation or deployment verification. Grounding is implemented through an allowlisted professional context and server instructions; model factual accuracy must be reviewed after a real provider is configured. The limiter is best-effort process-local, not a shared production quota. Existing unrelated section animations were not rewritten.

Generated results and screenshots live under verification/artifacts; delivered last-run JSON snapshots are included in verification. API setup, privacy and production considerations are in AI_ASSISTANT_SETUP.md.
