import React, { useEffect, useRef, useState } from "react";
import { createHeroIntroTimeline } from "./hero-intro-timeline.js";
import { PROFILE_DATA } from "./data.js";
import { getCurrentTheme, subscribeTheme } from "./theme-manager.js";

const h = React.createElement;
const STRENGTHS = [
  ["code", "Full-Stack", "Developer"],
  ["chip", "AI & ML", "Enthusiast"],
  ["target", "Problem", "Solver"],
  ["book", "Continuous", "Learner"]
];
function StrengthIcon({ type }) {
  const paths = {
    code: ["M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16"],
    chip: ["M8 3v3m8-3v3M8 18v3m8-3v3M3 8h3m-3 8h3m12-8h3m-3 8h3", "M6 6h12v12H6zM10 10h4v4h-4z"],
    target: ["M12 2v4m0 12v4M2 12h4m12 0h4", "M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0M14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0"],
    book: ["M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"]
  };
  return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, paths[type].map((d, i) => h("path", { d, key: i })));
}

// The decorative renderer is downloaded only when this stage is visible and the
// browser is idle. Semantic content never waits on WebGL or this import.
export function HeroAuraFlyingRobot() {
  const host = useRef(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let cancelled = false;
    let started = false;
    let controller;
    let idleHandle;
    let timeoutHandle;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => controller?.setReducedMotion(motion.matches);
    motion.addEventListener?.("change", updateMotion);
    const load = () => {
      if (started || cancelled) return;
      started = true;
      import("./hero-orbit-scene.js").then(({ mountHeroOrbit }) => {
        if (!cancelled) controller = mountHeroOrbit(el, { reducedMotion: motion.matches });
      }).catch(() => { /* Portrait and all controls remain available without 3D. */ });
    };
    const schedule = () => {
      if ("requestIdleCallback" in window) idleHandle = window.requestIdleCallback(load, { timeout: 1200 });
      else timeoutHandle = window.setTimeout(load, 160);
    };
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { observer.disconnect(); schedule(); }
      }, { threshold: 0.05 });
      observer.observe(el);
    } else schedule();
    return () => {
      cancelled = true;
      observer?.disconnect();
      if (idleHandle !== undefined) window.cancelIdleCallback?.(idleHandle);
      window.clearTimeout(timeoutHandle);
      motion.removeEventListener?.("change", updateMotion);
      controller?.dispose();
    };
  }, []);
  return h("div", { ref: host, className: "fh-orbit-host", "aria-hidden": true });
}

export function CinematicHeroSection({ resumeUrl = PROFILE_DATA.resumeUrl, onNavigateContact }) {
  const root = useRef(null);
  const [theme, setTheme] = useState(() => getCurrentTheme());
  const [mobileName, setMobileName] = useState(() => window.matchMedia("(max-width: 700px)").matches);
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
    const timeline = createHeroIntroTimeline({
      elements: {
        headlineLines: [...el.querySelectorAll(".fh-headline-line")],
        nameWords: [el.querySelector(".fh-name")],
        labelBadge: el.querySelector(".fh-kicker"),
        portraitContainer: el.querySelector(".fh-portrait"),
        haloAura: el.querySelector(".fh-halo"),
        actions: el.querySelector(".fh-actions")
      },
      isReducedMotion: motion.matches
    });
    const change = () => { if (motion.matches) timeline.skip(); };
    motion.addEventListener?.("change", change);
    timeline.play();
    return () => { motion.removeEventListener?.("change", change); timeline.kill(); };
  }, []);
  const contact = (event) => {
    if (onNavigateContact) { event.preventDefault(); onNavigateContact(); }
  };
  const identity = h("p", { className: `fh-name${mobileName ? " fh-name-mobile" : ""}` },
    h("span", null, "MD."), " ", h("span", { className: "fh-name-accent" }, "FARDIN"), " ", h("span", null, "HOSSAIN"));
  const portraitWebp = theme === "light" ? "/assets/images/hero-portrait-light.webp" : "/assets/images/hero-portrait-dark.webp";
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
            h("span", { className: "fh-headline-line" }, "IMPACT")
          ),
          !mobileName && identity,
          h("div", { className: "fh-actions" },
            h("a", { href: "#contact", className: "fh-contact", onClick: contact }, "LET’S TALK", h("span", { "aria-hidden": true }, "→")),
            h("a", { href: resumeHref, className: "fh-resume", target: "_blank", rel: "noopener noreferrer" },
              h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true }, h("path", { d: "M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5" })),
              "View Résumé (PDF)"
            )
          )
        ),
        h("div", { className: "fh-visual" },
          h("div", { className: "fh-portrait" },
            h("picture", { "data-portrait-theme": theme },
              h("source", { type: "image/webp", srcSet: portraitWebp }),
              h("img", {
                src: theme === "light" ? PROFILE_DATA.heroPortraitLight : PROFILE_DATA.heroPortraitDark,
                alt: "Md. Fardin Hossain in a brown T-shirt with an orange halo",
                width: theme === "light" ? 1087 : 1086, height: theme === "light" ? 1447 : 1448, loading: "eager", fetchPriority: "high", decoding: "async", draggable: false
              }))),
          h(HeroAuraFlyingRobot),
          mobileName && identity
        )
      ),
      h("ul", { className: "fh-strengths", "aria-label": "Areas of focus" }, STRENGTHS.map(([type, first, second]) =>
        h("li", { key: type }, h("span", { className: "fh-strength-icon" }, h(StrengthIcon, { type })), h("span", null, first, h("br"), second))
      ))
    )
  );
}
