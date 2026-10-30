import React, { useEffect, useRef, useState, useCallback } from "react";
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
export function ScrollWordReveal({ text = "", className = "", delay = 0, as = "p", highlights = [], srText = text }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  useEffect(() => {
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
  }, [text, reduced]);

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
  { id: "who-i-am", number: "01", title: "Who I Am", note: "Identity" },
  { id: "what-i-build", number: "02", title: "What I Build", note: "Capabilities" },
  { id: "why-me", number: "03", title: "Why Me", note: "Strengths" },
  { id: "how-i-work", number: "04", title: "How I Work", note: "Process" }
];
const capabilities = [
  ["frontend", "Frontend Development", "Responsive layouts and interactive interfaces that make applications easy to use."],
  ["backend", "Backend Development", "Server-side logic and services that support reliable application behavior."],
  ["database", "Databases and APIs", "Structured data, clear queries, and API connections between application layers."],
  ["fullstack", "Full-Stack Applications", "Connected frontend, backend, and database systems built around real needs."]
];
const process = [
  ["understand", "Understand", "Clarify the problem, users, and requirements."],
  ["plan", "Plan", "Outline the structure and choose practical tools."],
  ["build", "Build", "Implement in small, maintainable steps."],
  ["test", "Test", "Check behavior, edge cases, and usability."],
  ["improve", "Improve", "Refine the work through feedback and learning."]
];
const iconPaths = {
  student: "m2 8 10-5 10 5-10 5z M6 10v7c4 3 8 3 12 0v-7 M22 8v8",
  solver: "M9 18h6 M9 21h6 M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3",
  learner: "M3 3v18h19 M7 17v-5h3v5 M13 17V9h3v8 M19 17V5h3v12 M6 7l5-3 4 1 6-4",
  frontend: "M3 5h18v14H3z M3 9h18 M7 7h.01 M10 7h.01",
  backend: "M4 3h16v7H4z M4 14h16v7H4z M7 6.5h.01 M7 17.5h.01 M11 6.5h6 M11 17.5h6",
  database: "M4 6c0-4 16-4 16 0s-16 4-16 0v12c0 4 16 4 16 0V6 M4 12c0 4 16 4 16 0",
  fullstack: "m12 3 10 5-10 5L2 8z M2 12l10 5 10-5 M2 16l10 5 10-5",
  understand: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14 M15 15l6 6",
  plan: "M7 3h10v4H7z M7 5H4v16h16V5h-3 M8 12h8 M8 16h5",
  build: "m8 6-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18",
  test: "m5 12 4 4L19 6 M21 12v8H3V4h11",
  improve: "M20 7a9 9 0 1 0 1 8 M20 2v5h-5"
};
function Icon({ name }) {
  return h("svg", { className: "ae-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" },
    h("path", { d: iconPaths[name] }));
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

export function AboutScrollStory() {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const sectionRef = useRef(null);
  const navRef = useRef(null);
  const navLinksRef = useRef(null);
  const dotRefs = useRef([]);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, ready: false });
  const [isFlying, setIsFlying] = useState(false);
  const [flightDir, setFlightDir] = useState(1);
  const prevActiveRef = useRef(active);
  const [theme, setTheme] = useState(getCurrentTheme);
  const reduced = useReducedMotion();

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
  }, [updateRobotPosition]);

  useEffect(() => {
    const unsubscribe = subscribeTheme(setTheme);
    setTheme(getCurrentTheme());
    return unsubscribe;
  }, []);

  // One geometry contract for tracker selection, clicks and native anchors.
  // The tracker itself is a direct sticky layout child (no short wrapper),
  // so its containing block includes every chapter rather than a short aside.
  const anchorOffset = () => {
    const section = sectionRef.current;
    const top = section ? parseFloat(getComputedStyle(section).getPropertyValue("--ae-nav-top")) || 0 : 64;
    return top + (window.matchMedia("(max-width: 700px)").matches ? navRef.current?.offsetHeight || 90 : 0) + 16;
  };

  // Deterministic chapter selection: last heading above a viewport anchor wins.
  // Unlike intersection-entry order, this also works for tall chapters and jumps.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const anchor = anchorOffset();
      sectionRef.current?.style.setProperty("--ae-anchor-offset", `${anchor}px`);
      let next = 0;
      refs.current.forEach((el, index) => {
        if (el && el.getBoundingClientRect().top <= anchor + 2) next = index;
      });
      setActive(previous => previous === next ? previous : next);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(measure); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    refs.current.forEach(el => { if (el) observer?.observe(el); });
    if (navRef.current) observer?.observe(navRef.current);
    if (sectionRef.current) observer?.observe(sectionRef.current);
    const reveals = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("ae-entered"); reveals.unobserve(entry.target); } });
    }, { threshold: 0.08 }) : null;
    refs.current.forEach(el => { if (el) reveals?.observe(el); });
    schedule();
    return () => {
      reveals?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  const navigate = (event, index) => {
    const target = refs.current[index];
    if (!target || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Explicit instant bypasses any global CSS smooth scrolling in reduced mode.
    scrollToTarget(target, { offset: -anchorOffset(), immediate: reduced });
    history.pushState(history.state, "", `#${chapters[index].id}`);
    target.focus({ preventScroll: true });
  };
  const article = (index, ...content) => h("article", {
    key: chapters[index].id, id: chapters[index].id, className: "ae-chapter",
    ref: el => { refs.current[index] = el; }, tabIndex: -1,
    "aria-labelledby": `ae-heading-${index}`
  }, h("header", { className: "ae-chapter-header" },
    h("span", { className: "ae-kicker" }, `CHAPTER ${chapters[index].number}`),
    h("h3", { id: `ae-heading-${index}`, className: "ae-chapter-title" }, chapters[index].title)), ...content);
  const paragraph = text => h(ScrollWordReveal, { text, className: "ae-copy" });

  return h("section", { ref: sectionRef, id: "about", className: "ae-section", "aria-labelledby": "ae-title" },
    h("div", { className: "ae-inner" },
      h("header", { className: "ae-intro" },
        h("h2", { id: "ae-title", className: "ae-title" }, "About ", h("span", { className: "ae-title-accent" }, "Me")),
        h("div", { className: "ae-quote-wrap" },
          h("span", { className: "ae-quote-mark", "aria-hidden": "true" }, "“"),
          h(ScrollWordReveal, {
            as: "blockquote", className: "ae-quote", text: "I turn complex problems into practical digital experiences.”",
            srText: "“I turn complex problems into practical digital experiences.”",
            highlights: ["complex problems", "digital experiences"]
          }))),
      h("div", { className: "ae-layout" },
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
        h("div", { className: "ae-content" },
          article(0,
            paragraph("I’m a Computer Science and Engineering student and full-stack developer who enjoys turning ideas into reliable, user-friendly software. I build web applications, connect frontend experiences with backend services and databases, and focus on writing maintainable code."),
            h("ul", { className: "ae-labels", "aria-label": "At a glance" }, ["CSE Student", "Full-Stack Developer", "Problem Solver", "Lifelong Learner"].map(label => h("li", { className: "ae-label", key: label }, h(Icon, { name: label === "CSE Student" ? "student" : label === "Full-Stack Developer" ? "build" : label === "Problem Solver" ? "solver" : "learner" }), label)))),
          article(1,
            paragraph("I build responsive web applications, interactive user interfaces, backend APIs, database-driven systems, and practical full-stack products."),
            h("div", { className: "ae-capabilities" }, capabilities.map(([icon, title, description]) =>
              h("div", { className: "ae-capability", key: title }, h(Icon, { name: icon }),
                h("h4", { className: "ae-small-title" }, title), h("p", { className: "ae-detail" }, description))))),
          article(2,
            paragraph("I combine a solid computer science foundation with a practical approach to software development. I enjoy understanding problems before choosing solutions, writing maintainable code, debugging complex issues, and improving my work through testing and feedback."),
            h("ul", { className: "ae-strengths", "aria-label": "Core strengths" }, ["Problem Solving", "Clean Code", "Thoughtful Architecture", "Continuous Learning"].map((label, index) =>
              h("li", { className: "ae-strength", key: label }, h(Icon, { name: ["understand", "build", "fullstack", "improve"][index] }), label)))),
          article(3,
            h("p", { className: "ae-copy" }, "A thoughtful process, from the first question to the next iteration."),
            h("ol", { className: "ae-process", "aria-label": "Development process" }, process.map(([icon, title, description], index) =>
              h("li", { className: "ae-step", key: title, style: { "--ae-step": index } },
                h("div", { className: "ae-step-node" }, h(Icon, { name: icon })),
                h("span", { className: "ae-step-number", "aria-hidden": "true" }, `0${index + 1}`),
                h("h4", { className: "ae-small-title" }, title), h("p", { className: "ae-detail" }, description))))))))) ;
}
