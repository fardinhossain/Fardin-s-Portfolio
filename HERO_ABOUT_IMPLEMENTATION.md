# Current implementation notes

## Source and boundaries

Working tree: Fardin-s-Portfolio, based on main commit 02cd330a388e765261e49c6fa10a32d509a7da35. The latest Hero/About/robot/assistant work is implemented in this working source. It is not claimed pushed/deployed until a separate verified publication step.

Existing project data, experience/certification presentation, internship journey, theme service, résumé and contact functionality are retained. The mobile overflow rule in the shared stylesheet is changed from hidden to clip because hidden created a scroll container that broke sticky navigation. That is a functional fix, not an unrelated redesign.

## Hero

The newly supplied Confident Portrait with Orange Halo is stored as hero-portrait-current.png plus an optimized WebP. Its original proportions are preserved using contain sizing and feathered bounds. The existing supplied light portrait remains for light mode. Original image files are retained. No generic person or newly invented profile content is used.

The dark scene uses the existing user-supplied wireframe landscape; the latest attachment set supplies a new portrait, Hero-layout screenshot, tracker screenshot and light landscape, rather than a separate additional raw dark landscape. The actual new light landscape is used, not a white filter over the dark one.

Name typography is enlarged and responsive. The semantic name remains available to assistive technology while visual words reveal in sequence. On mobile the name stays in the lower portrait foreground. A 3.6-second enhancement backstop, renderer/import failure handling and reduced-motion paths guarantee the identity is not left visually hidden.

## Robot and interaction

hero-orbit-scene.js constructs actual Three.js geometry. Normal sequence: 1.0-second entry, 1.1-second gestural reveal, then a smoothly ramped orbit. The camera/geometry size and safe flight area shrink on narrow stages. Conservative full-model bounds determine face occlusion and a separate native button's tracked position. Canvas remains decorative; the native button supplies keyboard/pointer semantics and pauses movement during hover/focus/chat.

The persistent assistant launcher is a body portal so the isolated/clipped Hero cannot trap it under later sections. It also remains usable if WebGL is unavailable. The chat itself is a body-portal native dialog with focus containment/restoration and Escape/close support. Large and short mobile viewports constrain the dock without clipping its controls.

The renderer supports explicit pause/reduced motion, stops scheduling frames offscreen/hidden, safely handles unavailable/context-lost WebGL, and releases its geometry/material/texture/observer/listener resources. Reduced motion displays a static robot/name with no continuous scene RAF.

## About

All four chapters and genuine existing copy remain. Dark and light source images react to the shared theme service. A section-contained scenic viewport, not a giant section-height stretched image, covers the narrative and remains behind the final chapter. Text washes maintain readability and fade into matching theme colors.

The chapter nav is a direct child of the full narrative layout: desktop vertical rail, mobile sticky horizontal 01–04 tracker and active label below the 64px header. Its height is measured for click offsets and deterministic active-chapter selection. Explicit whitespace text nodes, punctuation and one semantic copy preserve word spacing/accessibility. Chapter and workflow reveals remain progressive and honor live motion preferences.

## Assistant/backend

See AI_ASSISTANT_SETUP.md. Native Node 22+ local server and Vercel API adapters provide real server-only provider transport when configured. No AI key is present, no live provider request was made, and no live answer/connection is claimed. The unconfigured UI does not fabricate responses. Backend and UI error/success transport tests use explicit fixtures only.

Professional context imports website data and an allowlist extracted from the supplied résumé. It excludes unrelated private personal details and instructs the model to acknowledge unknown information and attribute claims. A future real model still needs factual-response review after key/model configuration.

## Running/building

Node 22+; npm run dev → http://localhost:4175. Launchers start this same loopback server. .env.example is blank; populated .env variants are ignored and refused by the local server. Static dist is whitelisted and excludes server/env files. No transpilation or production dependency installation is required; browser libraries/fonts remain on their pinned CDNs.

The inspection-only PREVIEW.html embeds the new assets/client source, marks itself as an inspection preview, makes no assistant API calls and disables contact submission. It is not a live backend. Root README contains commands and architecture; tests explain what was and was not verified.
