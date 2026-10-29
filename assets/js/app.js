// ==========================================================================
// FARDIN.AI — MAIN REACT 18 + FRAMER MOTION + THREE.JS APPLICATION
// Supports both Homepage ("/") and Interactive Journey ("/experience/flyrank-ai")
// ==========================================================================

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  PROFILE_DATA,
  HERO_METRICS,
  PROJECT_CATEGORIES,
  PROJECTS_LIST,
  VERIFIED_CERTIFICATIONS,
  ANTHROPIC_CERTIFICATES,
  SKILL_GROUPS
} from "./data.js";
import { HeroNeuralScene, ContactGlobeScene } from "./three-scenes.js";
import {
  MetricIcon,
  GithubIcon,
  LinkedInIcon,
  MailIcon,
  ExternalArrowIcon,
  ProjectVisualHeader
} from "./visual-previews.js";
import { FlyRankJourneyView } from "./journey-view.js";
import { FeaturedProjects } from "./project-showcase-3d.js";
import { ExperienceTimelineSection } from "./experience-timeline-3d.js";
import { CertificationShowcase } from "./certification-showcase-3d.js";
import {
  getCurrentTheme,
  subscribeTheme,
  launchRobotThemeTransition
} from "./theme-manager.js";
import {
  PortfolioIntro,
  hasSeenIntro,
  resetIntroSeen,
  prefersReducedMotion
} from "./portfolio-intro.js";
import { CinematicHeroSection } from "./cinematic-hero-section.js";
import { AboutScrollStory } from "./about-scroll-story.js";
import { installSmoothScrolling, scrollToTarget } from "./smooth-scroll.js";

const h = React.createElement;

// Helper to detect if current URL points to the FlyRank AI Journey page
function isJourneyRouteFromLocation() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    path.includes("/experience/flyrank-ai") ||
    path.endsWith("/journey.html") ||
    path.endsWith("/journey") ||
    hash.includes("experience/flyrank-ai") ||
    hash.includes("journey") ||
    search.includes("journey=flyrank-ai")
  );
}

// --------------------------------------------------------------------------
// 3D TILT PROJECT CARD COMPONENT
// --------------------------------------------------------------------------
function ProjectCard({ project, onOpenModal, onOpenJourney }) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handlePointerMove = (e) => {
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    setTilt({ rx: -ny * 5, ry: nx * 5 });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  return h(
    motion.article,
    {
      layout: true,
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, scale: 0.96 },
      transition: { duration: 0.32 },
      className: "bezel-outer project-card-3d",
      onPointerMove: handlePointerMove,
      onPointerLeave: handlePointerLeave,
      onClick: () => onOpenModal(project),
      style: {
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
      }
    },
    h(
      "div",
      { className: "bezel-inner", style: { display: "flex", flexDirection: "column" } },
      // Top Preview Window
      h(
        "div",
        { className: "project-preview-window" },
        h("span", { className: "project-floating-cat" }, project.shortCategory),
        (project.liveUrl || project.githubUrl) &&
          h(
            "a",
            {
              href: project.liveUrl || project.githubUrl,
              target: "_blank",
              rel: "noopener",
              className: "project-floating-ext",
              title: project.liveUrl ? `Open ${project.title} Live Demo` : `Open ${project.title} GitHub`,
              onClick: (e) => e.stopPropagation()
            },
            h(ExternalArrowIcon, { size: 14 })
          ),
        h(ProjectVisualHeader, { project })
      ),

      // Card Body
      h(
        "div",
        { className: "project-body" },
        h(
          "div",
          null,
          h("h3", { className: "project-title" }, project.title),
          h("p", { className: "project-desc" }, project.summary),
          h(
            "div",
            { className: "project-tags-row" },
            project.tags.slice(0, 4).map((tag) =>
              h("span", { key: tag, className: "tech-chip" }, tag)
            )
          )
        ),

        // Card Footer Actions (Every visible button has a working action)
        h(
          "div",
          { className: "project-actions-footer" },
          h(
            "div",
            { style: { display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" } },
            project.journeyTrigger
              ? h(
                  "button",
                  {
                    type: "button",
                    className: "project-action-pill highlight-yellow",
                    onClick: (e) => {
                      e.stopPropagation();
                      onOpenJourney();
                    }
                  },
                  h("span", null, "Interactive Journey →")
                )
              : project.liveUrl
              ? h(
                  "a",
                  {
                    href: project.liveUrl,
                    target: "_blank",
                    rel: "noopener",
                    className: "project-action-pill",
                    onClick: (e) => e.stopPropagation()
                  },
                  h("span", { className: "red-dot", style: { width: 6, height: 6 } }),
                  h("span", null, "Live Demo →")
                )
              : h(
                  "button",
                  {
                    type: "button",
                    className: "project-action-pill",
                    onClick: (e) => {
                      e.stopPropagation();
                      onOpenModal(project);
                    }
                  },
                  h("span", null, "View Details →")
                ),

            project.liveUrl &&
              h(
                "button",
                {
                  type: "button",
                  className: "project-action-pill",
                  style: { padding: "0.42rem 0.7rem", fontWeight: 600 },
                  onClick: (e) => {
                    e.stopPropagation();
                    onOpenModal(project);
                  }
                },
                "Specs"
              )
          ),

          project.githubUrl &&
            h(
              "a",
              {
                href: project.githubUrl,
                target: "_blank",
                rel: "noopener",
                className: "icon-circle-btn",
                title: `View ${project.title} Source Code on GitHub`,
                "aria-label": `View ${project.title} Source Code on GitHub`,
                onClick: (e) => e.stopPropagation()
              },
              h(GithubIcon, { size: 16 })
            )
        )
      )
    )
  );
}

// --------------------------------------------------------------------------
// REUSABLE BOT F-01 MASCOT ILLUSTRATION (EXACT WHITE-AND-RED DOME HEAD & VISOR)
// Matches the 3D Bot F-01 design (porcelain dome head, obsidian visor,
// glowing crimson LED capsule eyes with white specular glints, ear pods with
// red rings, antenna beacon, torso with red AI core ring, tiny arms & thrusters)
// --------------------------------------------------------------------------
export function BotF01MascotSvg({ isActive = false, size = 38, className = "" }) {
  return h(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 64 64",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      className: `bot-f01-mascot-svg ${isActive ? "is-active-flight" : "is-standby"} ${className}`,
      "aria-hidden": "true"
    },
    // Soft antigravity / thruster red glow ring beneath bot
    h("ellipse", {
      cx: "32",
      cy: "58",
      rx: isActive ? "15" : "11",
      ry: "3.2",
      fill: "rgba(225, 29, 72, 0.26)"
    }),
    // Thruster flame cone
    h("path", {
      d: isActive ? "M28 50 L32 60 L36 50 Z" : "M29 50 L32 56 L35 50 Z",
      fill: "#E11D48",
      opacity: isActive ? "0.92" : "0.65"
    }),
    // Hover legs / boots
    h("rect", { x: "23", y: "46", width: "5.5", height: "6.5", rx: "2.7", fill: "#E2E8F0", stroke: "#0F172A", strokeWidth: "1.2" }),
    h("rect", { x: "35.5", y: "46", width: "5.5", height: "6.5", rx: "2.7", fill: "#E2E8F0", stroke: "#0F172A", strokeWidth: "1.2" }),
    // Left & Right Articulated Arms + Red Mechanical Gripper Claws
    h(
      "g",
      { className: "bot-f01-arm-left" },
      h("rect", { x: "11", y: "31", width: "6", height: "11", rx: "3", transform: "rotate(14 14 36)", fill: "#FFFFFF", stroke: "#CBD5E1", strokeWidth: "1.4" }),
      h("circle", { cx: "12.5", cy: "42.5", r: "2.2", fill: "#E11D48" })
    ),
    h(
      "g",
      { className: "bot-f01-arm-right" },
      h("rect", {
        x: "47",
        y: isActive ? "26" : "31",
        width: "6",
        height: "11",
        rx: "3",
        transform: isActive ? "rotate(-32 50 31)" : "rotate(-14 50 36)",
        fill: "#FFFFFF",
        stroke: "#CBD5E1",
        strokeWidth: "1.4"
      }),
      h("circle", { cx: isActive ? "53.5" : "51.5", cy: isActive ? "25.5" : "42.5", r: "2.2", fill: "#E11D48" })
    ),
    // Torso / Chassis
    h("rect", {
      x: "18.5",
      y: "29.5",
      width: "27",
      height: "19",
      rx: "9.5",
      fill: "#FFFFFF",
      stroke: "#CBD5E1",
      strokeWidth: "1.5"
    }),
    // Dark Collar Joint
    h("rect", { x: "23", y: "28", width: "18", height: "3", rx: "1.5", fill: "#0F172A" }),
    // Chest AI Core Badge (Glowing Red Ring + Bright Core)
    h("circle", { cx: "32", cy: "38.5", r: "4.6", fill: "rgba(225, 29, 72, 0.15)", stroke: "#E11D48", strokeWidth: "1.8" }),
    h("circle", { cx: "32", cy: "38.5", r: "2", fill: "#FF4D6D" }),
    // Top Antenna Stem + Glowing Red Beacon Tip
    h("line", { x1: "32", y1: "5.5", x2: "32", y2: "11.5", stroke: "#94A3B8", strokeWidth: "2.2", strokeLinecap: "round" }),
    h("circle", { cx: "32", cy: "4.8", r: "3", fill: "#E11D48" }),
    h("circle", { cx: "31.2", cy: "4", r: "1", fill: "#FFFFFF" }),
    // Side Ear Pods + Red LED Rings
    h("rect", { x: "9.5", y: "16", width: "4.5", height: "8.5", rx: "2.2", fill: "#E2E8F0", stroke: "#E11D48", strokeWidth: "1.4" }),
    h("rect", { x: "50", y: "16", width: "4.5", height: "8.5", rx: "2.2", fill: "#E2E8F0", stroke: "#E11D48", strokeWidth: "1.4" }),
    // Rounded White Porcelain Dome Head
    h("rect", {
      x: "13",
      y: "10",
      width: "38",
      height: "20",
      rx: "10",
      fill: "#FFFFFF",
      stroke: "#CBD5E1",
      strokeWidth: "1.6"
    }),
    // Curved Obsidian Visor Plate
    h("rect", {
      x: "16.5",
      y: "13.2",
      width: "31",
      height: "13.5",
      rx: "6.75",
      fill: "#090D16"
    }),
    // Expressive Glowing Red LED Eyes (Left & Right) + White Specular Glints
    h("rect", {
      className: "bot-f01-eye",
      x: "21.5",
      y: "17.6",
      width: "6.8",
      height: "4.6",
      rx: "2.3",
      fill: "#E11D48"
    }),
    h("circle", { cx: "23.3", cy: "19", r: "1.1", fill: "#FFFFFF" }),
    h("rect", {
      className: "bot-f01-eye",
      x: "35.7",
      y: "17.6",
      width: "6.8",
      height: "4.6",
      rx: "2.3",
      fill: "#E11D48"
    }),
    h("circle", { cx: "37.5", cy: "19", r: "1.1", fill: "#FFFFFF" })
  );
}

// --------------------------------------------------------------------------
// MAIN PORTFOLIO APPLICATION
// --------------------------------------------------------------------------
function PortfolioApp() {
  useEffect(() => installSmoothScrolling(), []);
  const [view, setView] = useState(() =>
    isJourneyRouteFromLocation() ? "journey" : "home"
  );
  const [journeyTargetSection, setJourneyTargetSection] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Robotic Entrance Animation State (The full-screen cinematic hero is the primary entrance)
  const [showIntro, setShowIntro] = useState(false);

  // Theme State synced with Theme Manager
  const [theme, setTheme] = useState(() => getCurrentTheme());

  useEffect(() => {
    return subscribeTheme((newTheme) => {
      setTheme(newTheme);
    });
  }, []);

  const handleToggleTheme = (e) => {
    const rect = e?.currentTarget?.getBoundingClientRect();
    const nextTheme = theme === "dark" ? "light" : "dark";
    launchRobotThemeTransition(nextTheme, rect);
  };

  // Projects Modal State
  const [selectedProject, setSelectedProject] = useState(null);

  // Certificate Image Modal State
  const [selectedCertModal, setSelectedCertModal] = useState(null);

  // Anthropic 20/20 Certificate Wall State (Filter & Flipped Cards)
  const [certWallFilter, setCertWallFilter] = useState("all");
  const [flippedWallCards, setFlippedWallCards] = useState({});

  // Contact Form & Copy Email State
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState({ state: "idle", message: "" });

  // Sync browser back/forward button
  useEffect(() => {
    const onPopState = () => {
      setView(isJourneyRouteFromLocation() ? "journey" : "home");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Scroll spy for sticky navbar active section (Order: Home -> About -> Experience -> Projects -> Certifications -> Contact)
  useEffect(() => {
    if (view !== "home") return;
    const sectionIds = ["home", "about", "experience", "projects", "certifications", "contact"];
    const onScroll = () => {
      const scrollCheck = window.scrollY + 220;
      let current = "home";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollCheck) {
          current = id;
        }
      }
      setActiveNav(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [view]);

  // Filtered 20 Anthropic Academy Certificates (All / AI Fluency / ML & Backend)
  const filteredAnthropicCerts = useMemo(() => {
    if (certWallFilter === "all") return ANTHROPIC_CERTIFICATES;
    return ANTHROPIC_CERTIFICATES.filter((c) => c.category === certWallFilter);
  }, [certWallFilter]);

  const toggleWallCardFlip = (idx) => {
    setFlippedWallCards((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Handle Contact Form Submission (Formspree endpoint + graceful fallback)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      setContactStatus({ state: "error", message: "Please fill in your name, email, and message." });
      return;
    }
    setContactStatus({ state: "submitting", message: "Sending your message to Fardin..." });
    try {
      const response = await fetch("https://formspree.io/f/xdkogpvr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
          _replyto: contactForm.email,
          _subject: `Portfolio Message from ${contactForm.name} (fardin.ai)`
        })
      });
      if (response.ok) {
        setContactStatus({
          state: "success",
          message: "✓ Message sent! Fardin will reply to your email shortly."
        });
        setContactForm({ name: "", email: "", message: "" });
      } else {
        // Fallback: open pre-filled mailto so message is never lost
        const subject = encodeURIComponent(`Portfolio Inquiry from ${contactForm.name}`);
        const body = encodeURIComponent(
          `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`
        );
        window.location.href = `mailto:${PROFILE_DATA.email}?subject=${subject}&body=${body}`;
        setContactStatus({
          state: "success",
          message: "✓ Opened your email client pre-addressed to fardin.hosn@gmail.com."
        });
      }
    } catch (_err) {
      const subject = encodeURIComponent(`Portfolio Inquiry from ${contactForm.name}`);
      const body = encodeURIComponent(
        `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`
      );
      window.location.href = `mailto:${PROFILE_DATA.email}?subject=${subject}&body=${body}`;
      setContactStatus({
        state: "success",
        message: "✓ Prepared your message in your email client for fardin.hosn@gmail.com."
      });
    }
  };

  // Open Dedicated FlyRank AI 4-Month Journey View (/experience/flyrank-ai)
  const openJourneyExperience = (sectionId = null) => {
    setMobileMenuOpen(false);
    setSelectedProject(null);
    setJourneyTargetSection(sectionId);
    setView("journey");
    scrollToTarget(0, { immediate: true });
    try {
      window.history.pushState({ view: "journey" }, "", "/experience/flyrank-ai");
    } catch (e) {
      window.location.hash = "#/experience/flyrank-ai";
    }
  };

  // Return to Portfolio Homepage
  const closeJourneyExperience = (targetAnchor = null) => {
    setView("home");
    try {
      window.history.pushState({ view: "home" }, "", "/");
    } catch (e) {
      window.location.hash = "";
    }
    if (targetAnchor) {
      setTimeout(() => {
        const el = document.getElementById(targetAnchor);
        if (el) scrollToTarget(el);
      }, 80);
    } else {
      scrollToTarget(0);
    }
  };

  const navigateToSection = (sectionId) => {
    setMobileMenuOpen(false);
    setActiveNav(sectionId);
    if (view !== "home") {
      closeJourneyExperience(sectionId);
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      scrollToTarget(el);
    }
  };

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(PROFILE_DATA.email).catch(() => {});
    }
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2400);
  };

  return h(
    React.Fragment,
    null,
    showIntro &&
      h(PortfolioIntro, {
        onComplete: () => setShowIntro(false)
      }),
    h("a", { href: "#main-content", className: "skip-link" }, "Skip to content"),

    // ========================================================================
    // A. STICKY NAVBAR
    // ========================================================================
    h(
      "header",
      { className: "navbar-wrapper" },
      h(
        "nav",
        { className: "navbar-glass portix-navbar", "aria-label": "Primary Navigation" },
        // Brand Logo: fardin.ai •
        h(
          "a",
          {
            href: "#home",
            className: "brand-logo",
            onClick: (e) => {
              e.preventDefault();
              navigateToSection("home");
            }
          },
          h("span", { className: "brand-name-text" }, "fardin.ai"),
          h("span", { className: "red-dot", "aria-hidden": "true" })
        ),

        // Desktop Navigation Links
        h(
          "ul",
          { className: "nav-links-desktop" },
          [
            { id: "projects", label: "WORKS" },
            { id: "about", label: "ABOUT" },
            { id: "experience", label: "EXPERIENCE" },
            { id: "contact", label: "CONTACT" }
          ].map((item) =>
            h(
              "li",
              { key: item.id },
              h(
                "button",
                {
                  type: "button",
                  className: `nav-item-btn ${
                    view === "home" && activeNav === item.id ? "active" : ""
                  }`,
                  onClick: () => navigateToSection(item.id)
                },
                item.label
              )
            )
          )
        ),

        // Right Actions: Theme Toggle + Let's Talk + Mobile Menu Button
        h(
          "div",
          { className: "nav-actions-right" },
          h(
            "button",
            {
              type: "button",
              className: "theme-toggle-btn",
              onClick: (e) => handleToggleTheme(e),
              "aria-label": theme === "dark" ? "Current theme: Dark. Switch to Light Mode" : "Current theme: Light. Switch to Dark Mode",
              title:
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
            },
            h(
              "span",
              { className: "theme-toggle-icon-box", "aria-hidden": "true" },
              h(
                "svg",
                {
                  width: "12",
                  height: "12",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "#E85D3B",
                  strokeWidth: "2.5",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                },
                h("circle", { cx: "12", cy: "12", r: "4", fill: "#E85D3B" }),
                h("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" })
              )
            ),
            h(
              "span",
              { className: "theme-toggle-label" },
              theme === "dark" ? "DARK" : "LIGHT"
            )
          ),
          h(
            "button",
            {
              type: "button",
              className: "nav-btn-talk",
              onClick: () => navigateToSection("contact")
            },
            h("span", { className: "talk-arrow", "aria-hidden": "true" }, "→"),
            h("span", { className: "talk-text" }, "LET'S TALK")
          ),
          h(
            "button",
            {
              type: "button",
              className: "mobile-menu-trigger",
              "aria-label": mobileMenuOpen ? "Close Menu" : "Open Menu",
              "aria-expanded": mobileMenuOpen,
              onClick: () => setMobileMenuOpen((v) => !v)
            },
            mobileMenuOpen ? "✕" : "☰"
          )
        )
      ),

      // Mobile Slide-Down Drawer
      AnimatePresence &&
        h(
          AnimatePresence,
          null,
          mobileMenuOpen &&
            h(
              motion.div,
              {
                initial: { opacity: 0, y: -10 },
                animate: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -10 },
                transition: { duration: 0.2 },
                style: {
                  marginTop: "8px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "20px",
                  padding: "1rem",
                  boxShadow: "var(--shadow-elevated)"
                }
              },
              h(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "0.4rem" } },
                [
                  { id: "home", label: "Home" },
                  { id: "about", label: "About" },
                  { id: "experience", label: "Experience" },
                  { id: "projects", label: "Projects" },
                  { id: "certifications", label: "Certifications" },
                  { id: "contact", label: "Contact" }
                ].map((item) =>
                  h(
                    "button",
                    {
                      key: item.id,
                      type: "button",
                      onClick: () => navigateToSection(item.id),
                      style: {
                        textAlign: "left",
                        padding: "0.65rem 0.9rem",
                        borderRadius: "12px",
                        border: "none",
                        background:
                          activeNav === item.id ? "var(--bg-subtle)" : "transparent",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: "var(--text-primary)",
                        cursor: "pointer"
                      }
                    },
                    item.label
                  )
                ),
                // Mobile Theme Toggle Row inside Drawer
                h(
                  "button",
                  {
                    type: "button",
                    className: "theme-toggle-btn",
                    style: {
                      width: "100%",
                      justifyContent: "space-between",
                      marginTop: "0.5rem",
                      padding: "0.65rem 0.9rem"
                    },
                    onClick: (e) => {
                      handleToggleTheme(e);
                      setMobileMenuOpen(false);
                    },
                    "aria-label":
                      theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
                  },
                  h(
                    "span",
                    {
                      style: {
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }
                    },
                    h("span", { className: "theme-toggle-led" }),
                    h(
                      "span",
                      { style: { fontSize: "0.86rem" } },
                      theme === "dark" ? "Switch to Solar Light" : "Switch to Robotic Dark"
                    )
                  ),
                  h(
                    "span",
                    { className: "theme-toggle-icon-box" },
                    theme === "dark" ? "☀️" : "🌙"
                  )
                )
              )
            )
        )
    ),

    // ========================================================================
    // MAIN CONTENT VIEW SWITCHER (HOMEPAGE VS. INTERACTIVE 4-MONTH JOURNEY)
    // ========================================================================
    h(
      "main",
      { id: "main-content" },
      view === "journey"
        ? h(FlyRankJourneyView, {
            onBackHome: () => closeJourneyExperience(),
            initialSection: journeyTargetSection,
            onSelectCertModal: setSelectedCertModal
          })
        : h(
            React.Fragment,
            null,

            // ================================================================
            // 1. FULL-SCREEN CINEMATIC HERO SECTION (100svh)
            // ================================================================
            h(CinematicHeroSection, {
              onNavigateContact: () => navigateToSection("contact"),
              resumeUrl: PROFILE_DATA.resumeUrl
            }),
            h(AboutScrollStory, null),

            h(
              "div",
              { className: "page-shell" },

            // Existing sections continue unchanged below the new editorial About.
            h(ExperienceTimelineSection, {
              onExploreInternship: () => openJourneyExperience()
            }),

            // ================================================================
            // 4. FEATURED PROJECTS SECTION (#projects)
            // 3D Flying Robot Project Showcase
            // ================================================================
            h(FeaturedProjects, {
              projectsList: PROJECTS_LIST,
              categories: PROJECT_CATEGORIES,
              onOpenModal: setSelectedProject,
              onOpenJourney: () => openJourneyExperience()
            }),

            // ================================================================
            // 5. CERTIFICATIONS SECTION (#certifications)
            // Dual-Side Flying Robot Delivery System (Robot A from Left, Robot B from Right)
            // Alternating deliveries for all 7 verified credential rows with 3D carried tiles
            // ================================================================
            h(CertificationShowcase, {
              certifications: VERIFIED_CERTIFICATIONS,
              onOpenModal: (cert) => setSelectedCertModal(cert),
              onOpenJourneyExperience: (tab) => openJourneyExperience(tab)
            }),

            // ================================================================
            // 6. CONTACT SECTION (#contact)
            // Working Formspree Contact Form + Interactive 3D Dhaka Globe + Copy Email & Say Hello
            // ================================================================
            h(
              "section",
              { id: "contact", className: "section-block" },
              h(
                "div",
                { className: "section-header-bar" },
                h(
                  "div",
                  { className: "section-title-group" },
                  h("span", { className: "section-red-bar" }),
                  h(
                    "h2",
                    { className: "section-heading" },
                    "Let's Connect",
                    h("span", { className: "red-dot" })
                  )
                ),
                h(
                  "span",
                  { className: "exp-timeline-top-tag" },
                  h("span", { className: "red-dot", style: { width: 6, height: 6 } }),
                  "DHAKA, BANGLADESH · OPEN TO OPPORTUNITIES"
                )
              ),

              h(
                "div",
                { className: "bezel-outer" },
                h(
                  "div",
                  { className: "bezel-inner contact-two-col-stage" },
                  // Left Column: Working Contact Form (Name, Email, Message -> fardin.hosn@gmail.com)
                  h(
                    "div",
                    { className: "contact-form-col" },
                    h(
                      "div",
                      { className: "credentials-strip-eyebrow", style: { marginBottom: "0.35rem" } },
                      h("span", { className: "red-dot", style: { width: 6, height: 6 } }),
                      "DIRECT MESSAGE FORM"
                    ),
                    h(
                      "h3",
                      { className: "contact-form-heading" },
                      "Send a Message"
                    ),
                    h(
                      "p",
                      { className: "contact-form-subtext" },
                      "Looking for an ML/AI Engineer or Full-Stack Developer? Fill out the form below to message fardin.hosn@gmail.com directly."
                    ),
                    h(
                      "form",
                      {
                        className: "contact-form-fields",
                        onSubmit: handleContactSubmit
                      },
                      h(
                        "div",
                        { className: "contact-input-group" },
                        h(
                          "label",
                          { htmlFor: "contact-name-input", className: "contact-label" },
                          "Your Name"
                        ),
                        h("input", {
                          id: "contact-name-input",
                          type: "text",
                          name: "name",
                          required: true,
                          placeholder: "e.g. Sarah Jenkins",
                          className: "contact-input",
                          value: contactForm.name,
                          onChange: (e) =>
                            setContactForm((prev) => ({ ...prev, name: e.target.value }))
                        })
                      ),
                      h(
                        "div",
                        { className: "contact-input-group" },
                        h(
                          "label",
                          { htmlFor: "contact-email-input", className: "contact-label" },
                          "Your Email"
                        ),
                        h("input", {
                          id: "contact-email-input",
                          type: "email",
                          name: "email",
                          required: true,
                          placeholder: "you@company.com",
                          className: "contact-input",
                          value: contactForm.email,
                          onChange: (e) =>
                            setContactForm((prev) => ({ ...prev, email: e.target.value }))
                        })
                      ),
                      h(
                        "div",
                        { className: "contact-input-group" },
                        h(
                          "label",
                          { htmlFor: "contact-message-input", className: "contact-label" },
                          "Message"
                        ),
                        h("textarea", {
                          id: "contact-message-input",
                          name: "message",
                          required: true,
                          rows: 4,
                          placeholder: "Tell me about the role, project, or collaboration...",
                          className: "contact-textarea",
                          value: contactForm.message,
                          onChange: (e) =>
                            setContactForm((prev) => ({ ...prev, message: e.target.value }))
                        })
                      ),
                      contactStatus.state !== "idle" &&
                        h(
                          "div",
                          {
                            className: `contact-status-banner status-${contactStatus.state}`,
                            role: "status"
                          },
                          contactStatus.message
                        ),
                      h(
                        "button",
                        {
                          type: "submit",
                          disabled: contactStatus.state === "submitting",
                          className: "btn-pill-dark contact-submit-btn"
                        },
                        h(
                          "span",
                          null,
                          contactStatus.state === "submitting" ? "Sending Message…" : "Send Message"
                        ),
                        h("span", { className: "btn-trailing-circle", "aria-hidden": "true" }, "→")
                      )
                    )
                  ),

                  // Right Column: 3D Dhaka Globe + Copy Email + Say Hello Direct Options
                  h(
                    "div",
                    { className: "contact-globe-col" },
                    h(
                      "p",
                      { style: { fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6 } },
                      "Open to AI Engineering, Machine Learning, and Full-Stack roles, internships, research collaborations, and technical interviews."
                    ),

                    // Interactive Three.js 3D Globe with Dhaka, Bangladesh Pin
                    h(
                      "div",
                      { className: "contact-globe-wrap" },
                      h(
                        "div",
                        { className: "dhaka-pin-badge" },
                        h("span", { className: "red-dot" }),
                        h("span", null, "Dhaka, Bangladesh")
                      ),
                      h(ContactGlobeScene)
                    ),

                    // Social Icons + Copy Email Row
                    h(
                      "div",
                      { className: "contact-quick-actions-row" },
                      h(
                        "a",
                        {
                          href: PROFILE_DATA.github,
                          target: "_blank",
                          rel: "noopener",
                          className: "icon-circle-btn",
                          title: "GitHub @fardinhossain",
                          "aria-label": "GitHub Profile"
                        },
                        h(GithubIcon, { size: 17 })
                      ),
                      h(
                        "a",
                        {
                          href: PROFILE_DATA.linkedin,
                          target: "_blank",
                          rel: "noopener",
                          className: "icon-circle-btn",
                          title: "LinkedIn @fardinhosn",
                          "aria-label": "LinkedIn Profile"
                        },
                        h(LinkedInIcon, { size: 17 })
                      ),
                      h(
                        "a",
                        {
                          href: `mailto:${PROFILE_DATA.email}`,
                          className: "icon-circle-btn",
                          title: `Email ${PROFILE_DATA.email}`,
                          "aria-label": "Send Email"
                        },
                        h(MailIcon, { size: 17 })
                      ),
                      h(
                        "button",
                        {
                          type: "button",
                          className: "project-action-pill",
                          style: { fontSize: "0.76rem", padding: "0.4rem 0.85rem" },
                          onClick: handleCopyEmail
                        },
                        copiedEmail ? "✓ Email Copied" : "Copy Email"
                      )
                    ),

                    h(
                      "a",
                      {
                        href: `mailto:${PROFILE_DATA.email}?subject=AI%20Engineering%20%2F%20Full-Stack%20Opportunity`,
                        className: "btn-pill-dark",
                        style: { width: "100%", justifyContent: "space-between" }
                      },
                      h("span", null, "Say Hello (fardin.hosn@gmail.com)"),
                      h("span", { className: "btn-trailing-circle" }, "→")
                    )
                  )
                )
              )
            ),

            // ================================================================
            // 7. EXPANDED FOOTER (Nav Links, Social Icons & Back to Top ↑)
            // ================================================================
            h(
              "footer",
              { className: "site-footer" },
              h(
                "div",
                { className: "site-footer-top" },
                // Brand & Tagline
                h(
                  "div",
                  { className: "site-footer-brand" },
                  h(
                    "a",
                    {
                      href: "#home",
                      className: "brand-logo",
                      onClick: (e) => {
                        e.preventDefault();
                        navigateToSection("home");
                      }
                    },
                    h("span", { className: "brand-icon-circle", "aria-hidden": "true" }, "✦"),
                    h("span", null, "fardin.ai"),
                    h("span", { className: "red-dot", "aria-hidden": "true" })
                  ),
                  h(
                    "p",
                    { className: "site-footer-desc" },
                    "Md. Fardin Hossain · AI Engineer & Full-Stack Developer · Dhaka, Bangladesh"
                  )
                ),

                // Footer Navigation Links (Matching exact section order)
                h(
                  "nav",
                  { className: "site-footer-nav", "aria-label": "Footer Navigation" },
                  [
                    { id: "home", label: "Home" },
                    { id: "about", label: "About" },
                    { id: "experience", label: "Experience" },
                    { id: "projects", label: "Projects" },
                    { id: "certifications", label: "Certifications" },
                    { id: "contact", label: "Contact" }
                  ].map((item) =>
                    h(
                      "button",
                      {
                        key: item.id,
                        type: "button",
                        className: "site-footer-link",
                        onClick: () => navigateToSection(item.id)
                      },
                      item.label
                    )
                  )
                ),

                // Social Icons & Back to Top Button
                h(
                  "div",
                  { className: "site-footer-actions" },
                  h(
                    "div",
                    { className: "site-footer-socials" },
                    h(
                      "a",
                      {
                        href: PROFILE_DATA.github,
                        target: "_blank",
                        rel: "noopener",
                        className: "icon-circle-btn",
                        title: "GitHub @fardinhossain",
                        "aria-label": "GitHub"
                      },
                      h(GithubIcon, { size: 16 })
                    ),
                    h(
                      "a",
                      {
                        href: PROFILE_DATA.linkedin,
                        target: "_blank",
                        rel: "noopener",
                        className: "icon-circle-btn",
                        title: "LinkedIn @fardinhosn",
                        "aria-label": "LinkedIn"
                      },
                      h(LinkedInIcon, { size: 16 })
                    ),
                    h(
                      "a",
                      {
                        href: `mailto:${PROFILE_DATA.email}`,
                        className: "icon-circle-btn",
                        title: `Email ${PROFILE_DATA.email}`,
                        "aria-label": "Email"
                      },
                      h(MailIcon, { size: 16 })
                    )
                  ),
                  h(
                    "button",
                    {
                      type: "button",
                      className: "project-action-pill back-to-top-btn",
                      onClick: () => scrollToTarget(0),
                      "aria-label": "Back to top"
                    },
                    "Back to top ↑"
                  )
                )
              ),
              h(
                "div",
                { className: "site-footer-bottom" },
                h(
                  "span",
                  null,
                  `© ${new Date().getFullYear()} Md. Fardin Hossain. All rights reserved.`
                ),
                h(
                  "button",
                  {
                    type: "button",
                    className: "replay-entrance-btn",
                    onClick: () => {
                      scrollToTarget(0);
                      setTimeout(() => window.location.reload(), 300);
                    },
                    "aria-label": "Replay 3D cinematic hero entrance animation"
                  },
                  "↺ Replay Entrance"
                ),
                h(
                  "span",
                  null,
                  "Built with React & Tailwind CSS"
                )
              )
            )
          )
        )
    ),

    // ========================================================================
    // MOBILE BOTTOM TAB BAR (MATCHES EXACT SECTION ORDER)
    // ========================================================================
    h(
      "nav",
      { className: "mobile-bottom-bar", "aria-label": "Mobile Quick Navigation" },
      [
        { id: "home", label: "Home", icon: "⌂", action: () => navigateToSection("home") },
        { id: "about", label: "About", icon: "◉", action: () => navigateToSection("about") },
        { id: "experience", label: "Exp", icon: "★", action: () => navigateToSection("experience") },
        { id: "projects", label: "Projects", icon: "⊞", action: () => navigateToSection("projects") },
        { id: "certifications", label: "Certs", icon: "✓", action: () => navigateToSection("certifications") },
        { id: "contact", label: "Contact", icon: "✉", action: () => navigateToSection("contact") }
      ].map((tab) => {
        const isActive = view === "home" && activeNav === tab.id;
        return h(
          "button",
          {
            key: tab.id,
            type: "button",
            className: `mobile-tab-item ${isActive ? "active" : ""}`,
            onClick: tab.action
          },
          h("span", { style: { fontSize: "0.95rem", lineHeight: 1 } }, tab.icon),
          h("span", null, tab.label)
        );
      })
    ),

    // ========================================================================
    // PROJECT DETAILS MODAL
    // ========================================================================
    h(
      AnimatePresence,
      null,
      selectedProject &&
        h(
          motion.div,
          {
            className: "modal-overlay",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            onClick: () => setSelectedProject(null)
          },
          h(
            motion.div,
            {
              className: "modal-window",
              initial: { opacity: 0, scale: 0.95, y: 16 },
              animate: { opacity: 1, scale: 1, y: 0 },
              exit: { opacity: 0, scale: 0.95, y: 16 },
              onClick: (e) => e.stopPropagation(),
              role: "dialog",
              "aria-modal": "true",
              "aria-labelledby": "project-modal-title"
            },
            h(
              "div",
              { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "1rem" } },
              h(
                "div",
                null,
                h("span", { className: "tech-chip", style: { fontWeight: 700 } }, selectedProject.shortCategory),
                h(
                  "h3",
                  { id: "project-modal-title", style: { fontSize: "1.5rem", fontWeight: 900, marginTop: "0.4rem" } },
                  selectedProject.title
                )
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "icon-circle-btn",
                  onClick: () => setSelectedProject(null),
                  "aria-label": "Close project details modal"
                },
                "✕"
              )
            ),

            h(
              "p",
              { style: { color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.25rem" } },
              selectedProject.description
            ),

            h(
              "h4",
              { style: { fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.5rem" } },
              "Key Engineering Highlights"
            ),
            h(
              "ul",
              { className: "exp-bullets", style: { marginBottom: "1.25rem" } },
              selectedProject.highlights.map((hl, i) => h("li", { key: i }, hl))
            ),

            h(
              "div",
              { className: "project-tags-row", style: { marginBottom: "1.5rem" } },
              selectedProject.tags.map((t) => h("span", { key: t, className: "tech-chip" }, t))
            ),

            h(
              "div",
              { style: { display: "flex", flexWrap: "wrap", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--border-light)" } },
              selectedProject.journeyTrigger &&
                h(
                  "button",
                  {
                    type: "button",
                    className: "btn-pill-yellow",
                    onClick: () => openJourneyExperience()
                  },
                  h("span", null, "Open Interactive 4-Month Journey"),
                  h("span", { className: "btn-trailing-circle" }, "→")
                ),
              selectedProject.liveUrl &&
                h(
                  "a",
                  {
                    href: selectedProject.liveUrl,
                    target: "_blank",
                    rel: "noopener",
                    className: "btn-pill-dark"
                  },
                  h("span", null, "Open Live Application"),
                  h("span", { className: "btn-trailing-circle" }, "↗")
                ),
              selectedProject.paperUrl &&
                h(
                  "a",
                  {
                    href: selectedProject.paperUrl,
                    target: "_blank",
                    rel: "noopener",
                    className: "btn-pill-light"
                  },
                  "📄 Download Paper PDF"
                ),
              selectedProject.githubUrl &&
                h(
                  "a",
                  {
                    href: selectedProject.githubUrl,
                    target: "_blank",
                    rel: "noopener",
                    className: "btn-pill-light"
                  },
                  h(GithubIcon, { size: 16 }),
                  h("span", null, "View GitHub Repository ↗")
                )
            )
          )
        )
    ),

    // ========================================================================
    // CERTIFICATE SCAN MODAL (FOR CPTE & EDGE-CUET)
    // ========================================================================
    h(
      AnimatePresence,
      null,
      selectedCertModal &&
        h(
          motion.div,
          {
            className: "modal-overlay",
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            onClick: () => setSelectedCertModal(null)
          },
          h(
            motion.div,
            {
              className: "modal-window",
              initial: { opacity: 0, scale: 0.95 },
              animate: { opacity: 1, scale: 1 },
              exit: { opacity: 0, scale: 0.95 },
              onClick: (e) => e.stopPropagation(),
              role: "dialog",
              "aria-modal": "true"
            },
            h(
              "div",
              { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" } },
              h(
                "div",
                null,
                h("div", { style: { fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-red)" } }, selectedCertModal.issuer),
                h("h3", { style: { fontSize: "1.2rem", fontWeight: 800 } }, selectedCertModal.title)
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "icon-circle-btn",
                  onClick: () => setSelectedCertModal(null),
                  "aria-label": "Close certificate preview"
                },
                "✕"
              )
            ),
            selectedCertModal.certificateImage &&
              h(
                "div",
                { style: { display: "flex", flexDirection: "column", gap: "0.85rem" } },
                selectedCertModal.verifyUrl
                  ? h(
                      "a",
                      {
                        href: selectedCertModal.verifyUrl,
                        target: "_blank",
                        rel: "noopener",
                        title: "Click to open official verification page",
                        style: { display: "block", cursor: "pointer" }
                      },
                      h("img", {
                        src: selectedCertModal.certificateImage,
                        alt: selectedCertModal.title,
                        style: { width: "100%", borderRadius: "14px", border: "1px solid var(--border-light)", transition: "opacity 0.2s ease" }
                      })
                    )
                  : h("img", {
                      src: selectedCertModal.certificateImage,
                      alt: selectedCertModal.title,
                      style: { width: "100%", borderRadius: "14px", border: "1px solid var(--border-light)" }
                    }),
                selectedCertModal.verifyUrl &&
                  h(
                    "div",
                    { style: { display: "flex", justifyContent: "flex-end", gap: "0.6rem" } },
                    h(
                      "a",
                      {
                        href: selectedCertModal.verifyUrl,
                        target: "_blank",
                        rel: "noopener",
                        className: "btn-pill-dark",
                        style: { textDecoration: "none", fontSize: "0.82rem", padding: "0.45rem 1rem" }
                      },
                      h("span", null, "Verify Credential"),
                      h("span", { className: "btn-trailing-circle" }, "↗")
                    )
                  )
              )
          )
        )
    )
  );
}

// ============================================================================
// SYSTEM ERROR BOUNDARY (Guarantees zero blank screen failures)
// ============================================================================
class PortfolioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PortfolioApp ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return h(
        "div",
        {
          style: {
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "var(--font-sans, sans-serif)",
            background: "var(--bg-page, #F6F7FA)",
            color: "var(--text-primary, #090D16)",
            textAlign: "center"
          }
        },
        h("div", {
          style: {
            width: "52px",
            height: "52px",
            borderRadius: "14px",
            background: "var(--accent-red, #E11D48)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem"
          }
        }, "!"),
        h("h1", { style: { fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.5rem" } }, "fardin.ai System Recovery"),
        h("p", { style: { color: "var(--text-secondary, #475569)", maxWidth: "520px", marginBottom: "1.5rem", fontSize: "0.95rem" } },
          "An interface component encountered an unexpected error. The system has safely isolated it so your session remains intact."
        ),
        h(
          "button",
          {
            type: "button",
            className: "btn-pill-dark",
            onClick: () => {
              try { sessionStorage.clear(); } catch (_e) {}
              window.location.reload();
            }
          },
          "Reload Portfolio System"
        )
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("app-root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(h(PortfolioErrorBoundary, null, h(PortfolioApp)));
}
