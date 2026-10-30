import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { createHeroIntroTimeline } from "./hero-intro-timeline.js";
import { PROFILE_DATA } from "./data.js";
import { getCurrentTheme, subscribeTheme } from "./theme-manager.js";
import { PortfolioAssistant } from "./assistant-chat.js";

const h = React.createElement;
const STRENGTHS = [["code", "Full-Stack", "Developer"], ["chip", "AI & ML", "Enthusiast"], ["target", "Problem", "Solver"], ["book", "Continuous", "Learner"]];
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
export function HeroAuraFlyingRobot({ onActivate, open = false, onRevealProgress, onPhase }) {
  const host = useRef(null);
  const hitbox = useRef(null);
  const controller = useRef(null);
  const current = useRef({ onActivate, open, onRevealProgress, onPhase });
  current.current = { onActivate, open, onRevealProgress, onPhase };
  const activity = useRef({ hover: false, focus: false });
  const syncPause = () => controller.current?.setPaused(current.current.open || activity.current.hover || activity.current.focus);
  useEffect(() => { syncPause(); }, [open]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let started = false;
    let idleHandle;
    let timerHandle;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => controller.current?.setReducedMotion(motion.matches);
    motion.addEventListener("change", updateMotion);
    const unavailable = () => { current.current.onRevealProgress?.(1); current.current.onPhase?.("unavailable"); };
    const load = () => {
      if (started || cancelled) return;
      started = true;
      import("./hero-orbit-scene.js").then(({ mountHeroOrbit }) => {
        if (cancelled) return;
        controller.current = mountHeroOrbit(el, {
          reducedMotion: motion.matches,
          onPhase: value => current.current.onPhase?.(value),
          onRevealProgress: value => current.current.onRevealProgress?.(value),
          onPosition: position => {
            const button = hitbox.current;
            if (!button) return;
            const width = Math.max(44, position.width);
            const height = Math.max(44, position.height);
            button.style.width = `${width}px`;
            button.style.height = `${height}px`;
            button.style.left = `${Math.max(0, Math.min(el.clientWidth - width, position.x - (width - position.width) / 2))}px`;
            button.style.top = `${Math.max(0, Math.min(el.clientHeight - height, position.y - (height - position.height) / 2))}px`;
            button.style.visibility = position.visible ? "visible" : "hidden";
            button.tabIndex = position.visible ? 0 : -1;
          }
        });
        syncPause();
      }).catch(unavailable);
    };
    const schedule = () => {
      if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(load, { timeout: 500 });
      else timerHandle = window.setTimeout(load, 80);
    };
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { observer.disconnect(); schedule(); } }, { threshold: 0.03 });
      observer.observe(el);
    } else schedule();
    return () => {
      cancelled = true;
      observer?.disconnect();
      if (idleHandle !== undefined) window.cancelIdleCallback?.(idleHandle);
      window.clearTimeout(timerHandle);
      motion.removeEventListener("change", updateMotion);
      controller.current?.dispose();
      controller.current = null;
    };
  }, []);
  return h(React.Fragment, null,
    h("div", { ref: host, className: "fh-orbit-host", "aria-hidden": true }),
    h("button", {
      ref: hitbox, className: "fh-robot-hitbox", type: "button", style: { visibility: "hidden" }, tabIndex: -1,
      "aria-label": "Open Fardin's AI assistant", "aria-haspopup": "dialog", "aria-expanded": open,
      onClick: event => current.current.onActivate?.(event.currentTarget),
      onPointerEnter: () => { activity.current.hover = true; syncPause(); },
      onPointerLeave: () => { activity.current.hover = false; syncPause(); },
      onFocus: () => { activity.current.focus = true; syncPause(); },
      onBlur: () => { activity.current.focus = false; syncPause(); }
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
    root.current?.querySelectorAll(".fh-name-word").forEach((word, index) => {
      const amount = Math.max(0, Math.min(1, value * 3 - index));
      word.style.opacity = amount;
      word.style.transform = `translateY(${(1 - amount) * 10}px)`;
      word.style.clipPath = `inset(0 ${(1 - amount) * 100}% 0 0)`;
    });
    if (root.current) root.current.dataset.nameRevealed = value >= 1 ? "true" : "false";
  }, []);
  const phase = useCallback(value => { if (root.current) root.current.dataset.mascotPhase = value; }, []);
  useLayoutEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    revealName(motion.matches ? 1 : 0);
    // Progressive-enhancement backstop: import/GPU/observer failure cannot hide identity.
    const timer = window.setTimeout(() => revealName(1), 3600);
    const changed = () => { if (motion.matches) revealName(1); };
    motion.addEventListener("change", changed);
    return () => { window.clearTimeout(timer); motion.removeEventListener("change", changed); };
  }, []);
  useLayoutEffect(() => { revealName(progress.current); }, [mobileName]);
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
    h("span", { className: "fh-name-visual", "aria-hidden": true },
      h("span", { className: "fh-name-word" }, "MD."), " ",
      h("span", { className: "fh-name-word fh-name-accent" }, "FARDIN"), " ",
      h("span", { className: "fh-name-word" }, "HOSSAIN")));
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
          h(HeroAuraFlyingRobot, { onActivate: activate, open: chatOpen, onRevealProgress: revealName, onPhase: phase }),
          mobileName && identity)),
      h("ul", { className: "fh-strengths", "aria-label": "Areas of focus" }, STRENGTHS.map(([type, first, second]) =>
        h("li", { key: type }, h("span", { className: "fh-strength-icon" }, h(StrengthIcon, { type })), h("span", null, first, h("br"), second))))),
    createPortal(h("button", { className: "fh-chat-launcher", type: "button", "aria-label": "Ask Fardin's assistant", "aria-haspopup": "dialog", "aria-expanded": chatOpen,
      onClick: event => activate(event.currentTarget) }, h(ChatGlyph), h("span", null, "Ask about my work")), document.body),
    h(PortfolioAssistant, { open: chatOpen, onClose: () => setChatOpen(false), returnFocusRef: lastLauncher })
  );
}
