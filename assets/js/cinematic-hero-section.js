import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createHeroIntroTimeline } from "./hero-intro-timeline.js";
import { mountHeroOrbit } from "./hero-orbit-scene.js";
import { PROFILE_DATA } from "./data.js";
import { getCurrentTheme, subscribeTheme } from "./theme-manager.js";
import { PortfolioAssistant } from "./assistant-chat.js";

const h = React.createElement;
const STRENGTHS = [["code", "Full-Stack", "Developer"], ["chip", "AI & ML", "Enthusiast"], ["target", "Problem", "Solver"], ["book", "Continuous", "Learner"]];
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
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, paths[type].map((d, i) => h("path", { d, key: i })));
}
function ChatGlyph() {
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true }, h("rect", { x: 3, y: 5, width: 18, height: 14, rx: 5 }), h("path", { d: "M12 2v3M8 10v3m8-3v3m-7 3h6" }));
}

// The canvas is decorative; a tracked native button provides real interaction.
// Callback values update refs/styles rather than scheduling React every frame.
export function HeroAuraFlyingRobot({ onActivate, open = false, onRevealProgress, onAssistantProgress, onPhase, onStage }) {
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
              const labelW = labelEl.offsetWidth || 168;
              const labelH = labelEl.offsetHeight || 28;
              const centerX = position.x + position.width / 2;
              const clampedLeft = Math.max(8, Math.min(el.clientWidth - labelW - 8, centerX - labelW / 2));
              const clampedTop = Math.max(8, Math.min(el.clientHeight - labelH - 8, position.y - labelH - 6));
              labelEl.style.left = `${Math.round(clampedLeft)}px`;
              labelEl.style.top = `${Math.round(clampedTop)}px`;
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
  }, [applyAssistantLabel]);

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

export function CinematicHeroSection({ resumeUrl = PROFILE_DATA.resumeUrl, onNavigateContact }) {
  const root = useRef(null);
  const [theme, setTheme] = useState(getCurrentTheme);
  const [mobileName, setMobileName] = useState(() => window.matchMedia("(max-width: 700px)").matches);
  const [chatOpen, setChatOpen] = useState(false);
  const lastLauncher = useRef(null);
  const progress = useRef(0);
  const revealed = useRef(false);
  const revealName = useCallback(value => {
    if (revealed.current && value < 1) return;
    progress.current = value;
    if (value >= 1) revealed.current = true;
    const heroEl = root.current;
    if (!heroEl) return;
    const nameEl = heroEl.querySelector(".fh-name");
    if (nameEl) {
      nameEl.style.setProperty("--name-bar-opacity", String(Math.max(0, Math.min(1, value * 2.5))));
    }
    heroEl.querySelectorAll(".fh-name-word").forEach((word, index) => {
      const amount = Math.max(0, Math.min(1, value * 3 - index));
      word.style.opacity = amount;
      word.style.transform = `translateY(${(1 - amount) * 8}px)`;
    });
    const chars = heroEl.querySelectorAll(".fh-name-char");
    const totalChars = chars.length;
    chars.forEach((charEl, idx) => {
      const charAmount = value >= 1 ? 1 : Math.max(0, Math.min(1, value * (totalChars + 2) - idx));
      charEl.style.opacity = charAmount.toFixed(3);
      charEl.style.transform = `translateY(${((1 - charAmount) * 10).toFixed(2)}px)`;
      const glow = Math.sin(charAmount * Math.PI);
      charEl.style.textShadow = glow > 0.05 && value < 1
        ? `0 0 ${Math.round(glow * 16)}px rgba(255, 108, 64, ${(glow * 0.85).toFixed(2)})`
        : "";
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
    revealName(motion.matches ? 1 : 0);
    // Progressive-enhancement backstop: import/GPU/observer failure cannot hide identity.
    const timer = window.setTimeout(() => revealName(1), 3600);
    const changed = () => { if (motion.matches) revealName(1); };
    motion.addEventListener("change", changed);
    return () => { window.clearTimeout(timer); motion.removeEventListener("change", changed); };
  }, [revealName]);
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
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timeline = createHeroIntroTimeline({ elements: {
      headlineLines: [...el.querySelectorAll(".fh-headline-line")], nameWords: [],
      labelBadge: el.querySelector(".fh-kicker"), portraitContainer: el.querySelector(".fh-portrait"), actions: el.querySelector(".fh-actions")
    }, isReducedMotion: motion.matches });
    const change = () => { if (motion.matches) timeline.skip(); };
    motion.addEventListener("change", change); timeline.play();
    return () => { motion.removeEventListener("change", change); timeline.kill(); };
  }, []);
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
            h("a", { href: resumeHref, className: "fh-resume", target: "_blank", rel: "noopener noreferrer" },
              h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true }, h("path", { d: "M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5" })), "View Résumé (PDF)"))),
        h("div", { className: "fh-visual" },
          h("div", { className: "fh-portrait" }, h("picture", { "data-portrait-theme": theme },
            h("img", { src: portraitSrc,
              alt: "Md. Fardin Hossain in a brown T-shirt with an orange halo", width: 1087, height: 1447,
              loading: "eager", fetchPriority: "high", decoding: "async", draggable: false }))),
          h(HeroAuraFlyingRobot, {
            onActivate: activate,
            open: chatOpen,
            onRevealProgress: revealName,
            onAssistantProgress: assistantProgress,
            onPhase: phase,
            onStage: stage
          }),
          mobileName && identity)),
      h("ul", { className: "fh-strengths", "aria-label": "Areas of focus" }, STRENGTHS.map(([type, first, second]) =>
        h("li", { key: type }, h("span", { className: "fh-strength-icon" }, h(StrengthIcon, { type })), h("span", null, first, h("br"), second))))),
    h(PortfolioAssistant, { open: chatOpen, onClose: () => setChatOpen(false), returnFocusRef: lastLauncher })
  );
}
