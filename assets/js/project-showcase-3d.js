// ==========================================================================
// FARDIN.AI — PROJECTS SHOWCASE SECTION (DESKTOP & MOBILE REDESIGN)
// Features:
//   - Futuristic Summitscape Wireframe Mountain Background (Dark & Light)
//   - Large Gradient "Projects" Heading (Space Grotesk) & Inter Subtitle
//   - Metrics Stats (5+ Projects Built, 10+ Technologies, Real World Focus)
//   - Category Filter Pills (All, Web Apps, AI / ML, Mobile Apps, Tools, Academic)
//   - Desktop Featured Project Showcase Card (Laptop + Phone Mockup, 2x2 Features, Tech Tags, Demo/GitHub/Details, < > Nav)
//   - Desktop Responsive Lower Card Grid (02-05, Thumbnails, Descriptions, Chips, Actions)
//   - Mobile Horizontally Swipeable Carousel with Peeking Adjacent Cards, Active Glow, Pagination Dots & Swipe Hint
//   - Mobile Dedicated Project Details View (<- Back to Projects, Mountain Hero Preview, Overlay Arrows, Full Badges, Key Features)
//   - Full Dark / Light Theme & Reduced Motion Support
// ==========================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";

const h = React.createElement;

// --------------------------------------------------------------------------
// 1. INLINE SVG ICONS
// --------------------------------------------------------------------------
function IconCube({ size = 20, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" }),
    h("polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }),
    h("line", { x1: "12", y1: "22.08", x2: "12", y2: "12" })
  );
}

function IconCodeBrackets({ size = 20, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
    h("polyline", { points: "16 18 22 12 16 6" }),
    h("polyline", { points: "8 6 2 12 8 18" }),
    h("line", { x1: "14", y1: "4", x2: "10", y2: "20" })
  );
}

function IconUsersGroup({ size = 20, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
    h("circle", { cx: "9", cy: "7", r: "4" }),
    h("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
    h("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  );
}

function IconCategory({ type = "all", size = 16, color = "currentColor" }) {
  switch (type) {
    case "all":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1.5" }),
        h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1.5" }),
        h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1.5" }),
        h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1.5" })
      );
    case "web":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2" }),
        h("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
        h("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
      );
    case "ai-ml":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("path", { d: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" }),
        h("circle", { cx: "12", cy: "12", r: "3" })
      );
    case "mobile":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2.5" }),
        h("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" })
      );
    case "tools":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("path", { d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" })
      );
    case "academic":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("path", { d: "M22 10v6M2 10l10-5 10 5-10 5z" }),
        h("path", { d: "M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" })
      );
    default:
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("circle", { cx: "12", cy: "12", r: "10" })
      );
  }
}

function IconFeatureBullet({ name = "sparkle", size = 14, color = "currentColor" }) {
  switch (name) {
    case "sparkle":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" })
      );
    case "map":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("polygon", { points: "3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" }),
        h("line", { x1: "9", y1: "3", x2: "9", y2: "18" }),
        h("line", { x1: "15", y1: "6", x2: "15", y2: "21" })
      );
    case "radar":
    case "pin":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
        h("circle", { cx: "12", cy: "10", r: "3" })
      );
    case "layout":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
        h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }),
        h("line", { x1: "3", y1: "9", x2: "21", y2: "9" }),
        h("line", { x1: "9", y1: "21", x2: "9", y2: "9" })
      );
    case "phone":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2.5" })
      );
    case "chat":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
      );
    case "calc":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }),
        h("line", { x1: "8", y1: "6", x2: "16", y2: "6" })
      );
    case "doc":
    case "file":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
        h("polyline", { points: "14 2 14 8 20 8" })
      );
    case "cpu":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("rect", { x: "4", y: "4", width: "16", height: "16", rx: "2" }),
        h("rect", { x: "9", y: "9", width: "6", height: "6" })
      );
    case "chart":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("line", { x1: "18", y1: "20", x2: "18", y2: "10" }),
        h("line", { x1: "12", y1: "20", x2: "12", y2: "4" }),
        h("line", { x1: "6", y1: "20", x2: "6", y2: "14" })
      );
    case "check":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.5" },
        h("polyline", { points: "20 6 9 17 4 12" })
      );
    case "shield":
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" })
      );
    default:
      return h(
        "svg",
        { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2" },
        h("circle", { cx: "12", cy: "12", r: "4" })
      );
  }
}

function IconStar({ size = 13, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: color, strokeWidth: "1" },
    h("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" })
  );
}

function IconHeart({ size = 16, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" })
  );
}

function IconGitHub({ size = 16, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: color },
    h("path", { d: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" })
  );
}

function IconArrowRight({ size = 15, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" },
    h("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
    h("polyline", { points: "12 5 19 12 12 19" })
  );
}

function IconExternalArrow({ size = 14, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" },
    h("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
    h("polyline", { points: "15 3 21 3 21 9" }),
    h("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
  );
}

function IconChevronLeft({ size = 16, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" },
    h("polyline", { points: "15 18 9 12 15 6" })
  );
}

function IconChevronRight({ size = 16, color = "currentColor" }) {
  return h(
    "svg",
    { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" },
    h("polyline", { points: "9 18 15 12 9 6" })
  );
}

// --------------------------------------------------------------------------
// 2. COMPATIBILITY 3D ROBOT FACTORY EXPORT (Preserved for experience-timeline-3d.js)
// --------------------------------------------------------------------------
export function createFlyingRobot3D() {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  const whiteShellMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.16,
    metalness: 0.05,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  });

  const softGrayMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.32,
    metalness: 0.18
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.08,
    metalness: 0.2,
    clearcoat: 1.0
  });

  const redLedMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
  const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.85 });
  const antigravRingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.6 });
  const scanBeamMat = new THREE.MeshBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.25 });

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.56, 0);
  bodyPivot.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.46, 24, 20);
  headGeo.scale(1.18, 0.92, 0.96);
  const headMesh = new THREE.Mesh(headGeo, whiteShellMat);
  headGroup.add(headMesh);

  const visorGeo = new THREE.SphereGeometry(0.43, 20, 16);
  visorGeo.scale(1.06, 0.72, 0.65);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, -0.02, 0.19);
  headGroup.add(visorMesh);

  const eyeGroup = new THREE.Group();
  eyeGroup.position.set(0, -0.01, 0.465);
  headGroup.add(eyeGroup);

  const eyeGeo = new THREE.CapsuleGeometry(0.052, 0.045, 8, 12);
  eyeGeo.rotateZ(Math.PI * 0.5);

  const leftEye = new THREE.Mesh(eyeGeo, redLedMat);
  leftEye.position.set(-0.145, 0, 0);
  eyeGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, redLedMat);
  rightEye.position.set(0.145, 0, 0);
  eyeGroup.add(rightEye);

  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), redLedMat);
  antennaTip.position.set(0, 0.55, 0);
  headGroup.add(antennaTip);

  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0, 0);
  bodyPivot.add(torsoGroup);

  const chestGeo = new THREE.SphereGeometry(0.44, 24, 20);
  chestGeo.scale(0.96, 1.05, 0.88);
  const chestMesh = new THREE.Mesh(chestGeo, whiteShellMat);
  chestMesh.position.set(0, -0.02, 0);
  torsoGroup.add(chestMesh);

  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.46, 0.1, 0);
  torsoGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.46, 0.1, 0);
  torsoGroup.add(rightArmGroup);

  const leftArmParts = { armRoot: leftArmGroup, gripperPivot: leftArmGroup };
  const rightArmParts = { armRoot: rightArmGroup, gripperPivot: rightArmGroup };

  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.17, -0.4, 0);
  torsoGroup.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.17, -0.4, 0);
  torsoGroup.add(rightLegGroup);

  const thrusterFlame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 16), thrusterMat);
  thrusterFlame.position.set(0, -0.68, 0);
  thrusterFlame.rotation.x = Math.PI;
  torsoGroup.add(thrusterFlame);

  const antigravRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.025, 8, 20), antigravRingMat);
  antigravRing.rotation.x = Math.PI * 0.5;
  antigravRing.position.set(0, -0.48, 0);
  torsoGroup.add(antigravRing);

  const scanBeamGroup = new THREE.Group();
  const scanReticle = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.12, 16), redLedMat);
  scanBeamGroup.add(scanReticle);
  scanBeamGroup.visible = false;
  bodyPivot.add(scanBeamGroup);

  const cargoPivot = new THREE.Group();
  cargoPivot.position.set(0, -0.45, 0.1);
  torsoGroup.add(cargoPivot);

  const miniCardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.02), whiteShellMat);
  cargoPivot.add(miniCardMesh);
  const tractorRing = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 20), redLedMat);
  cargoPivot.add(tractorRing);

  return {
    root,
    bodyPivot,
    headGroup,
    eyeGroup,
    leftEye,
    rightEye,
    antennaTip,
    leftArmGroup,
    rightArmGroup,
    leftArmParts,
    rightArmParts,
    leftLegGroup,
    rightLegGroup,
    thrusterFlame,
    thrusterMat,
    antigravRing,
    antigravRingMat,
    scanBeamGroup,
    scanReticle,
    scanBeamMat,
    cargoPivot,
    miniCardMesh,
    tractorRing,
    updateProjectCard: () => {}
  };
}

// --------------------------------------------------------------------------
// 3. MAIN FEATURED PROJECTS COMPONENT (`FeaturedProjects`)
// --------------------------------------------------------------------------
export function FeaturedProjects({
  projectsList = [],
  categories = [],
  onOpenModal,
  onOpenJourney
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [mobileDetailsProject, setMobileDetailsProject] = useState(null);
  const [activeMobileCardIndex, setActiveMobileCardIndex] = useState(0);

  const carouselRef = useRef(null);
  const isTouchScrollingRef = useRef(false);

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (!projectsList || projectsList.length === 0) return [];
    if (activeCategory === "all") return projectsList;
    return projectsList.filter((proj) =>
      proj.categories && proj.categories.includes(activeCategory)
    );
  }, [projectsList, activeCategory]);

  // Keep featured project index in valid range
  useEffect(() => {
    setFeaturedIndex(0);
    setActiveMobileCardIndex(0);
  }, [activeCategory]);

  const activeFeatured = useMemo(() => {
    if (filteredProjects.length === 0) return projectsList[0] || null;
    const idx = Math.min(Math.max(0, featuredIndex), filteredProjects.length - 1);
    return filteredProjects[idx];
  }, [filteredProjects, featuredIndex, projectsList]);

  // Remaining projects for the desktop lower 4-card grid
  const lowerGridProjects = useMemo(() => {
    if (!activeFeatured) return [];
    // Display projects from filtered list other than the active featured project
    const others = filteredProjects.filter((p) => p.id !== activeFeatured.id);
    return others.slice(0, 4);
  }, [filteredProjects, activeFeatured]);

  // Cycle Next/Prev for featured project on desktop
  const handleNextFeatured = useCallback(() => {
    if (filteredProjects.length <= 1) return;
    setFeaturedIndex((prev) => (prev + 1) % filteredProjects.length);
  }, [filteredProjects.length]);

  const handlePrevFeatured = useCallback(() => {
    if (filteredProjects.length <= 1) return;
    setFeaturedIndex((prev) => (prev - 1 + filteredProjects.length) % filteredProjects.length);
  }, [filteredProjects.length]);

  // Synchronize Mobile Carousel Active Card on Scroll
  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current || isTouchScrollingRef.current) return;
    const el = carouselRef.current;
    const cardWidth = el.scrollWidth / Math.max(1, filteredProjects.length);
    const newIdx = Math.round(el.scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < filteredProjects.length && newIdx !== activeMobileCardIndex) {
      setActiveMobileCardIndex(newIdx);
    }
  }, [filteredProjects.length, activeMobileCardIndex]);

  const scrollToMobileCard = useCallback((index) => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const cardWidth = el.scrollWidth / Math.max(1, filteredProjects.length);
    isTouchScrollingRef.current = true;
    setActiveMobileCardIndex(index);
    el.scrollTo({
      left: index * cardWidth,
      behavior: "smooth"
    });
    setTimeout(() => {
      isTouchScrollingRef.current = false;
    }, 450);
  }, [filteredProjects.length]);

  // Open Project Details (Modal for Desktop, Dedicated View for Mobile)
  const handleOpenDetails = useCallback((project) => {
    if (!project) return;
    if (typeof window !== "undefined" && window.innerWidth <= 992) {
      setMobileDetailsProject(project);
      window.scrollTo({ top: document.getElementById("projects")?.offsetTop || 0, behavior: "smooth" });
    } else if (onOpenModal) {
      onOpenModal(project);
    }
  }, [onOpenModal]);

  // Dedicated Mobile Details View Navigation
  const handleNextMobileDetails = useCallback(() => {
    if (!mobileDetailsProject || filteredProjects.length <= 1) return;
    const currIdx = filteredProjects.findIndex((p) => p.id === mobileDetailsProject.id);
    const nextIdx = (currIdx + 1) % filteredProjects.length;
    setMobileDetailsProject(filteredProjects[nextIdx]);
  }, [mobileDetailsProject, filteredProjects]);

  const handlePrevMobileDetails = useCallback(() => {
    if (!mobileDetailsProject || filteredProjects.length <= 1) return;
    const currIdx = filteredProjects.findIndex((p) => p.id === mobileDetailsProject.id);
    const prevIdx = (currIdx - 1 + filteredProjects.length) % filteredProjects.length;
    setMobileDetailsProject(filteredProjects[prevIdx]);
  }, [mobileDetailsProject, filteredProjects]);

  return h(
    "section",
    {
      id: "projects",
      className: "projects-showcase-section",
      "data-projects-delivering": "true",
      "aria-label": "Featured Projects Showcase"
    },

    // 1. Futuristic Summitscape Mountain Background (Light & Dark theme dynamic)
    h("div", { className: "projects-mountain-bg", "aria-hidden": "true" }),

    // 2. Subtle Grid Lines Texture Overlay
    h("div", { className: "projects-grid-overlay", "aria-hidden": "true" }),

    // 3. Section Container
    h(
      "div",
      { className: "projects-container" },

      // ====================================================================
      // A. DEDICATED MOBILE PROJECT DETAILS VIEW (Triggered on Mobile tap)
      // ====================================================================
      mobileDetailsProject
        ? h(
            "div",
            { className: "projects-mobile-details-view" },

            // Top Bar: Back Button & Share Icon
            h(
              "div",
              { className: "projects-details-topbar" },
              h(
                "button",
                {
                  className: "projects-details-back-btn",
                  onClick: () => setMobileDetailsProject(null),
                  "aria-label": "Back to Projects list"
                },
                h(IconChevronLeft, { size: 18 }),
                "Back to Projects"
              ),
              h(
                "a",
                {
                  href: mobileDetailsProject.liveUrl || mobileDetailsProject.githubUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "projects-details-share-btn",
                  "aria-label": "Open project URL"
                },
                h(IconExternalArrow, { size: 16 })
              )
            ),

            // Hero Device Preview with Wireframe Summitscape & Overlay Arrows
            h(
              "div",
              { className: "projects-details-preview-hero" },
              h("div", { className: "projects-details-preview-bg", "aria-hidden": "true" }),
              h(
                "div",
                { className: "projects-details-preview-content" },
                h("img", {
                  src: mobileDetailsProject.image || "assets/images/locationkhuji.png",
                  alt: mobileDetailsProject.title,
                  className: "projects-details-hero-img"
                })
              ),
              filteredProjects.length > 1 &&
                h(
                  "button",
                  {
                    className: "projects-details-hero-arrow left",
                    onClick: handlePrevMobileDetails,
                    "aria-label": "Previous project"
                  },
                  h(IconChevronLeft, { size: 20 })
                ),
              filteredProjects.length > 1 &&
                h(
                  "button",
                  {
                    className: "projects-details-hero-arrow right",
                    onClick: handleNextMobileDetails,
                    "aria-label": "Next project"
                  },
                  h(IconChevronRight, { size: 20 })
                )
            ),

            // Title with orange gradient accent
            h(
              "h2",
              { className: "projects-details-title" },
              mobileDetailsProject.titlePrefix || mobileDetailsProject.title,
              " ",
              mobileDetailsProject.titleAccent &&
                h("span", { className: "projects-title-gradient" }, mobileDetailsProject.titleAccent)
            ),

            // Description
            h("p", { className: "projects-details-desc" }, mobileDetailsProject.description || mobileDetailsProject.summary),

            // Complete Tech Badges
            h(
              "div",
              { className: "projects-tech-tags-list" },
              (mobileDetailsProject.tags || []).map((tag, idx) =>
                h("span", { key: idx, className: "projects-tech-tag" }, tag)
              )
            ),

            // Action Buttons Row
            h(
              "div",
              { className: "projects-details-actions" },
              mobileDetailsProject.liveUrl &&
                h(
                  "a",
                  {
                    href: mobileDetailsProject.liveUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "projects-btn-primary"
                  },
                  "Live Demo",
                  h(IconArrowRight, { size: 15 })
                ),
              mobileDetailsProject.githubUrl &&
                h(
                  "a",
                  {
                    href: mobileDetailsProject.githubUrl,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "projects-btn-secondary"
                  },
                  h(IconGitHub, { size: 16 }),
                  "GitHub"
                )
            ),

            // Key Features List
            mobileDetailsProject.keyFeatures && mobileDetailsProject.keyFeatures.length > 0 &&
              h(
                "div",
                { className: "projects-details-features-card" },
                h(
                  "div",
                  { className: "projects-details-features-heading" },
                  h("span", { className: "projects-badge-dot" }),
                  "Key Features"
                ),
                mobileDetailsProject.keyFeatures.map((feat, idx) =>
                  h(
                    "div",
                    { key: idx, className: "projects-details-feature-row" },
                    h(
                      "div",
                      { className: "projects-details-feature-dot" },
                      h(IconFeatureBullet, { name: feat.icon, size: 14 })
                    ),
                    h(
                      "div",
                      null,
                      h("div", { className: "projects-details-feature-text" }, feat.title),
                      feat.desc && h("div", { className: "projects-details-feature-sub" }, feat.desc)
                    )
                  )
                )
              )
          )

        // ====================================================================
        // B. STANDARD VIEW (HEADER + FILTERS + DESKTOP HERO & GRID + MOBILE CAROUSEL)
        // ====================================================================
        : h(
            React.Fragment,
            null,

            // Header Row: Badge, Title & Stats Counters
            h(
              "div",
              { className: "projects-header-row" },
              h(
                "div",
                { className: "projects-header-left" },
                h(
                  "div",
                  { className: "projects-badge" },
                  h("span", { className: "projects-badge-dot" }),
                  "PROJECTS"
                ),
                h(
                  "h2",
                  { className: "projects-title" },
                  "Pro",
                  h("span", { className: "projects-title-gradient" }, "jects")
                ),
                h(
                  "p",
                  { className: "projects-subtitle" },
                  "A collection of projects where I explore ideas, solve real problems, and turn concepts into usable products."
                )
              ),

              // Desktop Top-Right Stats
              h(
                "div",
                { className: "projects-stats-row" },
                h(
                  "div",
                  { className: "projects-stat-card" },
                  h("div", { className: "projects-stat-icon-box" }, h(IconCube, { size: 20 })),
                  h(
                    "div",
                    { className: "projects-stat-info" },
                    h("span", { className: "projects-stat-number" }, "5+"),
                    h("span", { className: "projects-stat-label" }, "Projects Built")
                  )
                ),
                h(
                  "div",
                  { className: "projects-stat-card" },
                  h("div", { className: "projects-stat-icon-box" }, h(IconCodeBrackets, { size: 20 })),
                  h(
                    "div",
                    { className: "projects-stat-info" },
                    h("span", { className: "projects-stat-number" }, "10+"),
                    h("span", { className: "projects-stat-label" }, "Technologies")
                  )
                ),
                h(
                  "div",
                  { className: "projects-stat-card" },
                  h("div", { className: "projects-stat-icon-box" }, h(IconUsersGroup, { size: 20 })),
                  h(
                    "div",
                    { className: "projects-stat-info" },
                    h("span", { className: "projects-stat-number" }, "Real"),
                    h("span", { className: "projects-stat-label" }, "World Focus")
                  )
                )
              )
            ),

            // Category Filter Buttons Bar
            h(
              "div",
              { className: "projects-filters-bar", role: "tablist", "aria-label": "Filter projects by category" },
              categories.map((cat) =>
                h(
                  "button",
                  {
                    key: cat.id,
                    role: "tab",
                    "aria-selected": activeCategory === cat.id,
                    className: `projects-filter-btn ${activeCategory === cat.id ? "active" : ""}`,
                    onClick: () => setActiveCategory(cat.id)
                  },
                  h(IconCategory, { type: cat.id || cat.icon, size: 16 }),
                  cat.label
                )
              )
            ),

            // ----------------------------------------------------------------
            // DESKTOP SECTION: FEATURED PROJECT SHOWCASE CARD
            // ----------------------------------------------------------------
            activeFeatured &&
              h(
                "div",
                { className: "projects-featured-card" },

                // Left: High Fidelity Laptop & Phone Mockup Presentation
                h(
                  "div",
                  { className: "projects-featured-preview-box" },
                  h(
                    "div",
                    { className: "projects-laptop-frame" },
                    h(
                      "div",
                      { className: "projects-device-topbar" },
                      h("span", { className: "projects-device-dot" }),
                      h("span", { className: "projects-device-dot" }),
                      h("span", { className: "projects-device-dot" })
                    ),
                    h("img", {
                      src: activeFeatured.image || "assets/images/locationkhuji.png",
                      alt: activeFeatured.title,
                      className: "projects-laptop-screen"
                    })
                  ),
                  // Floating Phone Mockup
                  h(
                    "div",
                    { className: "projects-phone-frame" },
                    h("img", {
                      src: activeFeatured.image || "assets/images/locationkhuji.png",
                      alt: `${activeFeatured.title} Mobile`,
                      className: "projects-phone-screen"
                    })
                  )
                ),

                // Right: Content, Badges, Features, Tags & Actions
                h(
                  "div",
                  { className: "projects-featured-content" },

                  // Top Meta Bar
                  h(
                    "div",
                    { className: "projects-featured-top-meta" },
                    h(
                      "span",
                      { className: "projects-featured-badge" },
                      h(IconStar, { size: 12 }),
                      "Featured Project"
                    ),
                    h(
                      "div",
                      { className: "projects-featured-counter" },
                      activeFeatured.number || "01",
                      h("span", { className: "projects-featured-counter-muted" }, ` /0${filteredProjects.length || 5}`)
                    )
                  ),

                  // Title with Orange Accent
                  h(
                    "h3",
                    { className: "projects-featured-title" },
                    activeFeatured.titlePrefix || activeFeatured.title,
                    " ",
                    activeFeatured.titleAccent &&
                      h("span", { className: "projects-title-gradient" }, activeFeatured.titleAccent)
                  ),

                  // Description
                  h("p", { className: "projects-featured-desc" }, activeFeatured.description || activeFeatured.summary),

                  // Key Features 2x2 Grid
                  activeFeatured.keyFeatures && activeFeatured.keyFeatures.length > 0 &&
                    h(
                      "div",
                      { className: "projects-features-grid" },
                      activeFeatured.keyFeatures.map((feat, idx) =>
                        h(
                          "div",
                          { key: idx, className: "projects-feature-item" },
                          h(
                            "div",
                            { className: "projects-feature-icon" },
                            h(IconFeatureBullet, { name: feat.icon, size: 13 })
                          ),
                          h("div", { className: "projects-feature-title" }, feat.title)
                        )
                      )
                    ),

                  // Technology Badges
                  h(
                    "div",
                    { className: "projects-tech-tags-list" },
                    (activeFeatured.tags || []).map((tag, idx) =>
                      h("span", { key: idx, className: "projects-tech-tag" }, tag)
                    )
                  ),

                  // Action Buttons & Nav Chevrons
                  h(
                    "div",
                    { className: "projects-featured-actions-row" },
                    h(
                      "div",
                      { className: "projects-action-buttons-group" },
                      activeFeatured.liveUrl &&
                        h(
                          "a",
                          {
                            href: activeFeatured.liveUrl,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "projects-btn-primary"
                          },
                          "Live Demo",
                          h(IconArrowRight, { size: 15 })
                        ),
                      activeFeatured.githubUrl &&
                        h(
                          "a",
                          {
                            href: activeFeatured.githubUrl,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "projects-btn-secondary"
                          },
                          h(IconGitHub, { size: 16 }),
                          "GitHub"
                        ),
                      h(
                        "button",
                        {
                          type: "button",
                          onClick: () => handleOpenDetails(activeFeatured),
                          className: "projects-btn-secondary"
                        },
                        "View Details",
                        h(IconArrowRight, { size: 14 })
                      )
                    ),

                    // Prev / Next Chevron Arrows
                    filteredProjects.length > 1 &&
                      h(
                        "div",
                        { className: "projects-nav-controls" },
                        h(
                          "button",
                          {
                            type: "button",
                            className: "projects-nav-arrow-btn",
                            onClick: handlePrevFeatured,
                            "aria-label": "Previous featured project"
                          },
                          h(IconChevronLeft, { size: 18 })
                        ),
                        h(
                          "button",
                          {
                            type: "button",
                            className: "projects-nav-arrow-btn",
                            onClick: handleNextFeatured,
                            "aria-label": "Next featured project"
                          },
                          h(IconChevronRight, { size: 18 })
                        )
                      )
                  )
                )
              ),

            // ----------------------------------------------------------------
            // DESKTOP SECTION: LOWER CARDS GRID (02 - 05)
            // ----------------------------------------------------------------
            lowerGridProjects.length > 0 &&
              h(
                "div",
                { className: "projects-grid-cards" },
                lowerGridProjects.map((project, idx) =>
                  h(
                    "div",
                    {
                      key: project.id || idx,
                      className: "projects-grid-card",
                      onClick: () => handleOpenDetails(project)
                    },

                    // Card Meta: Category + Number
                    h(
                      "div",
                      { className: "projects-grid-card-meta" },
                      h(
                        "span",
                        { className: "projects-grid-card-category" },
                        project.shortCategory || "PROJECT"
                      ),
                      h("span", { className: "projects-grid-card-number" }, project.number || `0${idx + 2}`)
                    ),

                    // Thumbnail Box
                    h(
                      "div",
                      { className: "projects-grid-thumbnail-box" },
                      h("img", {
                        src: project.image || "assets/images/locationkhuji.png",
                        alt: project.title,
                        className: "projects-grid-thumbnail-img",
                        loading: "lazy"
                      })
                    ),

                    // Title
                    h("h4", { className: "projects-grid-card-title" }, project.title),

                    // Short Summary
                    h("p", { className: "projects-grid-card-desc" }, project.summary || project.description),

                    // Tech Chips
                    h(
                      "div",
                      { className: "projects-grid-card-tags" },
                      (project.tags || []).slice(0, 4).map((t, tIdx) =>
                        h("span", { key: tIdx, className: "projects-grid-card-tag" }, t)
                      )
                    ),

                    // Actions
                    h(
                      "div",
                      {
                        className: "projects-grid-card-actions",
                        onClick: (e) => e.stopPropagation()
                      },
                      project.liveUrl
                        ? h(
                            "a",
                            {
                              href: project.liveUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "projects-grid-card-btn-primary"
                            },
                            "Live Demo",
                            h(IconArrowRight, { size: 13 })
                          )
                        : h(
                            "button",
                            {
                              type: "button",
                              onClick: () => handleOpenDetails(project),
                              className: "projects-grid-card-btn-primary"
                            },
                            "View Details",
                            h(IconArrowRight, { size: 13 })
                          ),
                      project.githubUrl &&
                        h(
                          "a",
                          {
                            href: project.githubUrl,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            className: "projects-grid-card-btn-ghost",
                            "aria-label": `${project.title} GitHub repository`
                          },
                          h(IconGitHub, { size: 14 }),
                          h(IconExternalArrow, { size: 11 })
                        )
                    )
                  )
                )
              ),

            // ----------------------------------------------------------------
            // MOBILE SECTION: HORIZONTALLY SWIPEABLE CAROUSEL & PEAKING CARDS
            // ----------------------------------------------------------------
            h(
              "div",
              { className: "projects-mobile-section" },

              // Horizontally Swipeable Viewport
              h(
                "div",
                {
                  ref: carouselRef,
                  className: "projects-carousel-viewport",
                  onScroll: handleCarouselScroll
                },
                h(
                  "div",
                  { className: "projects-carousel-track" },
                  filteredProjects.map((project, idx) =>
                    h(
                      "div",
                      {
                        key: project.id || idx,
                        className: `projects-mobile-card ${activeMobileCardIndex === idx ? "active-card" : ""}`,
                        onClick: () => handleOpenDetails(project)
                      },

                      // Card Top Bar: Featured Badge & Heart/Save Icon
                      h(
                        "div",
                        { className: "projects-mobile-card-topbar" },
                        h(
                          "span",
                          { className: "projects-mobile-badge" },
                          h(IconStar, { size: 11 }),
                          project.featured ? "Featured" : project.shortCategory
                        ),
                        h(
                          "button",
                          {
                            type: "button",
                            className: "projects-mobile-heart-btn",
                            onClick: (e) => e.stopPropagation(),
                            "aria-label": "Favorite project"
                          },
                          h(IconHeart, { size: 15 })
                        )
                      ),

                      // Preview Box
                      h(
                        "div",
                        { className: "projects-mobile-preview-box" },
                        h("img", {
                          src: project.image || "assets/images/locationkhuji.png",
                          alt: project.title,
                          className: "projects-mobile-preview-img",
                          loading: "lazy"
                        })
                      ),

                      // Title
                      h(
                        "h3",
                        { className: "projects-mobile-title" },
                        project.titlePrefix || project.title,
                        " ",
                        project.titleAccent &&
                          h("span", { className: "projects-title-gradient" }, project.titleAccent)
                      ),

                      // Description
                      h("p", { className: "projects-mobile-desc" }, project.summary || project.description),

                      // 3 Tech Badges
                      h(
                        "div",
                        { className: "projects-mobile-tags" },
                        (project.tags || []).slice(0, 3).map((t, tIdx) =>
                          h("span", { key: tIdx, className: "projects-mobile-tag" }, t)
                        )
                      ),

                      // Actions Row: Live Demo, GitHub, and Number
                      h(
                        "div",
                        {
                          className: "projects-mobile-actions",
                          onClick: (e) => e.stopPropagation()
                        },
                        project.liveUrl
                          ? h(
                              "a",
                              {
                                href: project.liveUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "projects-btn-primary",
                                style: { padding: "0.5rem 1rem", fontSize: "0.78rem" }
                              },
                              "Live Demo",
                              h(IconArrowRight, { size: 13 })
                            )
                          : h(
                              "button",
                              {
                                type: "button",
                                onClick: () => handleOpenDetails(project),
                                className: "projects-btn-primary",
                                style: { padding: "0.5rem 1rem", fontSize: "0.78rem" }
                              },
                              "Details"
                            ),
                        project.githubUrl &&
                          h(
                            "a",
                            {
                              href: project.githubUrl,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              className: "projects-btn-secondary",
                              style: { padding: "0.5rem 0.85rem", fontSize: "0.78rem" }
                            },
                            h(IconGitHub, { size: 14 }),
                            "GitHub"
                          ),
                        h(
                          "span",
                          { className: "projects-mobile-number" },
                          project.number || `0${idx + 1}`
                        )
                      )
                    )
                  )
                )
              ),

              // Pagination Dots
              h(
                "div",
                { className: "projects-pagination-dots" },
                filteredProjects.map((_, dIdx) =>
                  h("button", {
                    key: dIdx,
                    type: "button",
                    className: `projects-dot ${activeMobileCardIndex === dIdx ? "active" : ""}`,
                    onClick: () => scrollToMobileCard(dIdx),
                    "aria-label": `Scroll to project ${dIdx + 1}`
                  })
                )
              ),

              // Swipe Hint
              h(
                "div",
                { className: "projects-swipe-hint" },
                "👆 Swipe left or right to explore more projects"
              )
            )
          )
    )
  );
}
