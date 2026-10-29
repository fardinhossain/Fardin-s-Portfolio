# Current Hero/About verification

Date: 2026-10-29 UTC
Environment: Chromium 141 / Playwright 1.56.1 / headless Linux / software WebGL.
Target: actual source over loopback HTTP, not the unchanged production website.

## 47 automated cases

### 16 responsive/theme cases

Widths 320, 375, 390, 768, 1024, 1366, 1440, 1920 in both dark and light themes.

For each: portrait and fonts load; the correct newly supplied theme-specific WebP is selected; no extra CSS halo is rendered; the identity uses the requested condensed Anton face and on mobile sits in front of the lower portrait; exact headline, four chapters and five process stages are present; résumé path is correct; no document horizontal overflow or selected text/control clipping occurs.

Both the earlier small sans-serif name and concentric-circle assertions were intentionally replaced by the latest owner directions: the latest supplied images already include their halos and the owner requested replacing the old image/crop. Historical circle-avatar behavior is no longer the current design.

### 5 interaction/renderer cases

- Mobile and desktop: four chapter links, active tracking, sticky offsets, Home, reduced-motion static robot, actual theme toggle and synchronized light portrait, and contact CTA.
- Actual Three.js scene: changing frames, reduced-motion stop, repeated disposal and no-WebGL fallback.
- Full app without WebGL: Hero/About content and résumé link remain.
- Exact introductory sentence/punctuation and seven rendered inter-word spaces; one semantic quote copy includes the separate visual opening mark.

### 26 background/scroll cases

- 16 theme/width cases: optimized summitscape loads, the section-contained scenic layer spans the narrative, and no horizontal overflow occurs.
- Actual wheel input eases through multiple real document positions.
- Chapter link navigation and active tracking synchronize.
- Manual wheel interrupts a programmatic destination, measured at actual event dispatch.
- Nested native dialog scrolling does not move the underlying document.
- Robot project delivery does not pull the viewport.
- Live reduced-motion switching destroys/restores easing and instant/native behavior.
- Mobile touchmove is not intercepted or given synthetic inertia.
- Browser PageDown works.
- Journey and back-to-top use the shared service.
- Failed Lenis loading falls back to working native anchor navigation.

Final suite page exceptions: zero. npm ci for the isolated verification tooling reported zero vulnerabilities at run time. The complete suite is rerun from a clean extracted archive before delivery.

## Other checks and limits

- All authored application JavaScript, vendored runtime and verification JavaScript pass node --check.
- git diff --check passes.
- Real desktop/mobile screenshots in both themes are inspected.
- The generated single-file preview is checked separately; its contact delivery is intentionally disabled.
- No production build/lint/type scripts exist, so those are not reported as passing.
- Responsive widths are not physical iOS/Android device certification. No hardware FPS/battery, complete-site WCAG compliance, external credential verification, contact delivery or live deployment is claimed.
- Windows launcher execution is not tested on Windows here.

Run npm test inside verification to reproduce both suites. Detailed output is written to verification/artifacts/results.json and scroll-background-results.json; latest delivered copies are last-run-results.json and last-scroll-background-results.json.
