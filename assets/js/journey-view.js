// ==========================================================================
// FARDIN.AI — FLYRANK AI 4-MONTH INTERNSHIP JOURNEY EXPLORE PAGE
// Route: /experience/flyrank-ai
// Full 10-Chapter Interactive Scroll-Driven Storytelling Case Study
// Structural reference pattern: https://storytelling.noomoagency.com/
//
// Key Mechanics:
//   - Full-screen centered text scenes with generous whitespace (one idea/screen)
//   - Sentences split into per-word spans scrubbed to scroll position
//   - Recurring illustrated motif: Bot F-01 inline in display typography
//   - Two "slow" breaks: Two Capstones Showcase (Ch 4) & 20 Certificates Grid (Ch 5)
//   - Minimal chrome: slim fixed top bar (Back to Home · Theme Toggle · Verify Credential)
//   - Interactive word beat in Leaderboard (Ch 6): tapping Ranker/Agent/Certificates swaps visual
//   - Exact verified facts, dates (July 1 – October 31, 2026), and strict 9,961 counter settling
//   - Complete Light (cream #FAF8F5) and Dark (#0D1117) theme token system
// ==========================================================================

import { scrollToTarget } from "./smooth-scroll.js";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  JOURNEY_OVERVIEW,
  JOURNEY_STATS,
  JOURNEY_LEADERBOARD,
  RANKER_SAMPLE_PAGES,
  JOURNEY_TIMELINE,
  ANTHROPIC_CERTIFICATES,
  PROFILE_DATA
} from "./data.js";
import { getCurrentTheme, subscribeTheme, applyTheme } from "./theme-manager.js";

const h = React.createElement;

// --------------------------------------------------------------------------
// 1. EXACT ANIMATED COUNTER (Settles strictly at target, e.g. exactly 9,961)
// --------------------------------------------------------------------------
function CountUpValue({ target, decimals = 0, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (typeof target !== "number" || isNaN(target)) {
      setVal(target);
      return;
    }
    // Reduced motion preference: set directly
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }

    let startTime = null;
    let animId = null;
    const duration = 1250;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      if (progress >= 1) {
        setVal(target); // Strictly settles at exact target!
      } else {
        setVal(ease * target);
        animId = window.requestAnimationFrame(step);
      }
    }

    animId = window.requestAnimationFrame(step);
    return () => {
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [target]);

  if (typeof target !== "number") {
    return h("span", null, `${prefix}${target}${suffix}`);
  }

  const formatted =
    decimals > 0
      ? val.toFixed(decimals)
      : Math.round(val).toLocaleString();

  return h("span", null, `${prefix}${formatted}${suffix}`);
}

// --------------------------------------------------------------------------
// 2. RECURRING INLINE MOTIF: BOT F-01
// A small white-and-red cartoon robot that sits inline in display typography
// --------------------------------------------------------------------------
function BotInlineMotif({ state = "welcome", size = 36 }) {
  return h(
    "span",
    {
      className: "story-bot-inline-motif",
      "aria-hidden": "true",
      title: "Bot F-01 Story Mascot"
    },
    h(
      "svg",
      {
        width: size,
        height: size,
        viewBox: "0 0 64 64",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        className: "story-bot-svg"
      },
      // Antenna
      h("line", { x1: "32", y1: "5", x2: "32", y2: "13", stroke: "var(--story-accent)", strokeWidth: "3.2", strokeLinecap: "round" }),
      h("circle", { cx: "32", cy: "5", r: "3.2", fill: "var(--story-accent)" }),
      // Porcelain dome head
      h("rect", { x: "12", y: "13", width: "40", height: "30", rx: "13", fill: "#FFFFFF", stroke: "var(--story-border)", strokeWidth: "2" }),
      // Visor screen
      h("rect", { x: "17", y: "18", width: "30", height: "18", rx: "7", fill: "#0A0E1A" }),
      // Expressive eyes
      state === "welcome"
        ? h(React.Fragment, null,
            h("path", { d: "M22 28 Q26 22 30 28", stroke: "var(--story-accent)", strokeWidth: "3", strokeLinecap: "round", fill: "none" }),
            h("path", { d: "M34 28 Q38 22 42 28", stroke: "var(--story-accent)", strokeWidth: "3", strokeLinecap: "round", fill: "none" })
          )
        : h(React.Fragment, null,
            h("circle", { cx: "26", cy: "27", r: "3.2", fill: "var(--story-accent)" }),
            h("circle", { cx: "38", cy: "27", r: "3.2", fill: "var(--story-accent)" })
          ),
      // Body chassis
      h("path", { d: "M20 43 L44 43 L40 54 L24 54 Z", fill: "#FFFFFF", stroke: "var(--story-border)", strokeWidth: "1.8" }),
      // AI core
      h("circle", { cx: "32", cy: "48", r: "3.5", fill: "var(--story-accent)" })
    )
  );
}

// --------------------------------------------------------------------------
// 3. WORD-BY-WORD SCROLL-SCRUBBED SENTENCE COMPONENT
// Splits a sentence into per-word spans and scrub-animates them on scroll
// --------------------------------------------------------------------------
function WordScrubSentence({
  text,
  inlineMotif = null,
  inlineIndex = -1,
  className = "",
  style = {}
}) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!containerRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const el = containerRef.current;
          if (!el) {
            ticking = false;
            return;
          }
          const rect = el.getBoundingClientRect();
          const winHeight = window.innerHeight || 800;
          // Progress scrubs between element entering bottom 85% and reaching top 20%
          const start = winHeight * 0.85;
          const end = winHeight * 0.2;
          const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
          setScrollProgress(p);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  if (reducedMotion) {
    return h(
      "div",
      { className: `story-display-sentence ${className}`, style },
      words.map((w, i) =>
        h(
          React.Fragment,
          { key: i },
          i === inlineIndex && inlineMotif,
          h("span", { className: "story-word revealed" }, w, " ")
        )
      )
    );
  }

  return h(
    "div",
    {
      ref: containerRef,
      className: `story-display-sentence ${className}`,
      style
    },
    words.map((w, i) => {
      const wordThreshold = i / Math.max(1, words.length - 1);
      const isRevealed = scrollProgress >= wordThreshold * 0.88;
      const revealFactor = Math.max(
        0,
        Math.min(1, (scrollProgress - wordThreshold * 0.88) / 0.12)
      );

      return h(
        React.Fragment,
        { key: i },
        i === inlineIndex && inlineMotif,
        h(
          "span",
          {
            className: `story-word ${isRevealed ? "revealed" : "dormant"}`,
            style: {
              opacity: isRevealed ? 1 : Math.max(0.18, revealFactor),
              transform: isRevealed
                ? "none"
                : `translateY(${Math.max(0, (1 - revealFactor) * 8)}px)`
            }
          },
          w,
          " "
        )
      );
    })
  );
}

// --------------------------------------------------------------------------
// MAIN EXPORT: FlyRankJourneyView
// --------------------------------------------------------------------------
export function FlyRankJourneyView({ onBackHome, initialSection, onSelectCertModal }) {
  // Theme state synced with ThemeManager
  const [theme, setTheme] = useState(() => getCurrentTheme());
  useEffect(() => {
    return subscribeTheme((newTheme) => setTheme(newTheme));
  }, []);

  const handleToggleTheme = () => {
    const current = getCurrentTheme();
    const nextTheme = current === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme, true);
  };

  // Brief Branded Intro Loader (Auto-dismisses within 1.2s max, timeout fallback)
  const [loaderVisible, setLoaderVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaderVisible(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Chapter 03 Progress Rail state
  const [scrollFillPct, setScrollFillPct] = useState(0);
  const [activeMonthTab, setActiveMonthTab] = useState("july");
  const monthOrder = ["july", "july-aug", "aug-sept", "sept-oct"];
  const currentMonthIdx = monthOrder.indexOf(activeMonthTab);
  const goToPrevMonth = () => {
    if (currentMonthIdx > 0) setActiveMonthTab(monthOrder[currentMonthIdx - 1]);
  };
  const goToNextMonth = () => {
    if (currentMonthIdx < monthOrder.length - 1) setActiveMonthTab(monthOrder[currentMonthIdx + 1]);
  };
  const [monthTouchStartX, setMonthTouchStartX] = useState(0);

  // Chapter 04 Ranker Simulator state
  const [topN, setTopN] = useState(6);

  // Chapter 05 20-Certificates Filter & Search state
  const certsGridRef = useRef(null);
  const [activeCertIdx, setActiveCertIdx] = useState(0);
  const scrollCertsBy = (dir) => {
    if (!certsGridRef.current) return;
    certsGridRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };
  const handleCertsScroll = () => {
    if (!certsGridRef.current) return;
    const sl = certsGridRef.current.scrollLeft;
    const idx = Math.round(sl / 300);
    if (idx !== activeCertIdx && idx >= 0) {
      setActiveCertIdx(idx);
    }
  };
  const [certTab, setCertTab] = useState("all"); // "all", "ai-fluency", "ml-backend"
  const [certQuery, setCertQuery] = useState("");
  const [flippedCerts, setFlippedCerts] = useState({});
  const [flipAll, setFlipAll] = useState(false);

  // Chapter 06 Interactive Standing Proof Slider & Word Beat state
  const [standingSlide, setStandingSlide] = useState(0);
  const [standingTouchStartX, setStandingTouchStartX] = useState(0);
  const standingSlides = [
    {
      id: "bd",
      title: "#1 in Bangladesh (National Champion)",
      rank: "#1 of 586",
      badge: "🇧🇩 #1 in Bangladesh",
      filterText: "Filter: Bangladesh",
      src: "/assets/images/standing-top1-bangladesh.jpg",
      originalSrc: "/assets/flyrank documents/top 1 in BD.jpg",
      caption: "FlyRank AI Official Standing: #1 of 586 in Bangladesh in Machine Learning Track (2,136 Points)"
    },
    {
      id: "world",
      title: "#23 Worldwide (Global ML Track)",
      rank: "#23 of 4,811",
      badge: "🌐 #23 Worldwide",
      filterText: "Filter: Machine Learning",
      src: "/assets/images/standing-rank23-worldwide.jpg",
      originalSrc: "/assets/flyrank documents/23 in Worldwide.jpg",
      caption: "FlyRank AI Official Standing: #23 of 4,811 Worldwide in Machine Learning Track (2,136 Points)"
    }
  ];
  const [activeWordBeat, setActiveWordBeat] = useState("Ranker");

  // Universal Lightbox Modal state
  const [modalPreview, setModalPreview] = useState(null);

  // Handle deep-link anchor
  useEffect(() => {
    const aliases = { "journey-certificates": "chapter-05-certificates", "journey-timeline": "chapter-03-tracks" };
    const id = aliases[initialSection] || initialSection;
    if (!id) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) scrollToTarget(el);
    }, 140);
    return () => clearTimeout(timer);
  }, [initialSection]);

  // Track overall page scroll for Chapter 03 Progress Rail
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          if (totalScroll > 0) {
            const pct = Math.min(
              100,
              Math.max(0, Math.round((window.scrollY / totalScroll) * 100))
            );
            setScrollFillPct(pct);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation for modal (ESC to dismiss)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && modalPreview) {
        setModalPreview(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalPreview]);

  // Ranker Simulator Calculations (Chapter 04)
  const learnedOrder = useMemo(() => {
    return RANKER_SAMPLE_PAGES.slice().sort(
      (a, b) => b.decline + b.demand - (a.decline + a.demand)
    );
  }, []);

  const fixedOrder = useMemo(() => {
    return RANKER_SAMPLE_PAGES.slice().sort((a, b) => b.decline - a.decline);
  }, []);

  const learnedPrecision = useMemo(() => {
    let hits = 0;
    for (let i = 0; i < topN; i++) {
      if (learnedOrder[i].needs) hits++;
    }
    return hits / topN;
  }, [learnedOrder, topN]);

  const fixedPrecision = useMemo(() => {
    let hits = 0;
    for (let i = 0; i < topN; i++) {
      if (fixedOrder[i].needs) hits++;
    }
    return hits / topN;
  }, [fixedOrder, topN]);

  // Filtered Certificates (Chapter 05)
  // Categories: All (20), AI Fluency (10: indices 1-10), ML & Backend (10: indices 11-20)
  const filteredCerts = useMemo(() => {
    const q = certQuery.trim().toLowerCase();
    return ANTHROPIC_CERTIFICATES.filter((c) => {
      let matchesTab = true;
      if (certTab === "ai-fluency") {
        matchesTab = c.index <= 10;
      } else if (certTab === "ml-backend") {
        matchesTab = c.index > 10;
      }
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.learned.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [certTab, certQuery]);

  const toggleCertFlip = (index) => {
    setFlippedCerts((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleToggleFlipAll = () => {
    const next = !flipAll;
    setFlipAll(next);
    const map = {};
    if (next) {
      ANTHROPIC_CERTIFICATES.forEach((c) => {
        map[c.index] = true;
      });
    }
    setFlippedCerts(map);
  };

  const verifyUrl =
    "https://internship.flyrank.ai/verify/FR-D11-9E3D0-1FE2A?first_name=Md.";

  const scrollToTop = () => {
    scrollToTarget(0);
  };

  return h(
    "div",
    {
      className: `story-page-root theme-${theme}`,
      "data-theme": theme
    },

    // ------------------------------------------------------------------------
    // BRIEF BRANDED INTRO LOADER (Auto-dismisses in <= 1.2s, non-blocking)
    // ------------------------------------------------------------------------
    loaderVisible &&
      h(
        "div",
        {
          className: "story-branded-loader",
          onClick: () => setLoaderVisible(false),
          "aria-label": "Click or scroll to dismiss loader"
        },
        h(
          "div",
          { className: "story-loader-content" },
          h(BotInlineMotif, { state: "welcome", size: 48 }),
          h("div", { className: "story-loader-title" }, "FLYRANK AI · ML INTERNSHIP"),
          h("div", { className: "story-loader-sub" }, "Initializing 4-Month Story...")
        )
      ),

    // ------------------------------------------------------------------------
    // FIXED SLIM TOP BAR (Back · Theme Toggle · Verify Credential Only)
    // No chapter rail, no section numbers, no progress bar
    // ------------------------------------------------------------------------
    h(
      "header",
      { className: "story-slim-topbar", "aria-label": "Navigation header" },
      h(
        "button",
        {
          type: "button",
          className: "story-topbar-back",
          onClick: onBackHome,
          "aria-label": "Return to portfolio home"
        },
        h("span", { className: "topbar-arrow", "aria-hidden": "true" }, "←"),
        h("span", null, "Back to Portfolio Home")
      ),
      h(
        "div",
        { className: "story-topbar-right" },
        h(
          "button",
          {
            type: "button",
            className: "story-theme-toggle-btn",
            onClick: handleToggleTheme,
            "aria-label": `Switch to ${theme === "dark" ? "light" : "dark"} theme`
          },
          h("span", { className: "theme-icon" }, theme === "dark" ? "☀️" : "🌙"),
          h("span", { className: "theme-name" }, theme.toUpperCase())
        ),
        h(
          "a",
          {
            href: verifyUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "story-topbar-verify",
            title: "Open official FlyRank credential verification"
          },
          h("span", { className: "verify-dot" }),
          h("span", { className: "verify-text-full" }, "✓ Verify: FR-D11-9E3D0-1FE2A ↗"),
          h("span", { className: "verify-text-short" }, "✓ Verify ↗")
        )
      )
    ),

    // ========================================================================
    // CHAPTER 01 — HERO SCENE
    // Eyebrow · Giant "journey" · Subline · 2 Badges · Count-up strip · Cue
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-01-hero",
        className: "story-fullscreen-scene story-hero-scene",
        "aria-labelledby": "hero-giant-heading"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h(
          "div",
          { className: "story-scene-eyebrow" },
          "FLYRank AI INTERNSHIP · JULY – OCTOBER 2026"
        ),
        h(
          "h1",
          { id: "hero-giant-heading", className: "story-giant-hero-word" },
          "journey"
        ),
        h(
          "p",
          { className: "story-scene-subline hero-subline" },
          "Turning four months of parallel effort into production machine learning, dual capstones, and national ranking."
        ),

        // Two Headline Rank Badges (Labeled EXACTLY)
        h(
          "div",
          { className: "story-headline-badges-row" },
          h(
            "div",
            { className: "story-rank-badge badge-ml-leader" },
            h("span", { className: "badge-text" }, "🏆 #1 · Bangladesh · Machine Learning Track")
          ),
          h(
            "div",
            { className: "story-rank-badge badge-overall-rank" },
            h("span", { className: "badge-text" }, "#23 · Overall (of 4,794)")
          )
        ),

        // Count-up Stat Strip (9,961 settles strictly at 9,961)
        h(
          "div",
          { className: "story-hero-stat-strip" },
          [
            { count: 9961, label: "candidate pages ranked" },
            { count: null, display: "0.78", sub: "vs 0.30", label: "precision@50, learned ranker vs fixed rule" },
            { count: 78.8, decimals: 1, suffix: "M", label: "daily-performance rows via DuckDB" },
            { count: 12, label: "executed ML notebooks + paper" },
            { count: null, display: "20/20", label: "Anthropic Academy certificates" },
            { count: 134, prefix: "~", label: "hours logged (approx.)" }
          ].map((st, i) =>
            h(
              "div",
              { key: i, className: "hero-stat-card" },
              h(
                "div",
                { className: "hero-stat-number" },
                st.count !== null
                  ? h(CountUpValue, {
                      target: st.count,
                      decimals: st.decimals || 0,
                      prefix: st.prefix || "",
                      suffix: st.suffix || ""
                    })
                  : st.display,
                st.sub && h("span", { className: "stat-sub" }, ` ${st.sub}`)
              ),
              h("div", { className: "hero-stat-label" }, st.label)
            )
          )
        ),

        // Scroll to explore cue
        h(
          "div",
          { className: "story-scroll-cue", "aria-hidden": "true" },
          h("span", null, "Scroll to explore"),
          h("span", { className: "scroll-arrow" }, "↓")
        )
      )
    ),

    // ========================================================================
    // CHAPTER 02 — ONBOARDING
    // "I applied, and later received my confirmation to join FlyRank AI."
    // One idea per screen, word-by-word reveal, Bot F-01 inline motif
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-02-onboarding",
        className: "story-fullscreen-scene",
        "aria-labelledby": "onboarding-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 02 · ONBOARDING"),
        h(WordScrubSentence, {
          text: "I applied, and later received my confirmation to join FlyRank AI.",
          inlineNode: h(BotInlineMotif, { state: "welcome", size: 38 }),
          inlineIndex: 6,
          className: "story-main-sentence"
        }),
        h(
          "p",
          { className: "story-scene-subline" },
          "Accepted into the July 2026 cohort with two simultaneous mandates: Machine Learning as the main track, and General AI Fluency in parallel."
        ),

        // Confirmation Document Card
        h(
          "div",
          { className: "story-document-card" },
          h(
            "div",
            { className: "doc-card-badge" },
            h("span", { className: "badge-check" }, "✓"),
            h("span", null, "Official Internship Confirmation Record")
          ),
          h(
            "div",
            { className: "doc-card-details" },
            h("div", { className: "doc-card-role" }, "Role: Machine Learning Engineering Intern"),
            h("div", { className: "doc-card-period" }, "Internship Dates: July 1, 2026 to October 31, 2026"),
            h("div", { className: "doc-card-org" }, "FlyRank Corp. · Southeast University (Student ID: 2023100000569)"),
            h("div", { className: "doc-card-signers" }, "Supervisors: Alen Malkoc, Founder & CEO · Arijana Ibrović, Director of Program")
          ),
          h(
            "div",
            { className: "doc-card-action" },
            h(
              "a",
              {
                href: "/assets/documents/flyrank-internship-confirmation-letter-md-fardin-hossain.pdf",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-secondary"
              },
              "📄 Download Confirmation Letter (PDF) ↗"
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 03 — TWO TRACKS (THE WORK ITSELF)
    // Word reveal · Animated progress rail (39/39 complete) · Month tabs
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-03-tracks",
        className: "story-fullscreen-scene",
        "aria-labelledby": "tracks-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 03 · THE WORK ITSELF"),
        h(WordScrubSentence, {
          text: "Two parallel tracks. Thirty-nine assignments. Zero missed deadlines.",
          inlineNode: h(BotInlineMotif, { state: "thinking", size: 36 }),
          inlineIndex: 3,
          className: "story-main-sentence"
        }),

        // Animated Progress Rail
        h(
          "div",
          { className: "story-curriculum-progress-box" },
          h(
            "div",
            { className: "progress-box-header" },
            h("span", { className: "progress-box-title" }, "Curriculum Completion Rail"),
            h("span", { className: "progress-box-stat" }, "39 of 39 portal cards complete (100%)")
          ),
          h(
            "div",
            { className: "story-progress-bar-track" },
            h("div", {
              className: "story-progress-bar-fill",
              style: { width: "100%" }
            })
          ),
          h(
            "div",
            { className: "progress-box-split" },
            h("span", null, "ML Track: ML-01 → ML-12 + Capstone Research Paper"),
            h("span", null, "AI Fluency: Audit · Automation · MCP · ST-Scout · Impact Capstone")
          )
        ),

        // Interactive Month Tabs + Milestones (Renders fully in both Light & Dark modes)
        h(
          "div",
          { className: "story-month-explorer" },
          h(
            "div",
            { className: "story-month-tab-bar" },
            JOURNEY_TIMELINE.map((m) =>
              h(
                "button",
                {
                  key: m.id,
                  type: "button",
                  className: `story-month-tab-btn ${activeMonthTab === m.id ? "active" : ""}`,
                  onClick: () => setActiveMonthTab(m.id)
                },
                h("span", { className: "month-tab-indicator" }),
                h("span", null, m.navLabel)
              )
            )
          ),

          // Active Month Detail Card (Slide Left to Right with swipe & button controls)
          (() => {
            const current =
              JOURNEY_TIMELINE.find((m) => m.id === activeMonthTab) || JOURNEY_TIMELINE[0];
            return h(
              "div",
              {
                className: "story-month-panel",
                onTouchStart: (e) => setMonthTouchStartX(e.targetTouches[0].clientX),
                onTouchEnd: (e) => {
                  const diff = monthTouchStartX - e.changedTouches[0].clientX;
                  if (diff > 45) goToNextMonth();
                  else if (diff < -45) goToPrevMonth();
                }
              },
              h(
                "div",
                { className: "month-panel-top" },
                h("div", null,
                  h("span", { className: "month-theme-pill" }, current.theme),
                  h("h3", { className: "month-title-h3" }, current.month)
                ),
                h("span", { className: "month-check-pill" }, "✓ 100% Complete")
              ),
              h("p", { className: "month-summary-text" }, current.summary),
              h(
                "ul",
                { className: "month-items-list" },
                current.items.map((item, idx) =>
                  h("li", { key: idx }, h("span", { className: "item-check" }, "✓"), " ", item)
                )
              ),
              h(
                "div",
                { className: "month-tags-container" },
                current.tags.map((t, idx) =>
                  h("span", { key: idx, className: "month-tag-chip" }, t)
                )
              ),
              // Interactive Month Slide Controls & Indicators (Left to Right)
              h(
                "div",
                { className: "month-slide-controls" },
                h(
                  "button",
                  {
                    type: "button",
                    className: "month-nav-btn prev",
                    disabled: currentMonthIdx <= 0,
                    onClick: goToPrevMonth,
                    "aria-label": "Slide to previous month"
                  },
                  "‹ Previous"
                ),
                h(
                  "div",
                  { className: "month-slide-indicators" },
                  monthOrder.map((mId, idx) =>
                    h("button", {
                      key: mId,
                      type: "button",
                      className: `month-slide-dot ${activeMonthTab === mId ? "active" : ""}`,
                      onClick: () => setActiveMonthTab(mId),
                      "aria-label": `Select month ${idx + 1}`
                    })
                  )
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "month-nav-btn next",
                    disabled: currentMonthIdx >= monthOrder.length - 1,
                    onClick: goToNextMonth,
                    "aria-label": "Slide to next month"
                  },
                  "Next ›"
                )
              )
            );
          })(),

          // Real Closing Links (Never placeholder links)
          h(
            "div",
            { className: "story-month-closing-links" },
            h(
              "a",
              {
                href: "https://fardinflyrankai.vercel.app/",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-link-pill"
              },
              "🔍 Survive the Crit (Portfolio Review) ↗"
            ),
            h(
              "a",
              {
                href: "https://www.linkedin.com/in/fardinhosn/",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-link-pill"
              },
              "📢 Show It (Published Build-in-Public Post) ↗"
            ),
            h(
              "a",
              {
                href: "/paper.pdf",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-link-pill"
              },
              "📄 Research Paper (PDF) ↗"
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 04 — TWO CAPSTONES (INTERACTIVE SHOWCASE SCENE)
    // Centerpiece: ML Capstone (Ranker demo) + AI Fluency Capstone (ST-Scout)
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-04-capstones",
        className: "story-fullscreen-scene story-showcase-scene",
        "aria-labelledby": "capstones-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 04 · TWO CAPSTONES"),
        h(WordScrubSentence, {
          text: "Two tracks. Two capstones. Built and evaluated on real data.",
          inlineNode: h(BotInlineMotif, { state: "analyzing", size: 36 }),
          inlineIndex: 2,
          className: "story-main-sentence"
        }),

        // (a) ML Capstone Showcase Card
        h(
          "div",
          { className: "story-capstone-card ml-capstone" },
          h(
            "div",
            { className: "capstone-card-header" },
            h("div", null,
              h("span", { className: "capstone-track-tag" }, "MACHINE LEARNING CAPSTONE · LANE 2"),
              h("h3", { className: "capstone-headline" }, "Content-Refresh Prioritization System for Unseen Client Domains")
            ),
            h(
              "a",
              {
                href: "/paper.pdf",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-primary"
              },
              "📄 Download Paper PDF ↗"
            )
          ),

          // 4 Core Verified Metrics
          h(
            "div",
            { className: "capstone-key-metrics-grid" },
            h("div", { className: "cap-metric-box" },
              h("div", { className: "metric-num" }, "9,961"),
              h("div", { className: "metric-label" }, "candidate pages ranked")
            ),
            h("div", { className: "cap-metric-box highlight" },
              h("div", { className: "metric-num" }, "0.78 vs 0.30"),
              h("div", { className: "metric-label" }, "precision@50 (learned vs fixed)")
            ),
            h("div", { className: "cap-metric-box" },
              h("div", { className: "metric-num" }, "78.8M"),
              h("div", { className: "metric-label" }, "DuckDB daily telemetry rows")
            ),
            h("div", { className: "cap-metric-box" },
              h("div", { className: "metric-num" }, "12"),
              h("div", { className: "metric-label" }, "executed ML notebooks + paper")
            )
          ),

          // Embedded Interactive "Play with the Ranker" Demo
          h(
            "div",
            { className: "story-ranker-demo-container" },
            h(
              "div",
              { className: "ranker-demo-header" },
              h("div", null,
                h("h4", { className: "ranker-demo-title" }, "Play with the Ranker"),
                h("p", { className: "ranker-plain-english" },
                  "The learned ranker detects latent query demand to prioritize pages that will actually bounce back, while the fixed rule wastes budget on dead pages that only look declining."
                )
              ),
              h(
                "div",
                { className: "ranker-slider-box" },
                h("label", { htmlFor: "top-n-slider", className: "slider-lbl" },
                  "Top-N Pages: ", h("strong", null, topN)
                ),
                h("input", {
                  id: "top-n-slider",
                  type: "range",
                  min: 3,
                  max: 12,
                  value: topN,
                  onChange: (e) => setTopN(parseInt(e.target.value, 10)),
                  // Blur on release so PageUp/PageDown scroll page again
                  onPointerUp: (e) => e.target.blur(),
                  onMouseUp: (e) => e.target.blur(),
                  onTouchEnd: (e) => e.target.blur(),
                  "aria-label": "Select number of top candidate pages for comparison",
                  className: "ranker-range-slider"
                })
              )
            ),

            // Side-by-side Score Gauges
            h(
              "div",
              { className: "ranker-gauges-grid" },
              h(
                "div",
                { className: "ranker-gauge learned" },
                h("div", { className: "gauge-tag" }, "LEARNED RANKER (PROPOSED)"),
                h("div", { className: "gauge-val" }, `${(learnedPrecision * 100).toFixed(0)}%`),
                h("div", { className: "gauge-lbl" }, `Precision@${topN} — Captures true refresh potential`)
              ),
              h(
                "div",
                { className: "ranker-gauge fixed" },
                h("div", { className: "gauge-tag" }, "FIXED-RULE BASELINE"),
                h("div", { className: "gauge-val" }, `${(fixedPrecision * 100).toFixed(0)}%`),
                h("div", { className: "gauge-lbl" }, `Precision@${topN} — Misallocates effort to dead pages`)
              )
            ),

            // Candidate Comparison Table with Horizontal Scroll wrapper & Mobile Hint
            h(
              "div",
              { className: "ranker-table-scroll-wrapper" },
              h(
                "div",
                { className: "table-mobile-hint" },
                "↔ Swipe table horizontally to see full candidate comparison"
              ),
              h(
                "div",
                { className: "ranker-candidates-table" },
                h(
                  "div",
                  { className: "table-row header" },
                  h("span", { className: "col-rank" }, "Rank"),
                  h("span", { className: "col-learned" }, "Learned Ranker Selection"),
                  h("span", { className: "col-fixed" }, "Fixed-Rule Selection"),
                  h("span", { className: "col-impact" }, "Decision Impact")
                ),
                Array.from({ length: topN }).map((_, i) => {
                  const lp = learnedOrder[i];
                  const fp = fixedOrder[i];
                  return h(
                    "div",
                    { key: i, className: "table-row" },
                    h("span", { className: "col-rank row-rank" }, `#${i + 1}`),
                    h("span", { className: "col-learned row-name" },
                      h("span", { className: `dot ${lp.needs ? "hit" : "miss"}` }),
                      `${lp.name} (Demand: ${lp.demand})`
                    ),
                    h("span", { className: "col-fixed row-name" },
                      h("span", { className: `dot ${fp.needs ? "hit" : "miss"}` }),
                      `${fp.name} (-${fp.decline}%)`
                    ),
                    h("span", { className: "col-impact row-status" },
                      lp.needs ? "High recovery potential · Refresh" : "Low query demand · Defer"
                    )
                  );
                })
              )
            ),

            // Plain-English Disclaimer (Kept exactly as required)
            h(
              "div",
              { className: "ranker-disclaimer-box" },
              h("strong", null, "Illustrative Demo vs. Actual Evaluation Dataset: "),
              "This 12-page interactive sample illustrates the ranking disparity. The actual production model was trained and evaluated on 9,961 candidate pages across 78.8M daily telemetry rows (P@50 = 0.78 vs 0.30)."
            )
          ),

          // Research Figures Gallery (Figure 1, 2, 3)
          h(
            "div",
            { className: "story-figures-row" },
            [
              { src: "/assets/images/figures/cost_value_matrix.png", title: "Figure 1: Cost-Value Matrix", desc: "Effort vs expected recovery quadrant mapping." },
              { src: "/assets/images/figures/action_mix.png", title: "Figure 2: Action Mix", desc: "Immediate Refresh vs Deferral distribution." },
              { src: "/assets/images/figures/top_reason_codes.png", title: "Figure 3: Top Reason Codes", desc: "SHAP-aligned attribution feature hierarchy." }
            ].map((fig, idx) =>
              h(
                "div",
                {
                  key: idx,
                  className: "story-fig-thumb",
                  onClick: () =>
                    setModalPreview({
                      type: "img",
                      src: fig.src,
                      title: fig.title,
                      subtitle: "ML Research Paper · Lane 2 Applied Search Intelligence",
                      caption: fig.desc
                    })
                },
                h("img", { src: fig.src, alt: fig.title, loading: "lazy" }),
                h("div", { className: "fig-name" }, fig.title)
              )
            )
          )
        ),

        // (b) AI Fluency Capstone Showcase Card
        h(
          "div",
          { className: "story-capstone-card fluency-capstone" },
          h(
            "div",
            { className: "capstone-card-header" },
            h("div", null,
              h("span", { className: "capstone-track-tag blue" }, "AI FLUENCY CAPSTONE · IMPACT PROJECT"),
              h("h3", { className: "capstone-headline" }, "Personal-Brand Hub + Study Coach Agent + 20/20 Certificates")
            ),
            h(
              "a",
              {
                href: "https://github.com/fardinhossain/FlyRankAI-ML-Internship-Task",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-secondary"
              },
              "💻 View Agent Repo ↗"
            )
          ),
          h(
            "div",
            { className: "fluency-pillars-grid" },
            h("div", { className: "pillar-box" },
              h("h4", { className: "pillar-name" }, "1. AI Stack Mastery"),
              h("p", { className: "pillar-desc" },
                "Engineered deterministic 4-stage chained automation workflows (FL-04) and MCP tool connectors (FL-05), yielding an 83% triage time reduction on enterprise search queries."
              )
            ),
            h("div", { className: "pillar-box" },
              h("h4", { className: "pillar-name" }, "2. Edge Evidence Hub"),
              h("p", { className: "pillar-desc" },
                "Edge-hosted portfolio on Vercel CDN featuring terminal identity kit, Geist typography, working serverless interview request triage form, and official FlyRank graduate badge."
              )
            ),
            h("div", { className: "pillar-box" },
              h("h4", { className: "pillar-name" }, "3. Autonomous ST-Scout Agent"),
              h("p", { className: "pillar-desc" },
                "Engineered ST-Scout (st_scout_agent.py): queries DuckDB telemetry over 78.8M rows, calls live search tools, enforces 60-character SEO title guardrails, and stages markdown briefs."
              )
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 05 — 20 CERTIFICATES (THE CARD-GRID "SLOW" SECTION)
    // 20 Anthropic Academy flip cards · All (20) / AI Fluency (10) / ML & Backend (10)
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-05-certificates",
        className: "story-fullscreen-scene story-certs-section",
        "aria-labelledby": "certs-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 05 · CONTINUOUS LEARNING"),
        h(WordScrubSentence, {
          text: "Twenty courses. Twenty certifications. Four months of continuous study.",
          inlineNode: h(BotInlineMotif, { state: "welcome", size: 36 }),
          inlineIndex: 3,
          className: "story-main-sentence"
        }),

        // Explicit Clarifying Line
        h(
          "p",
          { className: "story-certs-clarifying-line" },
          "7 credential tracks on the main portfolio · 20 Anthropic Academy course certificates below."
        ),

        // Filter Tabs & Search Bar
        h(
          "div",
          { className: "story-certs-toolbar" },
          h(
            "div",
            { className: "story-certs-filter-tabs" },
            [
              { id: "all", label: "All (20)" },
              { id: "ai-fluency", label: "AI Fluency (10)" },
              { id: "ml-backend", label: "ML & Backend (10)" }
            ].map((tab) =>
              h(
                "button",
                {
                  key: tab.id,
                  type: "button",
                  className: `story-cert-filter-tab ${certTab === tab.id ? "active" : ""}`,
                  onClick: () => setCertTab(tab.id)
                },
                tab.label
              )
            )
          ),
          h(
            "div",
            { className: "story-certs-controls" },
            h("input", {
              type: "search",
              placeholder: "Search certificates or concepts...",
              value: certQuery,
              onChange: (e) => setCertQuery(e.target.value),
              className: "story-cert-search-input",
              "aria-label": "Search certificates by keyword"
            }),
            h(
              "button",
              {
                type: "button",
                className: "story-cert-flip-all-btn",
                onClick: handleToggleFlipAll
              },
              flipAll ? "🔄 Reset Cards" : "🔄 Flip All 20"
            )
          )
        ),

        // Mobile Slide Navigation Bar (Left to Right)
        h(
          "div",
          { className: "certs-mobile-slider-bar" },
          h(
            "button",
            {
              type: "button",
              className: "certs-slide-arrow-btn prev",
              disabled: activeCertIdx <= 0,
              onClick: () => scrollCertsBy(-1),
              "aria-label": "Slide to previous certificate"
            },
            "‹ Prev"
          ),
          h(
            "span",
            { className: "certs-slide-counter" },
            `${Math.min(activeCertIdx + 1, filteredCerts.length)} of ${filteredCerts.length} Certificates`
          ),
          h(
            "button",
            {
              type: "button",
              className: "certs-slide-arrow-btn next",
              disabled: activeCertIdx >= filteredCerts.length - 1,
              onClick: () => scrollCertsBy(1),
              "aria-label": "Slide to next certificate"
            },
            "Next ›"
          )
        ),

        // 20-Card Flip Grid (Desktop: Grid / Mobile: Left to Right Slide Carousel)
        h(
          "div",
          {
            ref: certsGridRef,
            className: "story-certs-grid",
            onScroll: handleCertsScroll
          },
          filteredCerts.map((cert) => {
            const isFlipped = !!flippedCerts[cert.index];
            return h(
              "div",
              {
                key: cert.index,
                className: `story-cert-flip-container ${isFlipped ? "is-flipped" : ""}`,
                tabIndex: 0,
                role: "button",
                "aria-label": `${cert.title} — click to flip card`,
                onClick: () => toggleCertFlip(cert.index),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCertFlip(cert.index);
                  }
                }
              },
              h(
                "div",
                { className: "story-cert-flip-inner" },

                // FRONT FACE
                h(
                  "div",
                  {
                    className: "story-cert-card-face front-face"
                  },
                  h(
                    "div",
                    { className: "cert-face-header" },
                    h("span", { className: "cert-index-pill" }, `#${String(cert.index).padStart(2, "0")}`),
                    h("span", { className: "cert-track-pill" }, cert.index <= 10 ? "AI Fluency" : "ML & Tools")
                  ),
                  h(
                    "div",
                    { className: "cert-thumbnail-box" },
                    h("img", {
                      src: cert.image,
                      alt: cert.title,
                      loading: "lazy"
                    })
                  ),
                  h("h4", { className: "cert-card-title" }, cert.title),
                  h(
                    "div",
                    { className: "cert-face-footer" },
                    h("span", { className: "flip-hint" }, "↻ Click to flip"),
                    h(
                      "button",
                      {
                        type: "button",
                        className: "cert-zoom-btn",
                        title: "Inspect certificate high-resolution image",
                        onClick: (e) => {
                          e.stopPropagation();
                          setModalPreview({
                            type: "img",
                            src: cert.image,
                            title: cert.title,
                            subtitle: `Anthropic Academy · Course #${cert.index}`,
                            caption: cert.learned
                          });
                        }
                      },
                      "🔍"
                    )
                  )
                ),

                // BACK FACE (Key Learnings)
                h(
                  "div",
                  {
                    className: "story-cert-card-face back-face"
                  },
                  h(
                    "div",
                    { className: "cert-face-header" },
                    h("span", { className: "cert-index-pill" }, `#${String(cert.index).padStart(2, "0")}`),
                    h("span", { className: "cert-track-pill" }, "Key Takeaway")
                  ),
                  h("h4", { className: "cert-back-title" }, cert.title),
                  h("p", { className: "cert-back-learned" }, cert.learned),
                  h(
                    "div",
                    { className: "cert-face-footer" },
                    h(
                      "button",
                      {
                        type: "button",
                        className: "cert-inspect-modal-btn",
                        onClick: (e) => {
                          e.stopPropagation();
                          setModalPreview({
                            type: "img",
                            src: cert.image,
                            title: cert.title,
                            subtitle: `Anthropic Academy · Course #${cert.index}`,
                            caption: cert.learned
                          });
                        }
                      },
                      "🔍 Full Certificate"
                    ),
                    h("span", { className: "flip-hint" }, "↻ Flip back")
                  )
                )
              )
            );
          })
        )
      )
    ),

    // ========================================================================
    // CHAPTER 06 — LEADERBOARD (THE TROPHY PANEL)
    // Headline "#1 in Bangladesh · Machine Learning Track"
    // RANK #23 of 4794 · POINTS 2,136 · Tappable word beats: [Ranker] [Agent] [Certificates]
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-06-leaderboard",
        className: "story-fullscreen-scene",
        "aria-labelledby": "leaderboard-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 06 · NATIONAL STANDING"),
        h(WordScrubSentence, {
          text: "Consistency turned into rank on the national stage.",
          inlineNode: h(BotInlineMotif, { state: "welcome", size: 36 }),
          inlineIndex: 2,
          className: "story-main-sentence"
        }),

        // Trophy Showcase Panel
        h(
          "div",
          { className: "story-trophy-panel" },
          h(
            "div",
            { className: "trophy-top-row" },
            h("div", { className: "trophy-badge-pill" }, "NATIONAL TRACK CHAMPION & WORLDWIDE FINALIST"),
            h("h2", { id: "leaderboard-title", className: "trophy-headline" },
              "#1 in Bangladesh and #23 in worldwide in Machine Learning track"
            )
          ),

          // Exact Verified Standing Details
          h(
            "div",
            { className: "trophy-standing-card" },
            h("div", { className: "standing-header-line" },
              "YOUR STANDING — Md. Fardin Hossain · Machine Learning Track"
            ),
            h(
              "div",
              { className: "standing-stats-row" },
              h("div", { className: "standing-stat" },
                h("span", { className: "stat-tag" }, "RANK IN BANGLADESH"),
                h("span", { className: "stat-val highlight" }, "#1 of 586")
              ),
              h("div", { className: "standing-stat" },
                h("span", { className: "stat-tag" }, "WORLDWIDE RANK"),
                h("span", { className: "stat-val highlight" }, "#23 of 4,811")
              ),
              h("div", { className: "standing-stat" },
                h("span", { className: "stat-tag" }, "POINTS"),
                h("span", { className: "stat-val" }, "2,136"),
                h("span", { className: "stat-sub" }, "(participation-based V1)")
              ),
              h("div", { className: "standing-stat" },
                h("span", { className: "stat-tag" }, "MOVEMENT"),
                h("span", { className: "stat-val" }, "— 0"),
                h("span", { className: "stat-sub" }, "(weekly baseline)")
              )
            )
          ),

          // Two Headline Badges (Exact wording)
          h(
            "div",
            { className: "story-headline-badges-row" },
            h("div", { className: "story-rank-badge badge-ml-leader" },
              "🏆 #1 · Bangladesh · Machine Learning Track"
            ),
            h("div", { className: "story-rank-badge badge-overall-rank" },
              "🌐 #23 · Worldwide (of 4,811)"
            )
          ),

          // Official Standing Proof Showcase (with Left-to-Right Slide Option)
          h(
            "div",
            { className: "standing-proof-showcase" },
            h(
              "div",
              { className: "proof-showcase-header" },
              h("div", null,
                h("span", { className: "proof-showcase-tag" }, "OFFICIAL PROOF SCREENSHOTS"),
                h("h3", { className: "proof-showcase-title" }, "FlyRank AI Dashboard Standings")
              ),
              // Slide Selector Tabs (Left to Right)
              h(
                "div",
                { className: "proof-slide-tabs" },
                standingSlides.map((slide, idx) =>
                  h(
                    "button",
                    {
                      key: slide.id,
                      type: "button",
                      className: `proof-tab-btn ${standingSlide === idx ? "active" : ""}`,
                      onClick: () => setStandingSlide(idx)
                    },
                    slide.badge
                  )
                )
              )
            ),

            // Slide Display Stage with Left/Right Arrows and Swipe
            h(
              "div",
              {
                className: "proof-slide-stage",
                onTouchStart: (e) => setStandingTouchStartX(e.targetTouches[0].clientX),
                onTouchEnd: (e) => {
                  const diff = standingTouchStartX - e.changedTouches[0].clientX;
                  if (diff > 40) setStandingSlide((prev) => (prev < standingSlides.length - 1 ? prev + 1 : 0));
                  else if (diff < -40) setStandingSlide((prev) => (prev > 0 ? prev - 1 : standingSlides.length - 1));
                }
              },
              h(
                "button",
                {
                  type: "button",
                  className: "proof-nav-arrow prev",
                  onClick: () => setStandingSlide((prev) => (prev > 0 ? prev - 1 : standingSlides.length - 1)),
                  "aria-label": "Slide previous screenshot"
                },
                "‹"
              ),
              (() => {
                const cur = standingSlides[standingSlide];
                return h(
                  "div",
                  {
                    className: "proof-card-active",
                    onClick: () =>
                      setModalPreview({
                        type: "img",
                        src: cur.src,
                        title: cur.title,
                        subtitle: "FlyRank AI Verified Standing Dashboard",
                        caption: cur.caption
                      })
                  },
                  h(
                    "div",
                    { className: "proof-img-frame" },
                    h("img", {
                      src: cur.src,
                      alt: cur.caption,
                      loading: "lazy",
                      className: "proof-screenshot-img"
                    }),
                    h(
                      "div",
                      { className: "proof-img-overlay-cue" },
                      h("span", null, "🔍 Tap or click to inspect full resolution")
                    )
                  ),
                  h(
                    "div",
                    { className: "proof-card-info" },
                    h("div", { className: "proof-card-title-row" },
                      h("h4", { className: "proof-rank-h4" }, cur.title),
                      h("span", { className: "proof-rank-badge" }, cur.rank)
                    ),
                    h("p", { className: "proof-caption-text" }, cur.caption)
                  )
                );
              })(),
              h(
                "button",
                {
                  type: "button",
                  className: "proof-nav-arrow next",
                  onClick: () => setStandingSlide((prev) => (prev < standingSlides.length - 1 ? prev + 1 : 0)),
                  "aria-label": "Slide next screenshot"
                },
                "›"
              )
            ),

            // Slide indicators & mobile swipe guide
            h(
              "div",
              { className: "proof-slide-footer" },
              h(
                "div",
                { className: "proof-dots-container" },
                standingSlides.map((_, idx) =>
                  h("button", {
                    key: idx,
                    type: "button",
                    className: `proof-dot ${standingSlide === idx ? "active" : ""}`,
                    onClick: () => setStandingSlide(idx),
                    "aria-label": `Select slide ${idx + 1}`
                  })
                )
              ),
              h("span", { className: "proof-swipe-guide" }, "↔ Slide left / right to toggle Bangladesh (#1) vs Worldwide (#23)")
            )
          ),

          // Interactive Word Beat (Tapping words swaps visual beside text)
          h(
            "div",
            { className: "story-word-beat-box" },
            h(
              "p",
              { className: "word-beat-prompt" },
              "Every rank milestone was powered by consistent deliverables. Tap to inspect: ",
              ["Ranker", "Agent", "Certificates"].map((word) =>
                h(
                  "button",
                  {
                    key: word,
                    type: "button",
                    className: `word-beat-chip ${activeWordBeat === word ? "active" : ""}`,
                    onClick: () => setActiveWordBeat(word)
                  },
                  `[${word}]`
                )
              )
            ),

            // Dynamic Visual Card based on Tapped Word
            h(
              "div",
              { className: "word-beat-visual-card" },
              activeWordBeat === "Ranker" &&
                h("div", { className: "beat-content" },
                  h("h4", null, "ML Ranker System (0.78 Precision@50 vs 0.30 Fixed Rule)"),
                  h("p", null, "Trained and benchmarked on 9,961 candidate pages across 78.8M telemetry rows with DuckDB. Validated with client-grouped holdouts.")
                ),
              activeWordBeat === "Agent" &&
                h("div", { className: "beat-content" },
                  h("h4", null, "Autonomous ST-Scout Agent (st_scout_agent.py)"),
                  h("p", null, "Queries DuckDB tables, fetches live search data, enforces 60-character SEO title guardrails, and stages verified markdown briefs.")
                ),
              activeWordBeat === "Certificates" &&
                h("div", { className: "beat-content" },
                  h("h4", null, "20/20 Anthropic Academy Certificates Earned"),
                  h("p", null, "Completed all 20 official courses spanning Prompt Engineering, Claude Code, Model Context Protocol (MCP), and Subagent systems.")
                )
            )
          ),

          // Verified Endpoints Timeline (Only verified start and finish endpoints)
          h(
            "div",
            { className: "story-endpoints-timeline" },
            h("div", { className: "endpoint-node start" },
              h("div", { className: "ep-date" }, "July 1, 2026"),
              h("div", { className: "ep-pts" }, "0 Points"),
              h("div", { className: "ep-lbl" }, "Onboarding Baseline")
            ),
            h("div", { className: "endpoint-rail" }),
            h("div", { className: "endpoint-node finish" },
              h("div", { className: "ep-date" }, "October 31, 2026"),
              h("div", { className: "ep-pts" }, "2,136 Points"),
              h("div", { className: "ep-lbl" }, "#1 Bangladesh (ML) · #23 Overall of 4,794")
            )
          ),

          // Live Leaderboard Link
          h(
            "div",
            { className: "trophy-actions-row" },
            h(
              "a",
              {
                href: JOURNEY_LEADERBOARD.leaderboardUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-primary"
              },
              "📊 View live leaderboard ↗"
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 07 — INTERNSHIP PROGRESS REPORT
    // Document viewer + Download button + Key-facts box filled ONLY from supplied PDF
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-07-progress-report",
        className: "story-fullscreen-scene",
        "aria-labelledby": "progress-report-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 07 · INTERNSHIP PROGRESS REPORT"),
        h(WordScrubSentence, {
          text: "Documenting thirty-six assignments and two hundred ninety-seven hours.",
          inlineNode: h(BotInlineMotif, { state: "analyzing", size: 36 }),
          inlineIndex: 2,
          className: "story-main-sentence"
        }),

        // Document Viewer Card (Data strictly from supplied PDF: flyrank-internship-progress-report-.pdf)
        h(
          "div",
          { className: "story-report-viewer-card" },
          h(
            "div",
            { className: "report-viewer-header" },
            h("div", null,
              h("span", { className: "report-meta-tag" }, "OFFICIAL PROGRESS RECORD"),
              h("h3", { id: "progress-report-title", className: "report-headline" },
                "Internship Progress Report — Machine Learning, July 2026"
              )
            ),
            h(
              "a",
              {
                href: "/assets/documents/flyrank-internship-progress-report.pdf",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-primary"
              },
              "📄 Download Progress Report (PDF) ↗"
            )
          ),

          // Key Facts Box (Filled ONLY from supplied document)
          h(
            "div",
            { className: "story-key-facts-box" },
            h("h4", { className: "facts-title" }, "Key Facts from Document Record:"),
            h("ul", { className: "facts-list" },
              h("li", null, h("strong", null, "Assignments Completed: "), "36 practical assignments representing 139.5 estimated assignment hours."),
              h("li", null, h("strong", null, "Total Documented Hours: "), "At least 297 documented hours across practical tasks, accepted capstone work, program meetings, and verified Anthropic Academy courses."),
              h("li", null, h("strong", null, "Accepted Capstones: "), "Option A General AI Fluency Impact Project & ML Capstone Research Paper (0.78 P@50)."),
              h("li", null, h("strong", null, "Verified Academy Courses: "), "20 verified Anthropic Academy courses completed and on file."),
              h("li", null, h("strong", null, "Official Verifier Reference: "), "FR-D7-1E236-BE5A6 (FlyRank Corp. · Casper, WY)")
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 08 — FINAL INTERNSHIP REPORT & EVALUATION
    // Date shown: July 1 – October 31, 2026 (Certificate Date Rule strictly kept)
    // Document viewer + Download button + Highlights ONLY from supplied PDF
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-08-final-report",
        className: "story-fullscreen-scene",
        "aria-labelledby": "final-report-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 08 · FINAL EVALUATION"),
        h(WordScrubSentence, {
          text: "Four months evaluated. Both tracks accepted with distinction.",
          inlineNode: h(BotInlineMotif, { state: "welcome", size: 36 }),
          inlineIndex: 2,
          className: "story-main-sentence"
        }),

        // Final Report Card
        h(
          "div",
          { className: "story-report-viewer-card culmination" },
          h(
            "div",
            { className: "report-viewer-header" },
            h("div", null,
              h("span", { className: "report-meta-tag success" }, "EVALUATION COMPLETE · SIGNED OFF"),
              h("h3", { id: "final-report-title", className: "report-headline" },
                "Final Internship Report & Evaluation"
              ),
              h("div", { className: "report-date-line" }, "Period: July 1 – October 31, 2026")
            ),
            h(
              "a",
              {
                href: "/assets/documents/flyrank-internship-progress-report.pdf",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-primary"
              },
              "📄 Download Final Report (PDF) ↗"
            )
          ),

          // Evaluation Highlights (Taken ONLY from supplied document)
          h(
            "div",
            { className: "story-key-facts-box" },
            h("h4", { className: "facts-title" }, "Documented Evaluation Highlights:"),
            h("ul", { className: "facts-list" },
              h("li", null, h("strong", null, "100% Curriculum Delivery: "), "39 of 39 practical assignments and portal cards submitted and approved."),
              h("li", null, h("strong", null, "Culminating Project Accepted: "), "\"Send the Link: Launch, Demo & Story\" reviewed and accepted by lead track mentor."),
              h("li", null, h("strong", null, "Dual-Track Specialization: "), "Machine Learning as primary specialization; AI Fluency & Machine Learning independently qualified."),
              h("li", null, h("strong", null, "Program Meeting Attendance: "), "33 attended program meetings, 32 completed learning resources."),
              h("li", null, h("strong", null, "National Achievement: "), "#1 Machine Learning Track standing in Bangladesh (2,136 participation points).")
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 09 — RECOMMENDATION LETTER
    // Document viewer + Download button + Verbatim quote from supplied letter
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-09-recommendation",
        className: "story-fullscreen-scene",
        "aria-labelledby": "rec-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 09 · RECOMMENDATION"),
        h(WordScrubSentence, {
          text: "A formal recommendation for machine learning engineering.",
          inlineNode: h(BotInlineMotif, { state: "welcome", size: 36 }),
          inlineIndex: 3,
          className: "story-main-sentence"
        }),

        // Formal Letterhead Document Card
        h(
          "div",
          { className: "story-letterhead-card" },
          h(
            "div",
            { className: "letterhead-header" },
            h("div", { className: "letterhead-logo" }, "FlyRank AI"),
            h("div", { className: "letterhead-sub" }, "FlyRank Corp. · Reference ID: FR-D10-E55EB-4F0FE")
          ),

          // Verbatim Quote from Supplied Letter
          h(
            "blockquote",
            { className: "letterhead-quote" },
            "“Based on this verified completion record, I recommend Md. for opportunities aligned with machine learning engineering and applied AI roles.”",
            h("footer", { className: "quote-author" }, "— Alen Malkoc, Founder & CEO, FlyRank Corp.")
          ),

          // Key Document Details
          h(
            "p",
            { className: "letterhead-body-summary" },
            "\"During the program, Md. completed 36 practical assignments applying curriculum in Data wrangling, Embeddings and clustering, Intent and opportunity modeling, and Insight to action... The program record documents at least 297 hours across practical assignments, accepted capstone work, program meetings, learning resources, and verified Anthropic Academy courses.\""
          ),

          // Action Button
          h(
            "div",
            { className: "letterhead-footer" },
            h(
              "a",
              {
                href: "/assets/documents/flyrank-recommendation-letter.pdf",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "story-btn-primary"
              },
              "📄 Download Official Recommendation Letter (PDF) ↗"
            )
          )
        )
      )
    ),

    // ========================================================================
    // CHAPTER 10 — REFLECTION & FINALE
    // Full-screen closing scene: what the 4 months built, both tracks,
    // both capstone titles, both rank badges, 31 October 2026, verify credential
    // ========================================================================
    h(
      "section",
      {
        id: "chapter-10-reflection",
        className: "story-fullscreen-scene story-finale-scene",
        "aria-labelledby": "reflection-title"
      },
      h(
        "div",
        { className: "story-scene-container" },
        h("div", { className: "story-scene-eyebrow" }, "CHAPTER 10 · REFLECTION & FINALE"),
        h(WordScrubSentence, {
          text: "Four months of experimentation. A foundation built to keep building.",
          inlineNode: h(BotInlineMotif, { state: "welcome", size: 40 }),
          inlineIndex: 4,
          className: "story-main-sentence"
        }),

        // Finale Recap Grid
        h(
          "div",
          { className: "story-finale-recap-grid" },
          h("div", { className: "recap-card" },
            h("div", { className: "recap-tag" }, "TRACKS COMPLETED"),
            h("div", { className: "recap-h" }, "Machine Learning & General AI Fluency"),
            h("div", { className: "recap-sub" }, "39/39 Portal Deliverables · 100% Complete")
          ),
          h("div", { className: "recap-card" },
            h("div", { className: "recap-tag" }, "TWO CAPSTONES"),
            h("div", { className: "recap-h" }, "Content-Refresh Ranker & ST-Scout Agent"),
            h("div", { className: "recap-sub" }, "0.78 Precision@50 · 78.8M Rows · Deployed Edge Hub")
          ),
          h("div", { className: "recap-card" },
            h("div", { className: "recap-tag" }, "NATIONAL & WORLDWIDE STANDING"),
            h("div", { className: "recap-h" }, "#1 in Bangladesh and #23 in Worldwide"),
            h("div", { className: "recap-sub" }, "Machine Learning Track · #1 of 586 in BD · #23 of 4,811 Worldwide")
          ),
          h("div", { className: "recap-card" },
            h("div", { className: "recap-tag" }, "CREDENTIAL DATES"),
            h("div", { className: "recap-h" }, "July 1 – October 31, 2026"),
            h("div", { className: "recap-sub" }, "Displayed Certificate Date: 31 OCTOBER 2026")
          )
        ),

        // Both Rank Badges
        h(
          "div",
          { className: "story-headline-badges-row" },
          h("div", { className: "story-rank-badge badge-ml-leader" },
            "🏆 #1 · Bangladesh · Machine Learning Track"
          ),
          h("div", { className: "story-rank-badge badge-overall-rank" },
            "🌐 #23 · Worldwide (of 4,811)"
          )
        ),

        // Final Actions: Verify Credential & Return Home
        h(
          "div",
          { className: "story-finale-actions" },
          h(
            "a",
            {
              href: verifyUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "story-btn-primary large"
            },
            "✓ Verified · D11 Certificate of Completion · Machine Learning ↗"
          ),
          h(
            "button",
            {
              type: "button",
              className: "story-btn-secondary large",
              onClick: onBackHome
            },
            "← Return to Main Portfolio"
          )
        )
      )
    ),

    // ========================================================================
    // FOOTER
    // Short CTA · Contact Links · Back to Top
    // ========================================================================
    h(
      "footer",
      { className: "story-footer", "aria-label": "Footer" },
      h("p", { className: "footer-cta" },
        "Ready to discuss machine learning engineering or product collaboration?"
      ),
      h(
        "div",
        { className: "footer-links" },
        h("a", { href: "mailto:fardin.hosn@gmail.com" }, "fardin.hosn@gmail.com"),
        h("a", { href: "https://github.com/fardinhossain", target: "_blank", rel: "noopener" }, "GitHub ↗"),
        h("a", { href: "https://www.linkedin.com/in/fardinhosn/", target: "_blank", rel: "noopener" }, "LinkedIn ↗")
      ),
      h(
        "button",
        {
          type: "button",
          className: "story-back-to-top-btn",
          onClick: scrollToTop,
          "aria-label": "Scroll back to the top of the story"
        },
        "Back to Top ↑"
      )
    ),

    // ========================================================================
    // UNIVERSAL MODAL PREVIEW (CERTIFICATES / FIGURES)
    // ========================================================================
    modalPreview &&
      h(
        "div",
        {
          className: "story-modal-overlay",
          onClick: () => setModalPreview(null),
          role: "dialog",
          "aria-modal": "true",
          "aria-label": modalPreview.title || "Preview Dialog"
        },
        h(
          "div",
          {
            className: "story-modal-box",
            onClick: (e) => e.stopPropagation()
          },
          h(
            "div",
            { className: "modal-header" },
            h("div", null,
              modalPreview.subtitle &&
                h("span", { className: "modal-sub" }, modalPreview.subtitle),
              h("h3", { className: "modal-title" }, modalPreview.title)
            ),
            h(
              "button",
              {
                type: "button",
                className: "modal-close-x",
                onClick: () => setModalPreview(null),
                "aria-label": "Close modal"
              },
              "✕"
            )
          ),
          h(
            "div",
            { className: "modal-body" },
            modalPreview.type === "img" &&
              h("div", { className: "modal-img-container" },
                h("img", {
                  src: modalPreview.src,
                  alt: modalPreview.title,
                  className: "modal-view-img"
                })
              ),
            modalPreview.caption &&
              h("p", { className: "modal-caption" }, modalPreview.caption)
          ),
          h(
            "div",
            { className: "modal-footer" },
            modalPreview.src &&
              h(
                "a",
                {
                  href: modalPreview.src,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "story-btn-secondary"
                },
                "Open Original File in New Tab ↗"
              ),
            h(
              "button",
              {
                type: "button",
                className: "story-btn-primary",
                onClick: () => setModalPreview(null)
              },
              "Close"
            )
          )
        )
      )
  );
}
