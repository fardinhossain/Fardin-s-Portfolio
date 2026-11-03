import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { scrollToTarget } from "./smooth-scroll.js";
import { getCurrentTheme, subscribeTheme } from "./theme-manager.js";

const h = React.createElement;
const motionQuery = "(prefers-reduced-motion: reduce)";
const reducedMotion = () => typeof window !== "undefined" && !!window.matchMedia?.(motionQuery).matches;

function useReducedMotion() {
  const [reduced, setReduced] = useState(reducedMotion);
  useEffect(() => {
    const media = window.matchMedia?.(motionQuery);
    if (!media) return;
    const update = () => setReduced(media.matches);
    update();
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener(update);
    };
  }, []);
  return reduced;
}

// Whitespace remains literal React text nodes (including newlines), not margins.
// A single semantic copy avoids fragmented announcements of individual tokens.
// Enhancement animates on entry but NEVER hides content while waiting for JS/IO.
// Optional `play` makes the reveal controlled (replays each time it turns true),
// used by the one-chapter-at-a-time About stage.
export function ScrollWordReveal({ text = "", className = "", delay = 0, as = "p", highlights = [], srText = text, play }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const controlled = typeof play === "boolean";
  useEffect(() => {
    if (controlled) { setEntered(play); return; }
    setEntered(false);
    if (reduced || !ref.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [text, reduced, controlled, play]);

  let offset = 0;
  let word = 0;
  const ranges = highlights.flatMap(phrase => {
    const start = text.indexOf(phrase);
    return start < 0 ? [] : [[start, start + phrase.length]];
  });
  const tokens = text.split(/(\s+)/u).map((token, index) => {
    const start = offset;
    offset += token.length;
    if (!token || /^\s+$/u.test(token)) return token;
    const accent = ranges.some(([a, b]) => start >= a && start < b);
    return h("span", {
      key: index,
      className: `ae-word${accent ? " ae-word-accent" : ""}`,
      style: { "--ae-word-delay": `${Math.min(delay + word++ * 18, 650)}ms` }
    }, token);
  });
  return h(as, { ref, className: `ae-reveal ${className}${entered && !reduced ? " ae-reveal-entered" : ""}` },
    h("span", { className: "ae-sr-only" }, srText),
    h("span", { className: "ae-reveal-visual", "aria-hidden": "true" }, tokens));
}

const chapters = [
  { id: "who-i-am", number: "01", title: "Who I Am", lead: "Who", accent: "I Am", note: "Identity", icon: "user" },
  { id: "what-i-build", number: "02", title: "What I Build", lead: "What I", accent: "Build", note: "Capabilities", icon: "code2" },
  { id: "why-me", number: "03", title: "Why Me", lead: "Why", accent: "Me", note: "Strengths", icon: "target" },
  { id: "how-i-work", number: "04", title: "How I Work", lead: "How I", accent: "Work", note: "Process", icon: "refresh" }
];
const identity = [
  ["CSE Student", "graduation", "#ff7048"],
  ["Full-Stack Developer", "code2", "#ae79ed"],
  ["Problem Solver", "solver", "#e2b53b"],
  ["Lifelong Learner", "trending", "#39b59d"]
];
const capabilities = [
  ["monitor", "Frontend Development", "Responsive layouts and interactive interfaces that make applications easy to use."],
  ["backend", "Backend Development", "Server-side logic and services that support reliable application behavior."],
  ["database", "Databases and APIs", "Structured data, clear queries, and API connections between application layers."],
  ["fullstack", "Full-Stack Applications", "Connected frontend, backend, and database systems built around real needs."]
];
const strengths = [
  ["puzzle", "Problem Solving", "Break problems down before reaching for solutions."],
  ["braces", "Clean Code", "Readable, maintainable code that is easy to grow."],
  ["network", "Thoughtful Architecture", "Structures that stay simple as features are added."],
  ["refresh", "Continuous Learning", "Always improving through testing and feedback."]
];
const process = [
  ["understand", "Understand", "Clarify the problem, users, and requirements."],
  ["plan", "Plan", "Outline the structure and choose practical tools."],
  ["build", "Build", "Implement in small, maintainable steps."],
  ["flask", "Test", "Check behavior, edge cases, and usability."],
  ["sparkles", "Improve", "Refine the work through feedback and learning."]
];
const iconPaths = {
  student: "m2 8 10-5 10 5-10 5z M6 10v7c4 3 8 3 12 0v-7 M22 8v8",
  solver: "M9 18h6 M10 22h4 M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
  learner: "M3 3v18h19 M7 17v-5h3v5 M13 17V9h3v8 M19 17V5h3v12 M6 7l5-3 4 1 6-4",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  graduation: "M22 10 12 5 2 10l10 5 10-5z M6 12v5c3 3 9 3 12 0v-5 M22 10v6",
  code2: "m18 16 4-4-4-4 M6 8l-4 4 4 4 M14.5 4l-5 16",
  trending: "M22 7 13.5 15.5 8.5 10.5 2 17 M16 7h6v6",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  monitor: "M3 4h18v12H3z M8 20h8 M12 16v4",
  frontend: "M3 5h18v14H3z M3 9h18 M7 7h.01 M10 7h.01",
  backend: "M4 3h16v7H4z M4 14h16v7H4z M7 6.5h.01 M7 17.5h.01 M11 6.5h6 M11 17.5h6",
  database: "M4 6c0-4 16-4 16 0s-16 4-16 0v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0",
  fullstack: "m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5",
  puzzle: "M10 3h4v2a2 2 0 1 0 4 0V3h3v7h-2a2 2 0 1 0 0 4h2v7h-7v-2a2 2 0 1 0-4 0v2H3v-7h2a2 2 0 1 0 0-4H3V3h7z",
  braces: "M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1 M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1",
  network: "M9 2h6v6H9z M2 16h6v6H2z M16 16h6v6h-6z M5 16v-4h14v4 M12 12V8",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5",
  understand: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M21 21l-4.3-4.3",
  plan: "M9 2h6v4H9z M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M9 12h6 M9 16h4",
  build: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  flask: "M9 3h6 M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3 M7 15h10",
  sparkles: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z M19 3v4 M17 5h4 M5 17v4 M3 19h4",
  test: "m5 12 4 4L19 6 M21 12v8H3V4h11",
  improve: "M20 7a9 9 0 1 0 1 8 M20 2v5h-5",
  chevronLeft: "m15 18-6-6 6-6",
  chevronRight: "m9 18 6-6-6-6",
  arrowDown: "M12 5v14 M19 12l-7 7-7-7"
};
function Icon({ name }) {
  return h("svg", { className: "ae-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
    h("path", { d: iconPaths[name] }));
}

// Hand-drawn style curved arrows; pathLength=1 lets CSS "draw" them in.
const curvePaths = {
  note: ["M4 8 C 24 2, 48 10, 54 36", "M45 30 L54 37 L58 26"],
  over: ["M4 22 C 36 -4, 84 -4, 114 20", "M105 18 L114 20 L110 12"],
  under: ["M4 34 C 36 60, 84 60, 114 36", "M110 44 L114 36 L105 38"],
  vertical: ["M15 2 C 30 26, 0 50, 15 74", "M8 70 L15 74 L14 66"]
};
function CurvedArrow({ variant = "note", className = "" }) {
  const [line, head] = curvePaths[variant];
  const box = variant === "note" ? "0 0 62 44" : variant === "vertical" ? "0 0 30 80" : "0 0 120 58";
  return h("svg", { className: `ae-curve ae-curve-${variant} ${className}`, viewBox: box, preserveAspectRatio: variant === "note" ? "xMidYMid meet" : "none", "aria-hidden": "true", focusable: "false" },
    h("path", { d: line, pathLength: 1 }), h("path", { d: head, pathLength: 1, className: "ae-curve-head" }));
}

function ChapterHeader({ chapter, index }) {
  const leadWords = chapter.lead.split(" ");
  const title = [];
  leadWords.forEach((word, i) => {
    title.push(h("span", { key: `w${i}`, className: "ae-title-word", style: { "--d": `${140 + i * 90}ms` } }, word));
    title.push(" ");
  });
  title.push(h("span", { key: "accent", className: "ae-title-serif", style: { "--d": `${140 + leadWords.length * 90 + 60}ms` } }, chapter.accent));
  return h("header", { className: "ae-chapter-header" },
    h("span", { className: "ae-numeral", "aria-hidden": "true" }, chapter.number),
    h("span", { className: "ae-kicker ae-kicker-pill" },
      h("span", { className: "ae-kicker-icon" }, h(Icon, { name: chapter.icon })),
      `CHAPTER ${chapter.number}`,
      h("span", { className: "ae-kicker-dot", "aria-hidden": "true" }),
      chapter.note),
    h("h3", { id: `ae-heading-${index}`, className: "ae-chapter-title" }, title));
}

// A static, decorative echo of the hero. Import only when About is mounted;
// dispose even if the import resolves after an unmount (React Strict Mode safe).
export function AboutGhostRobot() {
  const host = useRef(null);
  useEffect(() => {
    let cancelled = false;
    let scene;
    import("./hero-orbit-scene.js").then(({ mountHeroOrbit }) => {
      if (!cancelled && host.current) {
        scene = mountHeroOrbit(host.current, { reducedMotion: true, stationary: true, modelScale: 1 });
      }
    }).catch(() => { /* Decorative enhancement: copy never depends on WebGL. */ });
    return () => { cancelled = true; scene?.dispose(); };
  }, []);
  return h("div", { ref: host, className: "ae-ghost-robot", "aria-hidden": "true", inert: "" });
}

// Miniature Flying Assistant Mascot (Bot F-01) for the About tracking rail
function FlyingTrackerRobot({ isFlying, direction, isMobile }) {
  const tiltDeg = isMobile
    ? (direction > 0 ? "16deg" : "-16deg")
    : (direction > 0 ? "12deg" : "-12deg");

  return h(
    "div",
    {
      className: `ae-tracker-robot ${isFlying ? "is-flying" : "is-hovering"}`,
      style: {
        "--flight-tilt": tiltDeg
      },
      "aria-hidden": "true"
    },
    h(
      "svg",
      {
        width: isMobile ? 32 : 36,
        height: isMobile ? 34 : 38,
        viewBox: "0 0 64 64",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: "ae-robot-svg"
      },
      // Top Antenna Stalk & Pulsing LED Beacon
      h("line", { x1: "32", y1: "5", x2: "32", y2: "14", stroke: "var(--ae-accent, #FF6238)", strokeWidth: "3", strokeLinecap: "round" }),
      h("circle", { cx: "32", cy: "5", r: "3.5", fill: "var(--ae-accent, #FF6238)", className: "ae-robot-antenna-led" }),

      // Aerodynamic porcelain dome head / chassis
      h("rect", { x: "13", y: "14", width: "38", height: "27", rx: "12", fill: "#FFFFFF", stroke: "#1E2638", strokeWidth: "2" }),

      // Curved Dark Visor Screen
      h("rect", { x: "18", y: "18", width: "28", height: "16", rx: "6", fill: "#0B0F19" }),

      // Expressive Glowing LED Eyes (Orange/Crimson theme)
      h("circle", { cx: "26", cy: "26", r: "3.2", fill: "var(--ae-accent, #FF6238)" }),
      h("circle", { cx: "38", cy: "26", r: "3.2", fill: "var(--ae-accent, #FF6238)" }),
      // Eye Gleam Highlights
      h("circle", { cx: "27", cy: "25", r: "1", fill: "#FFFFFF" }),
      h("circle", { cx: "39", cy: "25", r: "1", fill: "#FFFFFF" }),

      // Left & Right Aerodynamic Flight Winglets
      h("path", { d: "M13 25 L5 31 L13 35 Z", fill: "#CBD5E1", stroke: "#1E2638", strokeWidth: "1.6" }),
      h("path", { d: "M51 25 L59 31 L51 35 Z", fill: "#CBD5E1", stroke: "#1E2638", strokeWidth: "1.6" }),

      // Bottom Chassis / Engine Mount
      h("path", { d: "M20 41 L44 41 L40 49 L24 49 Z", fill: "#E2E8F0", stroke: "#1E2638", strokeWidth: "1.8" }),

      // Core Power Reactor LED
      h("circle", { cx: "32", cy: "45", r: "2.6", fill: "var(--ae-accent, #FF6238)" }),

      // Jet Thruster Exhaust Flame (Dynamic animated plasma flame)
      h("path", {
        className: "ae-robot-flame",
        d: "M26 49 Q32 63 38 49 Q32 54 26 49 Z",
        fill: "url(#aeRobotFlameGrad)"
      }),

      // Gradient definition for flame
      h(
        "defs",
        null,
        h(
          "linearGradient",
          { id: "aeRobotFlameGrad", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          h("stop", { offset: "0%", stopColor: "#FFDD00" }),
          h("stop", { offset: "55%", stopColor: "#FF6238" }),
          h("stop", { offset: "100%", stopColor: "#FF1E56", stopOpacity: "0" })
        )
      )
    )
  );
}

const PIN_QUERY = "(min-height: 480px)";
const pinMatches = () => typeof window !== "undefined" && !!window.matchMedia?.(PIN_QUERY).matches;

// One chapter at a time. Desktop ("pinned"): the stage sticks while the track
// scrolls; each quarter of the track is one chapter. Smaller/short screens
// ("tabs"): normal page scroll, chapters change via dots, Prev/Next or swipe.
export function AboutScrollStory() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState(() => (pinMatches() ? "pinned" : "tabs"));
  const [seen, setSeen] = useState(false);
  const [nav, setNav] = useState(null);
  const refs = useRef([]);
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const panelRef = useRef(null);
  const navRef = useRef(null);
  const navLinksRef = useRef(null);
  const dotRefs = useRef([]);
  const modeRef = useRef(mode);
  const activeRef = useRef(active);
  const lockRef = useRef(null);
  const lockTimer = useRef(0);
  const touch = useRef(null);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, ready: false });
  const [isFlying, setIsFlying] = useState(false);
  const [flightDir, setFlightDir] = useState(1);
  const prevActiveRef = useRef(active);
  const [theme, setTheme] = useState(getCurrentTheme);
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  modeRef.current = mode;
  activeRef.current = active;
  reducedRef.current = reduced;

  // Track active chapter change to trigger flight animation and tilt
  useEffect(() => {
    if (prevActiveRef.current !== active) {
      const dir = active > prevActiveRef.current ? 1 : -1;
      setFlightDir(dir);
      setIsFlying(true);
      prevActiveRef.current = active;
      const t = setTimeout(() => {
        setIsFlying(false);
      }, 550);
      return () => clearTimeout(t);
    }
  }, [active]);

  // Keep robot locked onto the active chapter dot center coordinates
  const updateRobotPosition = useCallback(() => {
    const container = navLinksRef.current;
    const targetDot = dotRefs.current[active];
    if (!container || !targetDot) return;
    const cRect = container.getBoundingClientRect();
    const dRect = targetDot.getBoundingClientRect();
    const x = dRect.left - cRect.left + dRect.width / 2;
    const y = dRect.top - cRect.top + dRect.height / 2;
    setRobotPos({ x, y, ready: true });
  }, [active]);

  useEffect(() => {
    updateRobotPosition();
    window.addEventListener("resize", updateRobotPosition);
    return () => window.removeEventListener("resize", updateRobotPosition);
  }, [updateRobotPosition, mode]);

  useEffect(() => {
    const unsubscribe = subscribeTheme(setTheme);
    setTheme(getCurrentTheme());
    return unsubscribe;
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.(PIN_QUERY);
    if (!media) return;
    const update = () => setMode(media.matches ? "pinned" : "tabs");
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener(update);
    };
  }, []);

  // Arrival animations start only once the stage is actually on screen.
  useEffect(() => {
    if (seen) return;
    const el = panelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const anchorOffset = () => {
    const section = sectionRef.current;
    const top = section ? parseFloat(getComputedStyle(section).getPropertyValue("--ae-nav-top")) || 0 : 64;
    return top + (window.matchMedia("(max-width: 700px)").matches ? navRef.current?.offsetHeight || 90 : 0) + 16;
  };
  const stageGeometry = () => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return null;
    const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
    return { track, stickyTop, travel, segment: travel / chapters.length };
  };

  // Pinned mode: active chapter is derived from progress through the track.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      sectionRef.current?.style.setProperty("--ae-anchor-offset", `${anchorOffset()}px`);
      if (modeRef.current !== "pinned" || lockRef.current !== null) return;
      const geo = stageGeometry();
      if (!geo) return;
      const progress = Math.min(Math.max((geo.stickyTop - geo.track.getBoundingClientRect().top) / geo.travel, 0), 0.9999);
      const next = Math.floor(progress * chapters.length);
      setActive(previous => previous === next ? previous : next);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    if (trackRef.current) observer?.observe(trackRef.current);
    if (navRef.current) observer?.observe(navRef.current);
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      clearTimeout(lockTimer.current);
    };
  }, [mode]);

  const goTo = useCallback((index, options = {}) => {
    const next = Math.max(0, Math.min(chapters.length - 1, index));
    setActive(next);
    setNav({ index: next, tick: Date.now() + Math.random(), ...options });
  }, []);

  // Runs after the new chapter is committed (no longer inert / display:none),
  // so scrolling and focus target the visible chapter.
  useLayoutEffect(() => {
    if (!nav) return;
    const { index, immediate, focus } = nav;
    const instant = immediate || reducedRef.current;
    const target = refs.current[index];
    if (modeRef.current === "pinned") {
      const geo = stageGeometry();
      if (geo) {
        const top = geo.track.getBoundingClientRect().top + window.scrollY - geo.stickyTop + geo.segment * (index + 0.25);
        lockRef.current = index;
        clearTimeout(lockTimer.current);
        const release = () => { lockRef.current = null; };
        scrollToTarget(top, { offset: 0, immediate: instant, onComplete: release });
        lockTimer.current = setTimeout(release, instant ? 60 : 1300);
      }
    } else if (target) {
      scrollToTarget(target, { offset: -anchorOffset(), immediate: instant });
    }
    if (focus) target?.focus({ preventScroll: true });
  }, [nav]);

  // Deep links (#why-me etc.) open the right chapter.
  useEffect(() => {
    const index = chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash);
    if (index < 0) return;
    const t = setTimeout(() => goTo(index, { immediate: true }), 150);
    return () => clearTimeout(t);
  }, [goTo]);

  const navigate = (event, index) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.pushState(history.state, "", `#${chapters[index].id}`);
    goTo(index, { focus: true });
  };

  const onTouchStart = event => {
    const t = event.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = event => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const t = event.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(activeRef.current + (dx < 0 ? 1 : -1));
  };

  const article = (index, ...content) => {
    const chapter = chapters[index];
    const isCurrent = index === active;
    const state = isCurrent ? "active" : index < active ? "before" : "after";
    return h("article", {
      key: chapter.id, id: chapter.id,
      className: `ae-chapter ae-chapter-${chapter.id}${isCurrent && seen ? " is-active" : ""}`,
      "data-state": state,
      ref: el => { refs.current[index] = el; }, tabIndex: -1,
      "aria-labelledby": `ae-heading-${index}`,
      "aria-hidden": isCurrent ? undefined : "true",
      inert: isCurrent ? undefined : ""
    }, h(ChapterHeader, { chapter, index }), ...content);
  };
  const playing = index => index === active && seen && !reduced;
  const paragraph = (index, text, highlights = []) => h(ScrollWordReveal, { text, className: "ae-copy", delay: 300, play: playing(index), highlights });
  const stagger = i => ({ "--i": i });

  return h("section", { ref: sectionRef, id: "about", className: "ae-section", "aria-labelledby": "ae-title" },
    h("div", { className: "ae-inner" },
      h("header", { className: "ae-intro section-summit-header" },
        h("div", { className: "section-summit-bg", "aria-hidden": "true" },
          h("picture", { className: "section-summit-pic" },
            h("source", {
              srcSet: theme === "light"
                ? "/assets/images/about-summitscape-light.webp"
                : "/assets/images/about-summitscape.webp",
              type: "image/webp"
            }),
            h("img", {
              src: theme === "light"
                ? "/assets/images/about-summitscape-light.png"
                : "/assets/images/about-summitscape.png",
              alt: "",
              width: 1568,
              height: 627,
              loading: "lazy",
              decoding: "async",
              className: "section-summit-img"
            })
          ),
          h("div", { className: "section-summit-glow" }),
          h("div", { className: "section-summit-overlay" })
        ),
        h("div", { className: "section-summit-inner" },
          h("div", { className: "section-summit-content" },
            h("h2", { id: "ae-title", className: "ae-title section-summit-title" },
              "About ",
              h("span", { className: "ae-title-accent section-summit-accent" }, "Me")
            ),
            h("p", { className: "section-summit-desc" },
              "Get to know me, my background, interests, and what I'm passionate about."
            )
          )
        )
      ),
      h("div", { className: "ae-quote-wrap" },
        h("span", { className: "ae-quote-mark", "aria-hidden": "true" }, "“"),
        h(ScrollWordReveal, {
          as: "blockquote", className: "ae-quote", text: "I turn complex problems into practical digital experiences.”",
          srText: "“I turn complex problems into practical digital experiences.”",
          highlights: ["complex problems", "digital experiences"]
        })),
      h("div", { ref: trackRef, className: "ae-layout", "data-mode": mode },
        h("div", { ref: stageRef, className: "ae-stage" },
          h("nav", { ref: navRef, className: "ae-nav ae-sidebar", "aria-label": "About chapters" },
            h("div", { ref: navLinksRef, className: "ae-nav-links", style: { "--ae-progress": active / 3 } },
              h("span", { className: "ae-nav-progress", "aria-hidden": "true" }),
              chapters.map((chapter, index) =>
                h("a", { key: chapter.id, href: `#${chapter.id}`, className: `ae-nav-link${index === active ? " ae-active" : ""}`,
                  "aria-current": active === index ? "location" : undefined,
                  "aria-label": `${chapter.number} ${chapter.title}`, onClick: event => navigate(event, index) },
                  h("span", { ref: el => { dotRefs.current[index] = el; }, className: "ae-nav-dot", "aria-hidden": "true" }),
                  h("span", { className: "ae-nav-number", "aria-hidden": "true" }, chapter.number),
                  h("span", { className: "ae-nav-title" }, chapter.title))),
              robotPos.ready && !reduced ? h("div", {
                className: "ae-robot-flight-wrapper",
                style: {
                  left: `${robotPos.x}px`,
                  top: `${robotPos.y}px`
                }
              }, h(FlyingTrackerRobot, {
                isFlying,
                direction: flightDir,
                isMobile: typeof window !== "undefined" && window.innerWidth <= 700
              })) : null
            ),
            h("p", { className: "ae-mobile-current" }, `${chapters[active].number} / ${chapters[active].title}`)),
          h("div", { ref: panelRef, className: "ae-content ae-panel", onTouchStart, onTouchEnd },
            h("div", { className: "ae-chapters" },
              article(0,
                paragraph(0, "I’m a Computer Science and Engineering student and full-stack developer who enjoys turning ideas into reliable, user-friendly software. I build web applications, connect frontend experiences with backend services and databases, and focus on writing maintainable code.", ["full-stack developer", "maintainable code"]),
                h("ul", { className: "ae-labels", "aria-label": "At a glance" }, identity.map(([label, icon, color], i) =>
                  h("li", { className: "ae-label ae-stagger", key: label, style: { ...stagger(i), "--c": color } },
                    h("span", { className: "ae-label-icon" }, h(Icon, { name: icon })), label)))),
              article(1,
                paragraph(1, "I build responsive web applications, interactive user interfaces, backend APIs, database-driven systems, and practical full-stack products.", ["responsive web applications", "full-stack products"]),
                h("div", { className: "ae-capabilities" }, capabilities.map(([icon, title, description], i) =>
                  h("div", { className: "ae-capability ae-stagger", key: title, style: stagger(i) },
                    h("div", { className: "ae-cap-head" },
                      h("span", { className: "ae-cap-icon" }, h(Icon, { name: icon })),
                      h("span", { className: "ae-cap-tag", "aria-hidden": "true" }, `/0${i + 1}`)),
                    h("h4", { className: "ae-small-title" }, title), h("p", { className: "ae-detail" }, description))))),
              article(2,
                paragraph(2, "I combine a solid computer science foundation with a practical approach to software development. I enjoy understanding problems before choosing solutions, writing maintainable code, debugging complex issues, and improving my work through testing and feedback.", ["solid computer science foundation", "practical approach"]),
                h("ul", { className: "ae-strengths", "aria-label": "Core strengths" }, strengths.map(([icon, label, description], i) =>
                  h("li", { className: "ae-strength ae-stagger", key: label, style: stagger(i) },
                    h("span", { className: "ae-strength-icon" }, h(Icon, { name: icon })),
                    h("span", { className: "ae-strength-body" },
                      h("strong", null, label),
                      h("span", null, description)))))),
              article(3,
                h("p", { className: "ae-copy" }, "A thoughtful process, from the first question to the next iteration."),
                h("ol", { className: "ae-process", "aria-label": "Development process" }, process.map(([icon, title, description], index) =>
                  h("li", { className: "ae-step ae-stagger", key: title, style: { "--ae-step": index, ...stagger(index) } },
                    h("div", { className: "ae-step-node" }, h(Icon, { name: icon })),
                    index < process.length - 1 ? h(CurvedArrow, { variant: index % 2 ? "under" : "over", className: "ae-step-arrow ae-step-arrow-h" }) : null,
                    index < process.length - 1 ? h(CurvedArrow, { variant: "vertical", className: "ae-step-arrow ae-step-arrow-v" }) : null,
                    h("span", { className: "ae-step-number", "aria-hidden": "true" }, `0${index + 1}`),
                    h("h4", { className: "ae-small-title" }, title), h("p", { className: "ae-detail" }, description)))))),
            h("div", { className: "ae-panel-footer" },
              h("span", { className: "ae-progress-track", "aria-hidden": "true" },
                h("span", { className: "ae-progress-fill", style: { width: `${((active + 1) / chapters.length) * 100}%` } })),
              h("span", { className: "ae-counter" }, h("strong", null, chapters[active].number), ` / 0${chapters.length}`),
              mode === "pinned" ? h("span", { className: "ae-scroll-hint", "aria-hidden": "true" }, active < chapters.length - 1 ? "Scroll to continue" : "Keep scrolling", h(Icon, { name: "arrowDown" })) : null,
              h("div", { className: "ae-pager" },
                h("button", { type: "button", className: "ae-pager-btn ae-pager-prev", onClick: () => goTo(active - 1), disabled: active === 0, "aria-label": "Previous chapter" }, h(Icon, { name: "chevronLeft" })),
                h("button", { type: "button", className: "ae-pager-btn ae-pager-next", onClick: () => goTo(active + 1), disabled: active === chapters.length - 1, "aria-label": "Next chapter" }, h(Icon, { name: "chevronRight" })))))))));
}
