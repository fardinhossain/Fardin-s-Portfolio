# Portfolio Hero/About — implementation and local preview

## Current design

Latest update uses the owner's two newly supplied portraits, not the earlier cutout:

- Light theme: Modern Portrait with Warm Gradient Halo → assets/images/hero-portrait-light.png and optimized WebP.
- Dark theme: Cinematic Portrait with Warm Halo → assets/images/hero-portrait-dark.png and optimized WebP.

The originals are retained without retouching. Each image already contains its halo. The old standalone circle, circular avatar clip, oversized condensed name, and old Hero cutout are no longer rendered. The latest owner reference restores a compact condensed uppercase identity: MD. FARDIN HOSSAIN, with FARDIN in coral. It is not the previous oversized display block. On mobile this single identity element moves into the lower portrait foreground over a restrained readability gradient; desktop keeps it below the headline. The headline and personal content remain genuine and unchanged.

The latest navbar follows the supplied PORTIX-style reference: flat canvas, condensed wordmark, centered uppercase WORKS / ABOUT / EXPERIENCE / CONTACT links, a compact accessible theme control, and an outlined contact button with a coral arrow square on the left. Home remains available through the brand link. Other section links remain in the existing drawer, mobile tabs and footer. The reference's unrelated person, name and UI-designer role were not copied.

## Run the actual source locally

This is a static browser-ESM React site. No production npm installation/build is needed. Python 3 is required for the included launchers.

- Windows: extract the ZIP, double-click START_PREVIEW.bat.
- macOS/Linux: run sh start-preview.sh in the extracted folder.
- Open http://localhost:4175 and keep the server window open.

The server binds only 127.0.0.1. The address refers to the computer running it; the assistant's sandbox localhost is not a public preview URL. Stop any existing server on port 4175 first.

Alternatively, open PREVIEW.html directly for inspection without a server. This is a generated snapshot of the same source with inspection-only adapters: contact submission is disabled and route changes use hashes. The actual index.html/source keeps its original contact functionality. The immediate browser-preview artifact in the conversation is the same inspection output.

Internet is required for the existing esm.sh React/Framer Motion/Three.js/GSAP imports and Google Fonts. The standalone snapshot embeds new imagery and authored modules/styles; unchanged public images/documents use the existing production origin. It is not an offline website.

## Source map

- assets/js/cinematic-hero-section.js: Hero composition, theme subscription, reactive light/dark picture/source selection, contact/résumé links and lazy robot mounting.
- assets/js/hero-intro-timeline.js: scoped GSAP entrance; ordinary identity line rather than decorative name words; cleanup restores interrupted animation styles.
- assets/css/hero-editorial.css: flat light/dark canvas, reference-style navbar, typography and responsive photo composition. Feathered outer bounds blend the complete supplied images into the page without a second circle or avatar crop.
- assets/js/data.js: profile and project data, including the two theme-image URLs.
- assets/js/hero-orbit-scene.js: procedural Three.js robot, smaller safe mobile orbit, portrait occlusion on rear paths, DPR cap, offscreen/hidden pause, reduced-motion static rendering and idempotent disposal. About's watermark uses its stationary option.
- assets/js/about-scroll-story.js and assets/css/about-editorial.css: four natural-flow editorial chapters, whitespace-preserving word reveals, chapter progress rail, compact identity/capability items, five-stage process and a faint robot. The owner's summitscape remains a section-contained scenic backdrop with wide framing in both themes.
- assets/js/smooth-scroll.js, assets/css/smooth-scroll.css and assets/js/vendor/: locally pinned Lenis 1.3.11 (MIT license included), driven by the existing GSAP ticker. Touch and keyboard remain native. Nested dialog/textarea scrolling bypasses wheel smoothing. Manual intent cancels a programmatic destination. Live reduced-motion changes disable/re-enable enhancement safely.
- assets/js/app.js and journey-view.js: shared scroll service, contact callback, route/deep-link controls and preserved surrounding application.
- Project/certification delivery modules: visual delivery remains, autonomous viewport-following is removed.
- HTML entrypoints: shared styles/fonts; consistent validated theme bootstrap.

Existing portrait/social/attachment assets not used by the Hero are retained for their separate uses; removing the old Hero image from rendering does not delete unrelated images or documents.

## Motion/accessibility

No transformed whole-page wrapper, forced scroll, fake metrics, static robot emoji or generic replacement person is introduced. Copy remains readable before animation. Animated words use real whitespace nodes with punctuation/newlines preserved; the visual copy is aria-hidden and one semantic text copy is exposed to assistive technology. Buttons/links remain native, and chapter focus targets and media-preference cleanup are handled.

The robot is actual Three.js geometry. WebGL failure does not remove the portrait, content or actions. This does not claim to fix every pre-existing accessibility or animation limitation in unrelated page sections.

## Verification

```sh
cd verification
npm ci
npx playwright install chromium
npm test
```

The optional verification tooling is separate from the no-build production site. It starts its own loopback server on an ephemeral port and writes screenshots/results under verification/artifacts. Dependency lockfile, test scripts and latest delivered results are included.

The combined suite has 47 cases: 21 Hero/About regression cases plus 26 scenery/scrolling cases. All requested widths (320,375,390,768,1024,1366,1440,1920) are checked in both themes. Current assertions check the correct supplied image, theme-switch image synchronization, absence of the old extra halo, reference condensed name font and mobile lower-portrait placement, text/controls, overflow, WebGL behavior, chapter links and scroll preferences. See HERO_ABOUT_TEST_RESULTS.md.

The original project defines no production build, lint or type-check scripts. JavaScript syntax checks, git diff --check, actual Chromium checks and clean ZIP extraction are used instead. The Windows batch file has not been run on Windows in this Linux environment.

Regenerate the standalone inspection page with python3 verification/build-browser-preview.py PREVIEW.html. No production deployment or GitHub push has been performed.
