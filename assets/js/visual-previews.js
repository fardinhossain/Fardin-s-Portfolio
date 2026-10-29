// ==========================================================================
// FARDIN.AI — CUSTOM PROJECT VISUAL PREVIEWS & PRECISION ICONS
// Matches the Figma concept preview headers + real repository screenshots.
// ==========================================================================

import React from "react";

const h = React.createElement;

export function MetricIcon({ name }) {
  if (name === "database") {
    return h(
      "svg",
      { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
      h("ellipse", { cx: 12, cy: 5, rx: 9, ry: 3 }),
      h("path", { d: "M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" }),
      h("path", { d: "M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" })
    );
  }
  if (name === "target") {
    return h(
      "svg",
      { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "#E11D48", strokeWidth: 2 },
      h("circle", { cx: 12, cy: 12, r: 10 }),
      h("circle", { cx: 12, cy: 12, r: 6 }),
      h("circle", { cx: 12, cy: 12, r: 2 })
    );
  }
  if (name === "layers") {
    return h(
      "svg",
      { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
      h("polygon", { points: "12 2 2 7 12 12 22 7 12 2" }),
      h("polyline", { points: "2 17 12 22 22 17" }),
      h("polyline", { points: "2 12 12 17 22 12" })
    );
  }
  return h(
    "svg",
    { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "#F59E0B", strokeWidth: 2 },
    h("circle", { cx: 12, cy: 8, r: 6 }),
    h("path", { d: "M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" })
  );
}

export function GithubIcon({ size = 16 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    h("path", {
      d: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
    })
  );
}

export function LinkedInIcon({ size = 16 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    h("path", { d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" }),
    h("rect", { x: 2, y: 9, width: 4, height: 12 }),
    h("circle", { cx: 4, cy: 4, r: 2 })
  );
}

export function MailIcon({ size = 16 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 },
    h("rect", { width: 20, height: 16, x: 2, y: 4, rx: 2 }),
    h("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  );
}

export function ExternalArrowIcon({ size = 14 }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2 },
    h("path", { d: "M7 17L17 7" }),
    h("path", { d: "M7 7h10v10" })
  );
}

export function ProjectVisualHeader({ project }) {
  // Always prioritize the real project screenshot when available (like LocationKhuji)
  if (project && project.image) {
    return h(
      "div",
      {
        className: "project-preview-media",
        style: { position: "relative", background: "#0F172A", width: "100%", height: "100%" }
      },
      h("img", {
        src: project.image,
        alt: `${project.title} live application preview`,
        style: {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top center",
          display: "block"
        },
        loading: "lazy"
      })
    );
  }

  const type = project.visualType;

  // 1. Civic-Pulse AI: Municipal Geospatial Anomaly Dashboard
  if (type === "civic") {
    return h(
      "div",
      {
        className: "project-preview-media",
        style: {
          background: "linear-gradient(135deg, #090D16 0%, #111C2D 100%)",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative"
        }
      },
      h(
        "svg",
        {
          viewBox: "0 0 360 150",
          style: { width: "100%", height: "100%", overflow: "visible" }
        },
        // Map grid lines
        h("line", { x1: 0, y1: 35, x2: 360, y2: 35, stroke: "rgba(56,189,248,0.12)", strokeWidth: 1 }),
        h("line", { x1: 0, y1: 75, x2: 360, y2: 75, stroke: "rgba(56,189,248,0.12)", strokeWidth: 1 }),
        h("line", { x1: 0, y1: 115, x2: 360, y2: 115, stroke: "rgba(56,189,248,0.12)", strokeWidth: 1 }),
        h("line", { x1: 90, y1: 0, x2: 90, y2: 150, stroke: "rgba(56,189,248,0.12)", strokeWidth: 1 }),
        h("line", { x1: 180, y1: 0, x2: 180, y2: 150, stroke: "rgba(56,189,248,0.12)", strokeWidth: 1 }),
        h("line", { x1: 270, y1: 0, x2: 270, y2: 150, stroke: "rgba(56,189,248,0.12)", strokeWidth: 1 }),
        // Stylized Bangladesh / Municipal Zone Polygon
        h("path", {
          d: "M75,30 L125,22 L150,55 L140,105 L105,125 L70,95 Z",
          fill: "rgba(56,189,248,0.18)",
          stroke: "#38BDF8",
          strokeWidth: 1.5
        }),
        // Anomaly Hotspots
        h("circle", { cx: 112, cy: 58, r: 12, fill: "rgba(225,29,72,0.28)" }),
        h("circle", { cx: 112, cy: 58, r: 4.5, fill: "#E11D48" }),
        h("circle", { cx: 132, cy: 86, r: 9, fill: "rgba(250,204,21,0.28)" }),
        h("circle", { cx: 132, cy: 86, r: 4, fill: "#FACC15" }),
        h("circle", { cx: 92, cy: 90, r: 4, fill: "#10B981" }),
        // Right Telemetry Panel
        h("rect", { x: 185, y: 26, width: 158, height: 98, rx: 10, fill: "rgba(15,23,42,0.88)", stroke: "rgba(255,255,255,0.12)" }),
        h("text", { x: 198, y: 46, fill: "#94A3B8", fontSize: "9", fontFamily: "JetBrains Mono, monospace" }, "VISION TRIAGE ENGINE"),
        h("rect", { x: 198, y: 56, width: 122, height: 8, rx: 4, fill: "rgba(225,29,72,0.25)" }),
        h("rect", { x: 198, y: 56, width: 98, height: 8, rx: 4, fill: "#E11D48" }),
        h("rect", { x: 198, y: 74, width: 122, height: 8, rx: 4, fill: "rgba(250,204,21,0.2)" }),
        h("rect", { x: 198, y: 74, width: 76, height: 8, rx: 4, fill: "#FACC15" }),
        h("rect", { x: 198, y: 92, width: 122, height: 8, rx: 4, fill: "rgba(16,185,129,0.2)" }),
        h("rect", { x: 198, y: 92, width: 110, height: 8, rx: 4, fill: "#10B981" }),
        h("text", { x: 198, y: 114, fill: "#E2E8F0", fontSize: "9", fontWeight: "700", fontFamily: "Plus Jakarta Sans, sans-serif" }, "Priority Dispatch: Active")
      )
    );
  }

  // 2. LocationKhuji: Real Screenshot + Pin Overlay
  if (type === "location") {
    return h(
      "div",
      {
        className: "project-preview-media",
        style: { position: "relative", background: "#0F172A" }
      },
      h("img", {
        src: project.image || "assets/images/locationkhuji.png",
        alt: "LocationKhuji AI geospatial search interface",
        style: { width: "100%", height: "100%", objectFit: "cover", opacity: 0.92 },
        loading: "lazy"
      })
    );
  }

  // 3. SchedOS: Interactive CPU Gantt Chart Visualization (Matches Figma Card)
  if (type === "schedos") {
    return h(
      "div",
      {
        className: "project-preview-media",
        style: {
          background: "linear-gradient(135deg, #090D16 0%, #141B2D 100%)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      h(
        "svg",
        { viewBox: "0 0 360 150", style: { width: "100%", height: "100%" } },
        h("rect", { x: 12, y: 20, width: 336, height: 114, rx: 10, fill: "#0F172A", stroke: "rgba(255,255,255,0.1)" }),
        h("text", { x: 26, y: 40, fill: "#94A3B8", fontSize: "9", fontFamily: "JetBrains Mono, monospace" }, "8 CPU ALGORITHMS • 557 VITEST TESTS PASSING"),
        // Gantt bars
        h("rect", { x: 26, y: 52, width: 68, height: 22, rx: 5, fill: "#E11D48" }),
        h("text", { x: 48, y: 66, fill: "#FFF", fontSize: "9", fontWeight: "700" }, "P1"),
        h("rect", { x: 98, y: 52, width: 52, height: 22, rx: 5, fill: "#FACC15" }),
        h("text", { x: 116, y: 66, fill: "#090D16", fontSize: "9", fontWeight: "700" }, "P2"),
        h("rect", { x: 154, y: 52, width: 84, height: 22, rx: 5, fill: "#10B981" }),
        h("text", { x: 188, y: 66, fill: "#090D16", fontSize: "9", fontWeight: "700" }, "P3"),
        h("rect", { x: 242, y: 52, width: 44, height: 22, rx: 5, fill: "#38BDF8" }),
        h("text", { x: 256, y: 66, fill: "#090D16", fontSize: "9", fontWeight: "700" }, "P4"),
        h("rect", { x: 290, y: 52, width: 44, height: 22, rx: 5, fill: "#A855F7" }),
        h("text", { x: 304, y: 66, fill: "#FFF", fontSize: "9", fontWeight: "700" }, "P5"),
        // Metrics row
        h("rect", { x: 26, y: 88, width: 98, height: 32, rx: 6, fill: "rgba(255,255,255,0.04)" }),
        h("text", { x: 34, y: 102, fill: "#64748B", fontSize: "8" }, "CPU UTILIZATION"),
        h("text", { x: 34, y: 114, fill: "#10B981", fontSize: "10", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }, "98.4%"),
        h("rect", { x: 132, y: 88, width: 98, height: 32, rx: 6, fill: "rgba(255,255,255,0.04)" }),
        h("text", { x: 140, y: 102, fill: "#64748B", fontSize: "8" }, "ALGORITHMS"),
        h("text", { x: 140, y: 114, fill: "#FACC15", fontSize: "10", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }, "FCFS/SRTF/RR"),
        h("rect", { x: 238, y: 88, width: 96, height: 32, rx: 6, fill: "rgba(255,255,255,0.04)" }),
        h("text", { x: 246, y: 102, fill: "#64748B", fontSize: "8" }, "TEST SUITE"),
        h("text", { x: 246, y: 114, fill: "#38BDF8", fontSize: "10", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }, "557 Passed")
      )
    );
  }

  // 4. Skin Disease Classification: Transfer Learning CV Grad-CAM Grid
  if (type === "skincv") {
    return h(
      "div",
      {
        className: "project-preview-media",
        style: {
          background: "linear-gradient(135deg, #18181B 0%, #27272A 100%)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      h(
        "svg",
        { viewBox: "0 0 360 150", style: { width: "100%", height: "100%" } },
        // 3 Diagnostic Lesion Scan Frames (Matching Figma 3-panel layout)
        h("rect", { x: 14, y: 24, width: 102, height: 104, rx: 10, fill: "#2D1B22", stroke: "rgba(225,29,72,0.45)" }),
        h("circle", { cx: 65, cy: 74, r: 30, fill: "rgba(225,29,72,0.35)" }),
        h("circle", { cx: 65, cy: 74, r: 16, fill: "rgba(225,29,72,0.7)" }),
        h("rect", { x: 42, y: 51, width: 46, height: 46, fill: "none", stroke: "#FACC15", strokeWidth: 1.2, strokeDasharray: "4 2" }),
        h("text", { x: 24, y: 118, fill: "#F8FAFC", fontSize: "8", fontFamily: "JetBrains Mono, monospace" }, "GoogLeNet: 0.99"),

        h("rect", { x: 129, y: 24, width: 102, height: 104, rx: 10, fill: "#1E2530", stroke: "rgba(56,189,248,0.45)" }),
        h("circle", { cx: 180, cy: 74, r: 30, fill: "rgba(56,189,248,0.25)" }),
        h("circle", { cx: 180, cy: 74, r: 15, fill: "rgba(225,29,72,0.65)" }),
        h("rect", { x: 157, y: 51, width: 46, height: 46, fill: "none", stroke: "#10B981", strokeWidth: 1.2, strokeDasharray: "4 2" }),
        h("text", { x: 138, y: 118, fill: "#F8FAFC", fontSize: "8", fontFamily: "JetBrains Mono, monospace" }, "MobileNet: 0.98"),

        h("rect", { x: 244, y: 24, width: 102, height: 104, rx: 10, fill: "#2A1E24", stroke: "rgba(16,185,129,0.45)" }),
        h("circle", { cx: 295, cy: 74, r: 28, fill: "rgba(245,158,11,0.3)" }),
        h("circle", { cx: 295, cy: 74, r: 14, fill: "rgba(225,29,72,0.75)" }),
        h("text", { x: 254, y: 118, fill: "#10B981", fontSize: "8", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }, "Acc: 98.7% Test")
      )
    );
  }

  // 5. FlyRank AI ML Capstone: Ranking Precision@50 Chart
  if (type === "flyrank") {
    return h(
      "div",
      {
        className: "project-preview-media",
        style: {
          background: "linear-gradient(135deg, #090D16 0%, #1E293B 100%)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      h(
        "svg",
        { viewBox: "0 0 360 150", style: { width: "100%", height: "100%" } },
        h("rect", { x: 14, y: 18, width: 332, height: 114, rx: 12, fill: "#0F172A", stroke: "rgba(250,204,21,0.3)" }),
        h("text", { x: 28, y: 40, fill: "#FACC15", fontSize: "9", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }, "FLYRANK AI CAPSTONE • 9,961 CANDIDATE PAGES"),
        h("text", { x: 28, y: 64, fill: "#E2E8F0", fontSize: "10", fontWeight: "700" }, "Learned Ranker (0.78 P@50)"),
        h("rect", { x: 28, y: 71, width: 280, height: 12, rx: 6, fill: "rgba(16,185,129,0.2)" }),
        h("rect", { x: 28, y: 71, width: 218, height: 12, rx: 6, fill: "#10B981" }),
        h("text", { x: 28, y: 102, fill: "#94A3B8", fontSize: "10", fontWeight: "600" }, "Fixed-Rule Baseline (0.30 P@50)"),
        h("rect", { x: 28, y: 109, width: 280, height: 10, rx: 5, fill: "rgba(225,29,72,0.2)" }),
        h("rect", { x: 28, y: 109, width: 84, height: 10, rx: 5, fill: "#E11D48" })
      )
    );
  }

  // Fallback for UniBuddy / Routine / GainTheBrain
  if (project.image) {
    return h(
      "div",
      { className: "project-preview-media", style: { background: "#0F172A" } },
      h("img", {
        src: project.image,
        alt: project.title,
        style: { width: "100%", height: "100%", objectFit: "cover" },
        loading: "lazy"
      })
    );
  }

  return h(
    "div",
    {
      className: "project-preview-media",
      style: {
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem"
      }
    },
    h(
      "div",
      {
        style: {
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          background: "rgba(255,255,255,0.04)",
          width: "100%"
        }
      },
      h(
        "div",
        {
          style: {
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "#FACC15",
            marginBottom: "0.35rem"
          }
        },
        project.shortCategory
      ),
      h(
        "div",
        { style: { color: "#FFFFFF", fontWeight: 800, fontSize: "1rem" } },
        project.title
      ),
      h(
        "div",
        { style: { color: "#94A3B8", fontSize: "0.75rem", marginTop: "0.25rem" } },
        project.tags.slice(0, 3).join(" • ")
      )
    )
  );
}
