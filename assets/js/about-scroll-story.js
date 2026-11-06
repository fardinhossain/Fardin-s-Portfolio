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

export function ScrollWordReveal({ text = "", className = "", delay = 0, as = "p", highlights = [], srText = text, play }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const controlled = typeof play === "boolean";
  useEffect(() => {
    if (controlled) { setEntered(play); return; }
    setEntered(false);
    if (reduced || !ref.current || typeof IntersectionObserver === "undefined") {
      setEntered(true);
      return;
    }
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

export const ABOUT_CHAPTERS = [
  {
    id: "who-i-am",
    number: "01",
    tag: "IDENTITY",
    title: "Who I Am",
    lead: "Who",
    accent: "I Am",
    icon: "user",
    description: "I’m a Computer Science and Engineering student and full-stack developer who enjoys turning ideas into reliable, user-friendly software. I bridge design, resilient backend architecture, and intelligent systems.",
    highlights: ["Computer Science and Engineering", "full-stack developer", "intelligent systems"],
    darkImg: "/assets/images/about%20me/Who%20I%20Am_%20CSE%20Developer%20Identity.png",
    lightImg: "/assets/images/about%20me/Who%20I%20Am_%20CSE%20Student%20and%20Developer.png",
    alt: "Who I Am — CSE Developer Identity",
    layout: "left"
  },
  {
    id: "what-i-build",
    number: "02",
    tag: "CAPABILITIES",
    title: "What I Build",
    lead: "What I",
    accent: "Build",
    icon: "code2",
    description: "I build responsive web applications, interactive interfaces, backend APIs, database-driven systems, and practical full-stack AI products designed for speed, scalability, and real-world utility.",
    highlights: ["responsive web applications", "backend APIs", "full-stack AI products"],
    darkImg: "/assets/images/about%20me/What%20I%20Build_%20AI-Powered%20Products.png",
    lightImg: "/assets/images/about%20me/Capabilities_%20From%20Idea%20to%20AI%20Product.png",
    alt: "What I Build — AI-Powered Products & Capabilities",
    layout: "right"
  },
  {
    id: "why-me",
    number: "03",
    tag: "STRENGTHS",
    title: "Why Me",
    lead: "Why",
    accent: "Me",
    icon: "target",
    description: "I combine a solid computer science foundation with a practical, product-minded approach. I break problems down before reaching for solutions, write clean maintainable code, and iterate rapidly through testing.",
    highlights: ["solid computer science foundation", "clean maintainable code", "iterate rapidly"],
    darkImg: "/assets/images/about%20me/Why%20Me_%20Strengths%20in%20Code.png",
    lightImg: "/assets/images/about%20me/whymelight.png",
    alt: "Why Me — Strengths in Code & Engineering Approach",
    layout: "left"
  },
  {
    id: "how-i-work",
    number: "04",
    tag: "PROCESS",
    title: "How I Work",
    lead: "How I",
    accent: "Work",
    icon: "refresh",
    description: "A thoughtful, transparent workflow from initial problem clarity to architecture planning, modular execution, thorough validation, and continuous refinement through feedback.",
    highlights: ["thoughtful, transparent workflow", "modular execution", "thorough validation"],
    darkImg: "/assets/images/about%20me/How%20I%20Work_%20A%20Neon%20Process%20Path.png",
    lightImg: "/assets/images/about%20me/How%20I%20Work_%20A%20Thoughtful%20Process.png",
    alt: "How I Work — Process Path & Workflow",
    layout: "right"
  }
];

const iconPaths = {
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  code2: "m18 16 4-4-4-4 M6 8l-4 4 4 4 M14.5 4l-5 16",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12 M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5",
  arrowDown: "M12 5v14 M19 12l-7 7-7-7"
};

function Icon({ name }) {
  return h("svg", {
    className: "ae-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false"
  }, h("path", { d: iconPaths[name] || iconPaths.user }));
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
      style: { "--flight-tilt": tiltDeg },
      "aria-hidden": "true"
    },
    h(
      "svg",
      {
        width: isMobile ? 30 : 34,
        height: isMobile ? 32 : 36,
        viewBox: "0 0 64 64",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: "ae-robot-svg"
      },
      h("line", { x1: "32", y1: "5", x2: "32", y2: "14", stroke: "var(--ae-accent, #FF6238)", strokeWidth: "3", strokeLinecap: "round" }),
      h("circle", { cx: "32", cy: "5", r: "3.5", fill: "var(--ae-accent, #FF6238)", className: "ae-robot-antenna-led" }),
      h("rect", { x: "13", y: "14", width: "38", height: "27", rx: "12", fill: "#FFFFFF", stroke: "#1E2638", strokeWidth: "2" }),
      h("rect", { x: "18", y: "18", width: "28", height: "16", rx: "6", fill: "#0B0F19" }),
      h("circle", { cx: "26", cy: "26", r: "3.2", fill: "var(--ae-accent, #FF6238)" }),
      h("circle", { cx: "38", cy: "26", r: "3.2", fill: "var(--ae-accent, #FF6238)" }),
      h("circle", { cx: "27", cy: "25", r: "1", fill: "#FFFFFF" }),
      h("circle", { cx: "39", cy: "25", r: "1", fill: "#FFFFFF" }),
      h("path", { d: "M13 25 L5 31 L13 35 Z", fill: "#CBD5E1", stroke: "#1E2638", strokeWidth: "1.6" }),
      h("path", { d: "M51 25 L59 31 L51 35 Z", fill: "#CBD5E1", stroke: "#1E2638", strokeWidth: "1.6" }),
      h("path", { d: "M20 41 L44 41 L40 49 L24 49 Z", fill: "#E2E8F0", stroke: "#1E2638", strokeWidth: "1.8" }),
      h("circle", { cx: "32", cy: "45", r: "2.6", fill: "var(--ae-accent, #FF6238)" }),
      h("path", { className: "ae-robot-flame", d: "M26 49 Q32 63 38 49 Q32 54 26 49 Z", fill: "url(#aeRobotFlameGrad2)" }),
      h("defs", null,
        h("linearGradient", { id: "aeRobotFlameGrad2", x1: "0%", y1: "0%", x2: "0%", y2: "100%" },
          h("stop", { offset: "0%", stopColor: "#FFDD00" }),
          h("stop", { offset: "55%", stopColor: "#FF6238" }),
          h("stop", { offset: "100%", stopColor: "#FF1E56", stopOpacity: "0" })
        )
      )
    )
  );
}

export function AboutGhostRobot() {
  const host = useRef(null);
  useEffect(() => {
    let cancelled = false;
    let scene;
    import("./hero-orbit-scene.js").then(({ mountHeroOrbit }) => {
      if (!cancelled && host.current) {
        scene = mountHeroOrbit(host.current, { reducedMotion: true, stationary: true, modelScale: 1 });
      }
    }).catch(() => {});
    return () => { cancelled = true; scene?.dispose(); };
  }, []);
  return h("div", { ref: host, className: "ae-ghost-robot", "aria-hidden": "true", inert: "" });
}

export function AboutScrollStory() {
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState(getCurrentTheme);
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const navLinksRef = useRef(null);
  const dotRefs = useRef([]);
  const chapterRefs = useRef([]);
  const [robotPos, setRobotPos] = useState({ x: 0, y: 0, ready: false });
  const [isFlying, setIsFlying] = useState(false);
  const [flightDir, setFlightDir] = useState(1);
  const prevActiveRef = useRef(active);

  useEffect(() => {
    const unsubscribe = subscribeTheme(setTheme);
    setTheme(getCurrentTheme());
    return unsubscribe;
  }, []);

  // Update robot flying state on active chapter switch
  useEffect(() => {
    if (prevActiveRef.current !== active) {
      const dir = active > prevActiveRef.current ? 1 : -1;
      setFlightDir(dir);
      setIsFlying(true);
      prevActiveRef.current = active;
      const t = setTimeout(() => setIsFlying(false), 520);
      return () => clearTimeout(t);
    }
  }, [active]);

  // Position robot beside active chapter dot
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

  // Scroll spy: observe which chapter card is in viewport
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);
            if (!Number.isNaN(index)) {
              setActive(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "-20% 0px -40% 0px",
        threshold: 0.15
      }
    );

    chapterRefs.current.forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Chapter navigation click handler
  const navigateToChapter = (event, index) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const chapter = ABOUT_CHAPTERS[index];
    if (!chapter) return;
    history.pushState(history.state, "", `#${chapter.id}`);
    setActive(index);
    const target = chapterRefs.current[index];
    if (target) {
      const offset = (window.innerWidth <= 700 ? 110 : 100);
      scrollToTarget(target, { offset: -offset, immediate: reduced });
      target.focus({ preventScroll: true });
    }
  };

  // Deep linking support
  useEffect(() => {
    const hash = window.location.hash;
    const index = ABOUT_CHAPTERS.findIndex(c => `#${c.id}` === hash);
    if (index >= 0) {
      const t = setTimeout(() => {
        setActive(index);
        const target = chapterRefs.current[index];
        if (target) {
          const offset = (window.innerWidth <= 700 ? 110 : 100);
          scrollToTarget(target, { offset: -offset, immediate: true });
        }
      }, 200);
      return () => clearTimeout(t);
    }
  }, []);

  return h("section", { ref: sectionRef, id: "about", className: "ae-section ae-visual-section", "aria-labelledby": "ae-title" },
    h("div", { className: "ae-inner" },
      // Section Summit Header
      h("header", { className: "ae-intro section-summit-header reveal-on-scroll" },
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
              "Discover my story, core strengths, technical capabilities, and thoughtful process through a progressive visual journey."
            )
          )
        )
      ),

      // Semantic Quote Block (Maintained for narrative & test verification)
      h("div", { className: "ae-quote-wrap reveal-on-scroll" },
        h("span", { className: "ae-quote-mark", "aria-hidden": "true" }, "“"),
        h(ScrollWordReveal, {
          as: "blockquote",
          className: "ae-quote",
          text: "I turn complex problems into practical digital experiences.”",
          srText: "“I turn complex problems into practical digital experiences.”",
          highlights: ["complex problems", "digital experiences"]
        })
      ),

      // Main Narrative Container: Sticky Tracking Rail + Story Cards Stream
      h("div", { className: "ae-story-container" },
        // Floating/Sticky Chapter Navigation Rail
        h("nav", { className: "ae-sticky-nav ae-nav", "aria-label": "About chapters navigation" },
          h("div", { ref: navLinksRef, className: "ae-nav-rail" },
            ABOUT_CHAPTERS.map((ch, idx) =>
              h("a", {
                key: ch.id,
                href: `#${ch.id}`,
                className: `ae-nav-link${active === idx ? " ae-active" : ""}`,
                "aria-current": active === idx ? "location" : undefined,
                "aria-label": `${ch.number} ${ch.title}`,
                onClick: event => navigateToChapter(event, idx)
              },
                h("span", { ref: el => { dotRefs.current[idx] = el; }, className: "ae-nav-dot", "aria-hidden": "true" }),
                h("span", { className: "ae-nav-number", "aria-hidden": "true" }, ch.number),
                h("span", { className: "ae-nav-title" }, ch.title)
              )
            ),
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
          h("p", { className: "ae-mobile-tracker-label" },
            h("span", { className: "ae-mobile-tracker-num" }, ABOUT_CHAPTERS[active]?.number),
            " / ",
            ABOUT_CHAPTERS[active]?.title
          )
        ),

        // Scroll-Driven Image Story Stream
        h("div", { className: "ae-stream" },
          ABOUT_CHAPTERS.map((chapter, index) => {
            const imgSrc = theme === "light" ? chapter.lightImg : chapter.darkImg;
            const isLeft = chapter.layout === "left";
            return h("article", {
              key: chapter.id,
              id: chapter.id,
              ref: el => { chapterRefs.current[index] = el; },
              "data-index": index,
              className: `ae-chapter ae-stream-card reveal-image-card ${isLeft ? "is-layout-left" : "is-layout-right"}`,
              tabIndex: -1,
              "aria-labelledby": `ae-heading-${index}`
            },
              // Image Card with Subtle Bottom Fade
              h("div", { className: "ae-card-media" },
                h("div", { className: "ae-image-card" },
                  h("picture", { className: "ae-card-picture" },
                    h("source", { srcSet: imgSrc, type: "image/png" }),
                    h("img", {
                      src: imgSrc,
                      alt: chapter.alt,
                      width: 1086,
                      height: 1448,
                      loading: index === 0 ? "eager" : "lazy",
                      decoding: "async",
                      className: "ae-card-img"
                    })
                  ),
                  h("div", { className: "ae-image-fade", "aria-hidden": "true" }),
                  h("div", { className: "ae-image-vignette", "aria-hidden": "true" })
                )
              ),

              // Editorial Narrative Column
              h("div", { className: "ae-card-narrative" },
                h("div", { className: "ae-card-kicker-row" },
                  h("span", { className: "ae-numeral", "aria-hidden": "true" }, chapter.number),
                  h("span", { className: "ae-kicker ae-kicker-pill" },
                    h("span", { className: "ae-kicker-icon" }, h(Icon, { name: chapter.icon })),
                    `CHAPTER ${chapter.number}`,
                    h("span", { className: "ae-kicker-dot", "aria-hidden": "true" }),
                    chapter.tag
                  )
                ),
                h("h3", { id: `ae-heading-${index}`, className: "ae-chapter-title" },
                  h("span", { className: "ae-title-word" }, chapter.lead),
                  " ",
                  h("span", { className: "ae-title-serif" }, chapter.accent)
                ),
                h(ScrollWordReveal, {
                  text: chapter.description,
                  className: "ae-copy ae-card-copy",
                  delay: 150,
                  highlights: chapter.highlights
                }),
                h("div", { className: "ae-card-meta-bar", "aria-hidden": "true" },
                  h("span", { className: "ae-meta-accent-line" }),
                  h("span", { className: "ae-meta-tag" }, chapter.tag)
                )
              )
            );
          })
        )
      )
    )
  );
}
