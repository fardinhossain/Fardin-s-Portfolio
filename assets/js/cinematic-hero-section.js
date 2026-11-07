import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createHeroIntroTimeline } from "./hero-intro-timeline.js";
import { mountHeroOrbit } from "./hero-orbit-scene.js";
import { PROFILE_DATA } from "./data.js";
import { getCurrentTheme, subscribeTheme } from "./theme-manager.js";
import { PortfolioAssistant } from "./assistant-chat.js";

const h = React.createElement;
const FEATURE_ITEMS = [
  { type: "code", line1: "Full-Stack", line2: "Developer" },
  { type: "chip", line1: "AI & ML", line2: "Enthusiast" },
  { type: "target", line1: "Problem", line2: "Solver" },
  { type: "book", line1: "Continuous", line2: "Learner" }
];
const NAME_WORDS = [
  { text: "MD.", accent: false },
  { text: "FARDIN", accent: true },
  { text: "HOSSAIN", accent: false }
];
const ASSISTANT_LABEL_TEXT = "Fardin's AI Assistant";
const ASSISTANT_CHARS = Array.from(ASSISTANT_LABEL_TEXT);

function StrengthIcon({ type }) {
  const paths = {
    code: ["M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"],
    chip: ["M8 3v3m8-3v3M8 18v3m8-3v3M3 8h3m-3 8h3m12-8h3m-3 8h3", "M6 6h12v12H6zM10 10h4v4h-4z"],
    target: ["M12 2v4m0 12v4M2 12h4m12 0h4", "M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0"],
    book: ["M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"]
  };
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, (paths[type] || paths.code).map((d, i) => h("path", { d, key: i })));
}

function CenteredTypewriterFeatureBar({ active = true }) {
  const [featureIndex, setFeatureIndex] = useState(0);
  const [iconVisible, setIconVisible] = useState(false);
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [hasSpace, setHasSpace] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!active) {
      setIconVisible(false);
      setPart1("");
      setPart2("");
      setHasSpace(false);
      setCursorVisible(false);
      return;
    }

    const prefersReducedMotion = typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const current = FEATURE_ITEMS[featureIndex];
      setIconVisible(true);
      setPart1(current.line1);
      setHasSpace(true);
      setPart2(current.line2);
      setCursorVisible(false);
      const timer = setTimeout(() => {
        setFeatureIndex((prev) => (prev + 1) % FEATURE_ITEMS.length);
      }, 3500);
      return () => clearTimeout(timer);
    }

    let isCancelled = false;
    let timerId = null;

    const sleep = (ms) => new Promise((resolve) => {
      timerId = setTimeout(resolve, ms);
    });

    const runSequence = async () => {
      const item = FEATURE_ITEMS[featureIndex];

      // Step 1: Smoothly reveal orange accent icon
      setPart1("");
      setPart2("");
      setHasSpace(false);
      setCursorVisible(true);
      setIconVisible(true);
      await sleep(280);
      if (isCancelled) return;

      // Step 2: Type first word/phrase on single line
      for (let i = 1; i <= item.line1.length; i++) {
        setPart1(item.line1.slice(0, i));
        await sleep(45);
        if (isCancelled) return;
      }

      // Add single space between part 1 and part 2
      setHasSpace(true);
      await sleep(65);
      if (isCancelled) return;

      // Step 3: Type second word in accent color on the same line
      for (let i = 1; i <= item.line2.length; i++) {
        setPart2(item.line2.slice(0, i));
        await sleep(45);
        if (isCancelled) return;
      }

      // Step 4: Keep complete single-line feature visible briefly (~1.5s)
      await sleep(1500);
      if (isCancelled) return;

      // Step 5: Smoothly erase text in one line
      // Erase part 2 backwards
      for (let i = item.line2.length - 1; i >= 0; i--) {
        setPart2(item.line2.slice(0, i));
        await sleep(18);
        if (isCancelled) return;
      }
      setHasSpace(false);
      await sleep(18);
      if (isCancelled) return;

      // Erase part 1 backwards
      for (let i = item.line1.length - 1; i >= 0; i--) {
        setPart1(item.line1.slice(0, i));
        if (i === Math.floor(item.line1.length / 2)) {
          setIconVisible(false);
        }
        await sleep(18);
        if (isCancelled) return;
      }
      setIconVisible(false);
      setCursorVisible(false);
      await sleep(180);
      if (isCancelled) return;

      // Step 6: Advance to next feature and loop indefinitely
      setFeatureIndex((prev) => (prev + 1) % FEATURE_ITEMS.length);
    };

    runSequence();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [featureIndex, active]);

  const currentItem = FEATURE_ITEMS[featureIndex];

  return h("ul", {
    className: "fh-strengths fh-strengths-typewriter",
    "aria-label": "Core focus areas",
    "aria-live": "polite"
  },
    h("li", {
      className: "fh-typewriter-card",
      key: featureIndex
    },
      h("span", {
        className: `fh-strength-icon ${iconVisible ? "fh-icon-visible" : "fh-icon-hidden"}`
      },
        h(StrengthIcon, { type: currentItem.type })
      ),
      h("div", { className: "fh-typewriter-text" },
        h("span", { className: "fh-typewriter-part fh-part-1" }, part1),
        hasSpace && h("span", { className: "fh-typewriter-space" }, "\u00A0"),
        h("span", { className: "fh-typewriter-part fh-part-2" }, part2),
        cursorVisible && h("span", { className: "fh-typewriter-cursor", "aria-hidden": true })
      ),
      h("span", { className: "fh-sr-only" }, `${currentItem.line1} ${currentItem.line2}`)
    )
  );
}
function ChatGlyph() {
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true }, h("rect", { x: 3, y: 5, width: 18, height: 14, rx: 5 }), h("path", { d: "M12 2v3M8 10v3m8-3v3m-7 3h6" }));
}

// The canvas is decorative; a tracked native button provides real interaction.
// Callback values update refs/styles rather than scheduling React every frame.
export function HeroAuraFlyingRobot({ onActivate, open = false, onRevealProgress, onAssistantProgress, onPhase, onStage, active = true }) {
  const host = useRef(null);
  const hitbox = useRef(null);
  const labelRef = useRef(null);
  const controller = useRef(null);
  const current = useRef({ onActivate, open, onRevealProgress, onAssistantProgress, onPhase, onStage });
  current.current = { onActivate, open, onRevealProgress, onAssistantProgress, onPhase, onStage };
  const activity = useRef({ hover: false, focus: false });
  const assistantValueRef = useRef(0);
  const fallbackAnimRef = useRef(0);

  const applyAssistantLabel = useCallback((value) => {
    const clamped = Math.max(0, Math.min(1, value));
    assistantValueRef.current = clamped;
    current.current.onAssistantProgress?.(clamped);
    const labelEl = labelRef.current;
    if (!labelEl) return;
    const isVisible = clamped > 0.01;
    labelEl.dataset.visible = isVisible ? "true" : "false";
    labelEl.style.opacity = isVisible ? String(Math.min(1, clamped * 3.2)) : "0";
    const lift = (1 - Math.min(1, clamped * 2.2)) * 8;
    labelEl.style.setProperty("--assistant-lift", `${lift.toFixed(2)}px`);
    const chars = labelEl.querySelectorAll(".fh-assistant-char");
    const total = chars.length;
    chars.forEach((charEl, idx) => {
      const amount = clamped >= 1 ? 1 : Math.max(0, Math.min(1, clamped * (total + 2.5) - idx));
      charEl.style.opacity = amount.toFixed(3);
      charEl.style.transform = `translateY(${((1 - amount) * 6).toFixed(2)}px)`;
      const glow = Math.sin(amount * Math.PI);
      charEl.style.textShadow = glow > 0.06 && clamped < 1
        ? `0 0 ${Math.round(glow * 14)}px rgba(255, 114, 64, ${(glow * 0.9).toFixed(2)})`
        : "";
    });
  }, []);

  const syncPause = () => {
    const shouldPause = Boolean(current.current.open || activity.current.hover || activity.current.focus);
    controller.current?.setPaused(shouldPause);
    // If paused right after landing while "Fardin's AI Assistant" has started revealing,
    // allow the text typing animation to finish smoothly above the paused robot.
    if (shouldPause && assistantValueRef.current > 0 && assistantValueRef.current < 1 && !fallbackAnimRef.current) {
      let last = performance.now();
      const step = (now) => {
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        const next = Math.min(1, assistantValueRef.current + dt / 1.0);
        applyAssistantLabel(next);
        if (next < 1) fallbackAnimRef.current = window.requestAnimationFrame(step);
        else fallbackAnimRef.current = 0;
      };
      fallbackAnimRef.current = window.requestAnimationFrame(step);
    }
  };

  useEffect(() => { syncPause(); }, [open]);
  useEffect(() => {
    if (!active) {
      if (controller.current) {
        controller.current.dispose();
        controller.current = null;
      }
      return;
    }
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let started = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => controller.current?.setReducedMotion(motion.matches);
    motion.addEventListener("change", updateMotion);
    const unavailable = () => {
      current.current.onRevealProgress?.(1);
      applyAssistantLabel(1);
      current.current.onStage?.("unavailable");
      current.current.onPhase?.("unavailable");
    };
    const load = () => {
      if (started || cancelled) return;
      started = true;
      try {
        controller.current = mountHeroOrbit(el, {
          reducedMotion: motion.matches,
          onPhase: value => current.current.onPhase?.(value),
          onStage: value => {
            current.current.onStage?.(value);
            if ((value === "assistant" || value === "settled") && assistantValueRef.current === 0) {
              applyAssistantLabel(value === "settled" ? 1 : 0.02);
            }
          },
          onRevealProgress: value => current.current.onRevealProgress?.(value),
          onAssistantProgress: value => applyAssistantLabel(value),
          onPosition: position => {
            const button = hitbox.current;
            if (!button) return;
            const width = Math.max(44, position.width);
            const height = Math.max(44, position.height);
            const left = Math.max(0, Math.min(el.clientWidth - width, position.x - (width - position.width) / 2));
            const top = Math.max(0, Math.min(el.clientHeight - height, position.y - (height - position.height) / 2));
            button.style.width = `${width}px`;
            button.style.height = `${height}px`;
            button.style.left = `${left}px`;
            button.style.top = `${top}px`;
            button.style.visibility = position.visible ? "visible" : "hidden";
            button.tabIndex = position.visible ? 0 : -1;

            const labelEl = labelRef.current;
            if (labelEl && position.visible && position.width > 0 && el.clientWidth > 0 && el.clientHeight > 0) {
              const labelH = labelEl.offsetHeight || 22;
              const centerX = position.x + position.width / 2;
              // Center horizontally directly above the middle of the robot head
              labelEl.style.left = `${Math.round(centerX)}px`;
              labelEl.style.top = `${Math.round(position.y - labelH - 7)}px`;
              labelEl.style.transform = `translateX(-50%)`;
              labelEl.style.visibility = "visible";
            } else if (labelEl && (!position.visible || position.width === 0)) {
              labelEl.style.opacity = "0";
              labelEl.style.visibility = "hidden";
            }
          }
        });
        syncPause();
      } catch (_) {
        unavailable();
      }
    };
    load();
    return () => {
      cancelled = true;
      if (fallbackAnimRef.current) window.cancelAnimationFrame(fallbackAnimRef.current);
      fallbackAnimRef.current = 0;
      motion.removeEventListener("change", updateMotion);
      controller.current?.dispose();
      controller.current = null;
    };
  }, [applyAssistantLabel, active]);

  return h(React.Fragment, null,
    h("div", { ref: host, className: "fh-orbit-host", "aria-hidden": true }),
    h("div", {
      ref: labelRef,
      className: "fh-assistant-label",
      "data-visible": "false"
    },
      h("span", { className: "fh-sr-only" }, ASSISTANT_LABEL_TEXT),
      h("span", { className: "fh-assistant-dot", "aria-hidden": true }),
      h("span", { className: "fh-assistant-text", "aria-hidden": true },
        ASSISTANT_CHARS.map((ch, idx) =>
          h("span", {
            key: idx,
            className: `fh-assistant-char${idx >= 9 ? " fh-assistant-char-accent" : ""}`
          }, ch === " " ? "\u00A0" : ch)
        )
      )
    ),
    h("button", {
      ref: hitbox, className: "fh-robot-hitbox", type: "button", style: { visibility: "hidden" }, tabIndex: -1,
      "aria-label": "Open Fardin's AI assistant", "aria-haspopup": "dialog", "aria-expanded": open,
      onClick: event => current.current.onActivate?.(event.currentTarget),
      onPointerEnter: e => { if (e.pointerType === "mouse") { activity.current.hover = true; syncPause(); } },
      onPointerLeave: e => { if (e.pointerType === "mouse") { activity.current.hover = false; syncPause(); } },
      onFocus: e => { if (e.target.matches?.(":focus-visible")) { activity.current.focus = true; syncPause(); } },
      onBlur: () => { activity.current.focus = false; activity.current.hover = false; syncPause(); }
    }, h("span", { className: "fh-sr-only" }, "Ask about Fardin's work"))
  );
}

function ResumeModal({ open, onClose, resumeUrl, previewImage }) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    h(
      "div",
      {
        className: "resume-modal-backdrop",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Md. Fardin Hossain Résumé Preview",
        onClick: (e) => {
          if (e.target === e.currentTarget) onClose();
        }
      },
      h(
        "div",
        { className: "resume-modal-dialog" },
        h(
          "div",
          { className: "resume-modal-header" },
          h(
            "div",
            { className: "resume-modal-title-wrap" },
            h("span", { className: "resume-modal-badge" }, "PDF"),
            h("h3", { className: "resume-modal-title" }, "Md. Fardin Hossain — Résumé")
          ),
          h(
            "div",
            { className: "resume-modal-actions" },
            h(
              "a",
              {
                href: resumeUrl,
                download: "Md_Fardin_Hossain_Resume.pdf",
                className: "resume-action-btn resume-action-btn-primary",
                "aria-label": "Download Resume PDF"
              },
              h(
                "svg",
                { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true },
                h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                h("polyline", { points: "7 10 12 15 17 10" }),
                h("line", { x1: 12, y1: 15, x2: 12, y2: 3 })
              ),
              h("span", null, "Download")
            ),
            h(
              "a",
              {
                href: resumeUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "resume-action-btn",
                "aria-label": "Open PDF in new tab"
              },
              h(
                "svg",
                { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, "aria-hidden": true },
                h("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
                h("polyline", { points: "15 3 21 3 21 9" }),
                h("line", { x1: 10, y1: 14, x2: 21, y2: 3 })
              ),
              h("span", null, "Open PDF")
            ),
            h(
              "button",
              {
                type: "button",
                className: "resume-modal-close",
                onClick: onClose,
                "aria-label": "Close preview"
              },
              "✕"
            )
          )
        ),
        h(
          "div",
          { className: "resume-modal-body" },
          h("img", {
            src: previewImage,
            alt: "Md. Fardin Hossain Résumé Preview",
            className: "resume-preview-sheet",
            loading: "eager",
            decoding: "async"
          })
        )
      )
    ),
    document.body
  );
}

export function CinematicHeroSection({ resumeUrl = PROFILE_DATA.resumeUrl, onNavigateContact, introActive = false }) {
  const root = useRef(null);
  const [theme, setTheme] = useState(getCurrentTheme);
  const [mobileName, setMobileName] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  const [chatOpen, setChatOpen] = useState(false);
  const [heroAnimationActive, setHeroAnimationActive] = useState(() => !introActive);
  const timelineRef = useRef(null);
  const lastLauncher = useRef(null);
  const progress = useRef(0);
  const revealed = useRef(false);

  useEffect(() => {
    if (introActive) {
      setHeroAnimationActive(false);
      return;
    }
    const motion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (motion) {
      setHeroAnimationActive(true);
      return;
    }
    const timer = setTimeout(() => {
      setHeroAnimationActive(true);
    }, 500); // 0.5 sec delay after welcome intro completes
    return () => clearTimeout(timer);
  }, [introActive]);

  const revealName = useCallback(value => {
    if (revealed.current && value < 1) return;
    progress.current = value;
    if (value >= 1) revealed.current = true;
    const heroEl = root.current;
    if (!heroEl) return;
    const nameEls = heroEl.querySelectorAll(".fh-name");
    nameEls.forEach(nameEl => {
      nameEl.style.setProperty("--name-bar-opacity", String(Math.max(0, Math.min(1, value * 2.5))));
    });
    const chars = heroEl.querySelectorAll(".fh-name-char");
    const totalChars = chars.length;
    if (totalChars === 0) return;
    const cursor = value * totalChars;
    const activeIdx = Math.floor(cursor);
    const wordBoundaries = [0, 3, 9, 16];
    heroEl.querySelectorAll(".fh-name-word").forEach((word, wIdx) => {
      const start = wordBoundaries[wIdx] ?? 0;
      if (value >= 1 || cursor > start) {
        word.style.opacity = "1";
      } else {
        word.style.opacity = "0";
      }
      word.style.transform = "none";
    });
    chars.forEach((charEl, idx) => {
      if (value >= 1 || idx < activeIdx) {
        charEl.style.opacity = "1";
        charEl.style.transform = "none";
        charEl.style.textShadow = "";
      } else if (idx === activeIdx) {
        const frac = Math.min(1, Math.max(0, (cursor - idx) * 1.5));
        charEl.style.opacity = Math.max(0.2, frac).toFixed(3);
        charEl.style.transform = `translateY(${((1 - frac) * 5).toFixed(2)}px)`;
        charEl.style.textShadow = "0 0 16px rgba(255, 114, 64, 0.95), 0 0 5px rgba(255, 255, 255, 0.85)";
      } else {
        charEl.style.opacity = "0";
        charEl.style.transform = "translateY(6px)";
        charEl.style.textShadow = "";
      }
    });
    heroEl.dataset.nameRevealed = value >= 1 ? "true" : "false";
  }, []);
  const phase = useCallback(value => { if (root.current) root.current.dataset.mascotPhase = value; }, []);
  const stage = useCallback(value => { if (root.current) root.current.dataset.robotStage = value; }, []);
  const assistantProgress = useCallback(value => {
    if (root.current) root.current.dataset.assistantRevealed = value >= 1 ? "true" : "false";
  }, []);
  useLayoutEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!heroAnimationActive) {
      revealed.current = false;
      progress.current = 0;
      revealName(motion.matches ? 1 : 0);
      return;
    }
    revealName(motion.matches ? 1 : 0);
    // Progressive-enhancement backstop: import/GPU/observer failure cannot hide identity.
    const timer = window.setTimeout(() => revealName(1), 3600);
    const changed = () => { if (motion.matches) revealName(1); };
    motion.addEventListener("change", changed);
    return () => { window.clearTimeout(timer); motion.removeEventListener("change", changed); };
  }, [heroAnimationActive, revealName]);
  useLayoutEffect(() => { revealName(progress.current); }, [mobileName, revealName]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const update = () => setMobileName(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => subscribeTheme(setTheme), []);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timeline = createHeroIntroTimeline({
      elements: {
        headlineLines: [...el.querySelectorAll(".fh-headline-line")],
        nameWords: [],
        labelBadge: el.querySelector(".fh-kicker"),
        portraitContainer: el.querySelector(".fh-portrait"),
        actions: el.querySelector(".fh-actions")
      },
      isReducedMotion: motion.matches
    });
    timelineRef.current = timeline;
    const change = () => { if (motion.matches) timeline.skip(); };
    motion.addEventListener("change", change);
    if (heroAnimationActive) {
      timeline.play();
    }
    return () => {
      motion.removeEventListener("change", change);
      timeline.kill();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (heroAnimationActive) {
      timelineRef.current?.play?.();
    } else {
      timelineRef.current?.pause?.(0);
    }
  }, [heroAnimationActive]);

  const contact = event => { if (onNavigateContact) { event.preventDefault(); onNavigateContact(); } };
  const activate = element => { lastLauncher.current = element; setChatOpen(true); };
  const identity = h("p", { className: `fh-name${mobileName ? " fh-name-mobile" : ""}` },
    h("span", { className: "fh-sr-only" }, "MD. FARDIN HOSSAIN"),
    h("span", { className: "fh-name-cloud", "aria-hidden": true }),
    h("span", { className: "fh-name-visual", "aria-hidden": true },
      NAME_WORDS.map((word, wIdx) =>
        h(React.Fragment, { key: word.text },
          wIdx > 0 ? " " : null,
          h("span", { className: `fh-name-word${word.accent ? " fh-name-accent" : ""}` },
            Array.from(word.text).map((ch, cIdx) =>
              h("span", { key: cIdx, className: "fh-name-char" }, ch)
            )
          )
        )
      )
    )
  );
  // Transparent cutouts (originals retained): the hero background shows through,
  // so the photo has no separate rectangular backdrop colour.
  const portraitSrc = theme === "light" ? PROFILE_DATA.heroPortraitLight : PROFILE_DATA.heroPortraitDark;
  const resumeHref = resumeUrl.startsWith("/") || /^https?:/.test(resumeUrl) ? resumeUrl : `/${resumeUrl}`;
  return h("section", { id: "home", ref: root, className: "fh-hero", "aria-labelledby": "fh-headline" },
    h("div", { className: "fh-atmosphere", "aria-hidden": true }),
    h("div", { className: "fh-inner" },
      h("div", { className: "fh-composition" },
        h("div", { className: "fh-copy" },
          h("p", { className: "fh-kicker" }, "ASPIRING AI ENGINEER · FULL-STACK DEVELOPER"),
          h("h1", { id: "fh-headline", className: "fh-headline" },
            h("span", { className: "fh-headline-line" }, h("span", { className: "fh-bright" }, "BUILDING"), " THAT"), " ",
            h("span", { className: "fh-headline-line" }, "CREATES INTELLIGENT"), " ",
            h("span", { className: "fh-headline-line" }, "IMPACT")),
          !mobileName && identity,
          h("div", { className: "fh-actions" },
            h("a", { href: "#contact", className: "fh-contact", onClick: contact }, "LET’S TALK", h("span", { "aria-hidden": true }, "→")),
            h("a", {
              href: resumeHref,
              className: "fh-resume",
              target: "_blank",
              rel: "noopener noreferrer"
            },
              h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true }, h("path", { d: "M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5" })), "VIEW RESUME"),
            h("div", { className: "fh-robot-mobile-anchor", "aria-hidden": true }))),
        h("div", { className: "fh-visual" },
          h("div", { className: "fh-portrait" }, h("picture", { "data-portrait-theme": theme },
            h("img", { src: portraitSrc,
              alt: "Md. Fardin Hossain in a brown button-up shirt with an orange halo", width: 838, height: 1024,
              loading: "eager", fetchPriority: "high", decoding: "async", draggable: false }))),
          mobileName && identity),
        h(HeroAuraFlyingRobot, {
          onActivate: activate,
          open: chatOpen,
          onRevealProgress: revealName,
          onAssistantProgress: assistantProgress,
          onPhase: phase,
          onStage: stage,
          active: heroAnimationActive
        })),
      h(CenteredTypewriterFeatureBar, { active: heroAnimationActive })),
    h(PortfolioAssistant, { open: chatOpen, onClose: () => setChatOpen(false), returnFocusRef: lastLauncher })
  );
}
