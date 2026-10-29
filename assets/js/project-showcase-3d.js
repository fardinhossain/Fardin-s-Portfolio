// ==========================================================================
// FARDIN.AI — ANIMATED 3D ROBOT PROJECT SHOWCASE
// Modular Components:
//   - ANIMATION_STATES (IDLE -> ENTERING -> SCANNING -> PICKING_UP -> DELIVERING -> RELEASING -> EXITING)
//   - FlyingRobot (Three.js articulated white-and-red assistant robot + 3D mini-card)
//   - RobotScene (WebGL scene, lighting, particle trail pool, DOM-to-3D projection)
//   - ProjectDeliveryAnimation (Coordinated cubic Bézier flight & state machine controller)
//   - ProjectCard3D (Interactive 3D project card with spring landing & hover tracking)
//   - ProjectFilters (Category filter tabs & View All toggle)
//   - FeaturedProjects (Complete showcase section)
// ==========================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  GithubIcon,
  ExternalArrowIcon,
  ProjectVisualHeader
} from "./visual-previews.js";

const h = React.createElement;

// --------------------------------------------------------------------------
// 1. STATE MACHINE DEFINITIONS
// --------------------------------------------------------------------------
export const ANIMATION_STATES = {
  IDLE: "IDLE",
  ENTERING: "ENTERING",
  SCANNING: "SCANNING",
  PICKING_UP: "PICKING_UP",
  DELIVERING: "DELIVERING",
  RELEASING: "RELEASING",
  EXITING: "EXITING"
};

const STATE_LABELS = {
  IDLE: "UNIT F-01 · STANDBY",
  ENTERING: "STEP 1 · ENTERING SECTOR",
  SCANNING: "STEP 2 · SCANNING TARGET",
  PICKING_UP: "STEP 3 · GRIPPING MODULE",
  DELIVERING: "STEP 4 · AERIAL DELIVERY",
  RELEASING: "STEP 5 · DROPPING IN PLACE",
  EXITING: "STEP 6 · NEXT VECTOR"
};

// Detect reduced motion preference
function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Detect WebGL support safely
function checkWebGLSupport() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return !!gl;
  } catch (_e) {
    return false;
  }
}

// Cubic Bézier evaluation helper in 3D
function evalCubicBezier3D(p0, p1, p2, p3, t, outVec) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  outVec.set(
    uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
    uuu * p0.z + 3 * uu * t * p1.z + 3 * u * tt * p2.z + ttt * p3.z
  );
  return outVec;
}

// Smooth ease-in-out cubic
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// Smooth ease-out back for playful settle
function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// --------------------------------------------------------------------------
// 2. DYNAMIC 3D MINIATURE CARD TEXTURE GENERATOR
// Renders the actual project's title, category, preview motif & red accent
// onto the 3D miniature card carried by the robot.
// --------------------------------------------------------------------------
function createMiniCardCanvasTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const imgCache = new Map();

  function drawCardFrame(project, loadedImg) {
    if (!ctx) return;
    const title = project ? project.title : "AI Module";
    const category = project ? project.shortCategory : "AI / ML";
    const tags = project && project.tags ? project.tags.slice(0, 3) : ["Python", "PyTorch"];

    // Outer card surface
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark";
    ctx.clearRect(0, 0, 512, 340);
    ctx.fillStyle = isDark ? "#181C26" : "#FFFFFF";
    ctx.fillRect(0, 0, 512, 340);

    // Subtle outer border
    ctx.strokeStyle = isDark ? "#292E3A" : "#CBD5E1";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 332);

    // Top preview window (real project screenshot or dark fallback)
    if (loadedImg && loadedImg.complete && loadedImg.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(18, 18, 476, 152);
      ctx.clip();
      ctx.drawImage(loadedImg, 18, 18, 476, 152);
      ctx.restore();
    } else {
      const grad = ctx.createLinearGradient(16, 16, 496, 175);
      grad.addColorStop(0, "#090D16");
      grad.addColorStop(1, "#1E293B");
      ctx.fillStyle = grad;
      ctx.fillRect(18, 18, 476, 152);

      ctx.fillStyle = "#E11D48";
      ctx.fillRect(42, 92, 220, 14);
      ctx.fillStyle = "#FACC15";
      ctx.fillRect(42, 118, 165, 12);
      ctx.fillStyle = "#10B981";
      ctx.fillRect(42, 140, 260, 10);
    }

    // Category pill inside preview window
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(32, 30, 144, 32);
    ctx.fillStyle = "#090D16";
    ctx.font = "bold 17px sans-serif";
    ctx.fillText(category.toUpperCase(), 42, 52);

    // Red live indicator dot
    ctx.beginPath();
    ctx.arc(462, 46, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#E11D48";
    ctx.fill();

    // Project Title on white body
    ctx.fillStyle = "#090D16";
    ctx.font = "900 29px sans-serif";
    const clippedTitle = title.length > 24 ? title.slice(0, 22) + "…" : title;
    ctx.fillText(clippedTitle, 28, 222);

    // Red accent underline bar
    ctx.fillStyle = "#E11D48";
    ctx.fillRect(28, 238, 86, 6);

    // Technology chips row
    let chipX = 28;
    ctx.font = "bold 16px monospace";
    for (let i = 0; i < tags.length; i++) {
      const t = tags[i];
      const w = Math.min(145, ctx.measureText(t).width + 26);
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(chipX, 264, w, 36);
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 2;
      ctx.strokeRect(chipX, 264, w, 36);
      ctx.fillStyle = "#334155";
      ctx.fillText(t, chipX + 13, 288);
      chipX += w + 12;
    }

    texture.needsUpdate = true;
  }

  function updateProjectCard(project) {
    if (project && project.image && typeof Image !== "undefined") {
      if (imgCache.has(project.image)) {
        drawCardFrame(project, imgCache.get(project.image));
        return;
      }
      drawCardFrame(project, null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgCache.set(project.image, img);
        drawCardFrame(project, img);
      };
      img.src = project.image;
      return;
    }
    drawCardFrame(project, null);
  }

  updateProjectCard(null);
  return { texture, updateProjectCard };
}

// --------------------------------------------------------------------------
// 3. FLYING ROBOT 3D MODEL BUILDER (`FlyingRobot`)
// Builds the adorable glossy white assistant robot with expressive red LED
// eyes, articulated arms/grippers, hover-legs, thrusters, scanning cone,
// and suspended 3D miniature project card.
// --------------------------------------------------------------------------
export function createFlyingRobot3D() {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Shared materials matching fardin.ai white/black/red aesthetic
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

  const darkJointMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.4
  });

  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x090d16,
    roughness: 0.08,
    metalness: 0.2,
    clearcoat: 1.0
  });

  const redLedMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48
  });

  const brightCoreMat = new THREE.MeshBasicMaterial({
    color: 0xff4d6d
  });

  const yellowAccentMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15
  });

  // --- A. HEAD GROUP ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.56, 0);
  bodyPivot.add(headGroup);

  // Main rounded porcelain head shell
  const headGeo = new THREE.SphereGeometry(0.46, 32, 24);
  headGeo.scale(1.18, 0.92, 0.96);
  const headMesh = new THREE.Mesh(headGeo, whiteShellMat);
  headGroup.add(headMesh);

  // Curved obsidian visor plate on front of head
  const visorGeo = new THREE.SphereGeometry(0.43, 28, 20);
  visorGeo.scale(1.06, 0.72, 0.65);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, -0.02, 0.19);
  headGroup.add(visorMesh);

  // Expressive Red LED Eyes (Left & Right)
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

  // Tiny white/pink specular eye highlights for adorable expression
  const glintGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const leftGlint = new THREE.Mesh(glintGeo, glintMat);
  leftGlint.position.set(-0.125, 0.022, 0.045);
  eyeGroup.add(leftGlint);

  const rightGlint = new THREE.Mesh(glintGeo, glintMat);
  rightGlint.position.set(0.165, 0.022, 0.045);
  eyeGroup.add(rightGlint);

  // Side Ear Pods + Red Rings
  const earGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 20);
  earGeo.rotateZ(Math.PI * 0.5);
  const leftEar = new THREE.Mesh(earGeo, softGrayMat);
  leftEar.position.set(-0.54, 0, 0);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, softGrayMat);
  rightEar.position.set(0.54, 0, 0);
  headGroup.add(rightEar);

  const earRingGeo = new THREE.TorusGeometry(0.09, 0.018, 10, 24);
  earRingGeo.rotateY(Math.PI * 0.5);
  const leftEarRing = new THREE.Mesh(earRingGeo, redLedMat);
  leftEarRing.position.set(-0.6, 0, 0);
  headGroup.add(leftEarRing);

  const rightEarRing = new THREE.Mesh(earRingGeo, redLedMat);
  rightEarRing.position.set(0.6, 0, 0);
  headGroup.add(rightEarRing);

  // Top Antenna + Glowing Red Beacon Tip
  const antennaStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.032, 0.24, 12),
    softGrayMat
  );
  antennaStem.position.set(0, 0.48, 0);
  headGroup.add(antennaStem);

  const antennaTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.068, 16, 16),
    redLedMat
  );
  antennaTip.position.set(0, 0.62, 0);
  headGroup.add(antennaTip);

  // --- B. TORSO / CHASSIS GROUP ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, -0.08, 0);
  bodyPivot.add(torsoGroup);

  const torsoGeo = new THREE.SphereGeometry(0.38, 28, 22);
  torsoGeo.scale(1.0, 1.08, 0.88);
  const torsoMesh = new THREE.Mesh(torsoGeo, whiteShellMat);
  torsoGroup.add(torsoMesh);

  // Collar ring
  const collarRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.025, 10, 28).rotateX(Math.PI * 0.5),
    darkJointMat
  );
  collarRing.position.set(0, 0.34, 0);
  torsoGroup.add(collarRing);

  // Chest AI Core Badge (Glowing Red Ring + Center)
  const chestCoreRing = new THREE.Mesh(
    new THREE.RingGeometry(0.065, 0.105, 24),
    redLedMat
  );
  chestCoreRing.position.set(0, 0.05, 0.34);
  torsoGroup.add(chestCoreRing);

  const chestCoreCenter = new THREE.Mesh(
    new THREE.CircleGeometry(0.05, 20),
    brightCoreMat
  );
  chestCoreCenter.position.set(0, 0.05, 0.342);
  torsoGroup.add(chestCoreCenter);

  // --- C. ARTICULATED ARMS & MECHANICAL GRIPPERS ---
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.42, 0.12, 0.05);
  torsoGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.42, 0.12, 0.05);
  torsoGroup.add(rightArmGroup);

  function buildArmAndGripper(isLeft) {
    const armRoot = new THREE.Group();
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 14), darkJointMat);
    armRoot.add(shoulder);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.055, 0.22, 8, 12),
      whiteShellMat
    );
    upperArm.position.set(isLeft ? -0.04 : 0.04, -0.16, 0.04);
    upperArm.rotation.z = isLeft ? 0.18 : -0.18;
    armRoot.add(upperArm);

    const gripperPivot = new THREE.Group();
    gripperPivot.position.set(isLeft ? -0.06 : 0.06, -0.32, 0.08);
    armRoot.add(gripperPivot);

    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12), darkJointMat);
    gripperPivot.add(wrist);

    // Two mechanical pincer fingers
    const clawGeo = new THREE.BoxGeometry(0.028, 0.12, 0.045);
    const outerClaw = new THREE.Mesh(clawGeo, redLedMat);
    outerClaw.position.set(isLeft ? -0.035 : 0.035, -0.06, 0);
    gripperPivot.add(outerClaw);

    const innerClaw = new THREE.Mesh(clawGeo, darkJointMat);
    innerClaw.position.set(isLeft ? 0.025 : -0.025, -0.06, 0);
    gripperPivot.add(innerClaw);

    return { armRoot, gripperPivot, outerClaw, innerClaw };
  }

  const leftArmParts = buildArmAndGripper(true);
  leftArmGroup.add(leftArmParts.armRoot);

  const rightArmParts = buildArmAndGripper(false);
  rightArmGroup.add(rightArmParts.armRoot);

  // --- D. ARTICULATED HOVER-LEGS & DUAL THRUSTERS ---
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.17, -0.4, 0);
  torsoGroup.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.17, -0.4, 0);
  torsoGroup.add(rightLegGroup);

  function buildHoverLeg() {
    const leg = new THREE.Group();
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), darkJointMat);
    leg.add(hip);

    const boot = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.058, 0.11, 8, 12),
      whiteShellMat
    );
    boot.position.set(0, -0.1, 0);
    leg.add(boot);

    const soleGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.07, 0.04, 12),
      redLedMat
    );
    soleGlow.position.set(0, -0.19, 0);
    leg.add(soleGlow);
    return leg;
  }

  leftLegGroup.add(buildHoverLeg());
  rightLegGroup.add(buildHoverLeg());

  // Central Under-Chassis Thruster Plume + Antigravity Ring
  const thrusterGroup = new THREE.Group();
  thrusterGroup.position.set(0, -0.46, 0);
  torsoGroup.add(thrusterGroup);

  const thrusterConeGeo = new THREE.ConeGeometry(0.16, 0.42, 20, 1, true);
  thrusterConeGeo.rotateX(Math.PI);
  const thrusterMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide
  });
  const thrusterFlame = new THREE.Mesh(thrusterConeGeo, thrusterMat);
  thrusterFlame.position.set(0, -0.18, 0);
  thrusterGroup.add(thrusterFlame);

  const innerCoreCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.24, 16).rotateX(Math.PI),
    yellowAccentMat
  );
  innerCoreCone.position.set(0, -0.1, 0);
  thrusterGroup.add(innerCoreCone);

  const antigravRingGeo = new THREE.RingGeometry(0.22, 0.27, 28);
  antigravRingGeo.rotateX(Math.PI * 0.5);
  const antigravRingMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const antigravRing = new THREE.Mesh(antigravRingGeo, antigravRingMat);
  antigravRing.position.set(0, -0.25, 0);
  thrusterGroup.add(antigravRing);

  // --- E. CONICAL RED SCANNING BEAM (Active in SCANNING state) ---
  const scanBeamGroup = new THREE.Group();
  scanBeamGroup.position.set(0, 0.52, 0.44);
  scanBeamGroup.visible = false;
  bodyPivot.add(scanBeamGroup);

  const scanConeGeo = new THREE.ConeGeometry(0.68, 1.65, 28, 1, true);
  scanConeGeo.translate(0, -0.82, 0);
  scanConeGeo.rotateX(-Math.PI * 0.35);
  const scanBeamMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const scanConeMesh = new THREE.Mesh(scanConeGeo, scanBeamMat);
  scanBeamGroup.add(scanConeMesh);

  const scanReticleGeo = new THREE.RingGeometry(0.45, 0.52, 32);
  const scanReticleMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  });
  const scanReticle = new THREE.Mesh(scanReticleGeo, scanReticleMat);
  scanReticle.position.set(0, -0.95, 1.15);
  scanReticle.rotation.x = Math.PI * 0.22;
  scanBeamGroup.add(scanReticle);

  // --- F. CARRIED 3D MINIATURE PROJECT CARD + TRACTOR BEAM ---
  const cargoPivot = new THREE.Group();
  cargoPivot.position.set(0, -0.78, 0.14);
  cargoPivot.visible = false;
  bodyPivot.add(cargoPivot);

  const { texture: miniCardTexture, updateProjectCard } = createMiniCardCanvasTexture();

  // Miniature 3D card mesh with white sides and dynamic front project texture
  const cardMaterials = [
    whiteShellMat, // right
    whiteShellMat, // left
    whiteShellMat, // top
    whiteShellMat, // bottom
    new THREE.MeshBasicMaterial({ map: miniCardTexture }), // front face
    whiteShellMat // back face
  ];
  const miniCardGeo = new THREE.BoxGeometry(1.48, 0.96, 0.065);
  const miniCardMesh = new THREE.Mesh(miniCardGeo, cardMaterials);
  miniCardMesh.position.set(0, -0.42, 0);
  cargoPivot.add(miniCardMesh);

  // Soft 3D drop shadow plane beneath the miniature card
  const miniShadowGeo = new THREE.PlaneGeometry(1.55, 0.32);
  miniShadowGeo.rotateX(-Math.PI * 0.5);
  const miniShadowMat = new THREE.MeshBasicMaterial({
    color: 0x090d16,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });
  const miniShadowMesh = new THREE.Mesh(miniShadowGeo, miniShadowMat);
  miniShadowMesh.position.set(0, -1.04, 0);
  cargoPivot.add(miniShadowMesh);

  // Tractor beam tether rings connecting robot grippers to the card
  const tractorRingGeo = new THREE.TorusGeometry(0.32, 0.015, 8, 28);
  tractorRingGeo.rotateX(Math.PI * 0.5);
  const tractorRingMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.55
  });
  const tractorRing = new THREE.Mesh(tractorRingGeo, tractorRingMat);
  tractorRing.position.set(0, -0.02, 0);
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
    updateProjectCard
  };
}

// --------------------------------------------------------------------------
// 4. 3D ROBOT SCENE & DELIVERY ANIMATION CONTROLLER (`RobotScene`)
// Renders the Three.js scene, particle trail, lighting, and orchestrates
// the 6-step delivery state machine across all projects.
// --------------------------------------------------------------------------
export function RobotScene({
  stageRef,
  perchRef,
  slotRefsMap,
  projects,
  hoveredProjectId,
  summonTargetId,
  deliveryRunId,
  skipRequested,
  onStateChange,
  onProjectLanded,
  onAllDelivered
}) {
  const mountRef = useRef(null);
  const hudRef = useRef(null);
  const controllerRef = useRef(null);

  // Keep latest callbacks & props in refs so the RAF loop never uses stale closures
  const latestPropsRef = useRef({
    projects,
    hoveredProjectId,
    summonTargetId,
    onStateChange,
    onProjectLanded,
    onAllDelivered
  });
  useEffect(() => {
    latestPropsRef.current = {
      projects,
      hoveredProjectId,
      summonTargetId,
      onStateChange,
      onProjectLanded,
      onAllDelivered
    };
  }, [projects, hoveredProjectId, summonTargetId, onStateChange, onProjectLanded, onAllDelivered]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !checkWebGLSupport()) return;

    const reducedMotion = prefersReducedMotion();
    const isMobile = window.innerWidth < 768;

    const width = Math.max(320, container.clientWidth);
    const height = Math.max(420, container.clientHeight);

    const scene = new THREE.Scene();
    const cameraFov = 36;
    const cameraZ = 14;
    const camera = new THREE.PerspectiveCamera(cameraFov, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZ);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (_err) {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.85));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Studio Lighting for Glossy White Porcelain + Red Accents
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.65);
    keyLight.position.set(6, 10, 9);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffe4e6, 0.95);
    rimLight.position.set(-7, 5, -4);
    scene.add(rimLight);

    const botPointLight = new THREE.PointLight(0xe11d48, 0.9, 6);
    scene.add(botPointLight);

    // Create the 3D Flying Robot Assistant
    const robot = createFlyingRobot3D();
    scene.add(robot.root);

    // Lightweight Red Particle Trail Pool
    const maxParticles = isMobile ? 18 : 42;
    const particleGeo = new THREE.SphereGeometry(0.055, 8, 8);
    const particles = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    for (let i = 0; i < maxParticles; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xfacc15 : 0xe11d48,
        transparent: true,
        opacity: 0
      });
      const pMesh = new THREE.Mesh(particleGeo, pMat);
      pMesh.visible = false;
      particleGroup.add(pMesh);
      particles.push({
        mesh: pMesh,
        mat: pMat,
        life: 0,
        maxLife: 0.55,
        vel: new THREE.Vector3()
      });
    }

    let particleCursor = 0;
    function spawnTrailParticle(pos, speedFactor = 1) {
      if (reducedMotion) return;
      const p = particles[particleCursor];
      particleCursor = (particleCursor + 1) % maxParticles;
      p.life = p.maxLife;
      p.mesh.visible = true;
      p.mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.18,
        pos.y - 0.38 * baseScale + (Math.random() - 0.5) * 0.1,
        pos.z - 0.1
      );
      p.mesh.scale.setScalar(0.65 + Math.random() * 0.55 * speedFactor);
      p.vel.set(
        (Math.random() - 0.5) * 0.45,
        -0.65 - Math.random() * 0.55,
        (Math.random() - 0.5) * 0.2
      );
    }

    // Coordinate conversion helpers between DOM stage pixels and 3D world space (z = 0)
    function getVisibleBoundsAtZ0() {
      const cW = Math.max(320, container.clientWidth);
      const cH = Math.max(420, container.clientHeight);
      const vH = 2 * Math.tan((cameraFov * Math.PI) / 360) * cameraZ;
      const vW = vH * (cW / cH);
      const pxPerUnit = cH / vH;
      return { cW, cH, vW, vH, pxPerUnit };
    }

    function computePixelLockedScale() {
      const { cW, pxPerUnit } = getVisibleBoundsAtZ0();
      // Robot unscaled height is ~1.85 units; lock visual height to ~82px desktop, ~54px mobile
      const desiredUnitPx = cW < 768 ? 29 : 45;
      return desiredUnitPx / Math.max(20, pxPerUnit);
    }

    let baseScale = computePixelLockedScale();
    robot.root.scale.setScalar(baseScale);

    function domPointToWorld(px, py) {
      const { cW, cH, vW, vH } = getVisibleBoundsAtZ0();
      const wx = (px / cW - 0.5) * vW;
      const wy = (0.5 - py / cH) * vH;
      return new THREE.Vector3(wx, wy, 0);
    }

    function worldToDomPoint(worldPos) {
      const { cW, cH } = getVisibleBoundsAtZ0();
      const projected = worldPos.clone().project(camera);
      const px = (projected.x * 0.5 + 0.5) * cW;
      const py = (-projected.y * 0.5 + 0.5) * cH;
      return { px, py };
    }

    function getDockPerchWorldPos() {
      const containerRect = container.getBoundingClientRect();
      const perchEl = perchRef && perchRef.current;
      if (perchEl && containerRect.width > 0 && containerRect.height > 0) {
        const pRect = perchEl.getBoundingClientRect();
        const cx = pRect.left - containerRect.left + pRect.width * 0.5;
        const cy = pRect.top - containerRect.top + pRect.height * 0.48;
        const worldPerch = domPointToWorld(cx, cy);
        worldPerch.z = 0;
        return worldPerch;
      }
      const { vW, vH } = getVisibleBoundsAtZ0();
      return new THREE.Vector3(-vW * 0.42, vH * 0.45, 0.2);
    }

    function getCardSlotWorldPos(projectId, index, total) {
      const slotEl = slotRefsMap.current.get(projectId);
      const containerRect = container.getBoundingClientRect();
      if (slotEl && containerRect.width > 0 && containerRect.height > 0) {
        const rect = slotEl.getBoundingClientRect();
        const centerX = rect.left - containerRect.left + rect.width * 0.5;
        const dropY = rect.top - containerRect.top + Math.min(110, rect.height * 0.34);
        return domPointToWorld(centerX, dropY);
      }
      // Fallback grid estimate if DOM rect not yet measured
      const { vW, vH } = getVisibleBoundsAtZ0();
      const cols = isMobile ? 1 : 3;
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = isMobile ? 0 : (col - 1) * (vW * 0.28);
      const y = vH * 0.16 - row * (vH * (isMobile ? 0.22 : 0.34));
      return new THREE.Vector3(x, y, 0);
    }

    // Distinct entry directions and scan waypoints anchored around targetPos.y
    function getFlightVectorsForIndex(index, targetPos) {
      const { vW, vH } = getVisibleBoundsAtZ0();
      const pattern = index % 6;
      const scanLift = 1.05 * baseScale;
      const entryLift = 1.65 * baseScale;
      let startPos;
      let scanPos;

      if (pattern === 0) {
        // 1. Swoop in from Top-Left
        startPos = new THREE.Vector3(-vW * 0.56, targetPos.y + entryLift, 1.8);
        scanPos = new THREE.Vector3(targetPos.x - vW * 0.12, targetPos.y + scanLift, 1.1);
      } else if (pattern === 1) {
        // 2. Bank in from Top-Right
        startPos = new THREE.Vector3(vW * 0.56, targetPos.y + entryLift, 1.8);
        scanPos = new THREE.Vector3(targetPos.x + vW * 0.12, targetPos.y + scanLift, 1.1);
      } else if (pattern === 2) {
        // 3. Arc in from Far-Right flank
        startPos = new THREE.Vector3(vW * 0.6, targetPos.y + scanLift * 0.6, 2.0);
        scanPos = new THREE.Vector3(targetPos.x - vW * 0.08, targetPos.y + scanLift, 1.2);
      } else if (pattern === 3) {
        // 4. Climb in from Left flank
        startPos = new THREE.Vector3(-vW * 0.6, targetPos.y + scanLift * 0.6, 1.9);
        scanPos = new THREE.Vector3(targetPos.x + vW * 0.1, targetPos.y + scanLift, 1.2);
      } else if (pattern === 4) {
        // 5. Dive in from High Center Arc
        startPos = new THREE.Vector3(0.0, targetPos.y + entryLift * 1.15, 2.2);
        scanPos = new THREE.Vector3(targetPos.x, targetPos.y + scanLift, 1.25);
      } else {
        // 6. Sweep in from Right-Upper diagonal
        startPos = new THREE.Vector3(vW * 0.58, targetPos.y + entryLift, 1.9);
        scanPos = new THREE.Vector3(targetPos.x - vW * 0.1, targetPos.y + scanLift, 1.15);
      }

      // Control points for smooth cubic Bézier curves
      const arcLift = Math.min(0.65, vH * 0.09);
      const enterC1 = new THREE.Vector3(
        (startPos.x + scanPos.x) * 0.5,
        Math.max(startPos.y, scanPos.y) + arcLift,
        1.2
      );
      const enterC2 = new THREE.Vector3(
        scanPos.x + (startPos.x > scanPos.x ? 0.35 : -0.35),
        scanPos.y + arcLift * 0.5,
        0.9
      );

      // Delivery path from scanPos to targetPos (hovering slightly above the card)
      const hoverOffset = 0.65 * baseScale;
      const dropHoverPos = new THREE.Vector3(targetPos.x, targetPos.y + hoverOffset, 0.45);
      const deliverC1 = new THREE.Vector3(
        scanPos.x + (dropHoverPos.x - scanPos.x) * 0.35,
        scanPos.y + arcLift * 0.6,
        0.95
      );
      const deliverC2 = new THREE.Vector3(
        dropHoverPos.x - (dropHoverPos.x - scanPos.x) * 0.2,
        dropHoverPos.y + arcLift * 0.7,
        0.7
      );

      return {
        startPos,
        enterC1,
        enterC2,
        scanPos,
        deliverC1,
        deliverC2,
        dropHoverPos
      };
    }

    // State Machine Memory
    const sm = {
      state: ANIMATION_STATES.IDLE,
      projectIndex: 0,
      phaseElapsed: 0,
      phaseDuration: 0.4,
      vectors: null,
      currentPos: getDockPerchWorldPos(),
      prevPos: getDockPerchWorldPos(),
      velocity: new THREE.Vector3(),
      exitStartPos: getDockPerchWorldPos(),
      dockPos: getDockPerchWorldPos(),
      hudText: "",
      hudVisible: false,
      celebrationTimer: 0,
      blinkTimer: 0
    };

    robot.root.position.copy(sm.currentPos);

    function notifyState(newState, activeIdx, activeProject, hudLabel) {
      sm.state = newState;
      sm.hudText = hudLabel || "";
      sm.hudVisible = Boolean(hudLabel);
      if (latestPropsRef.current.onStateChange) {
        latestPropsRef.current.onStateChange({
          state: newState,
          stateLabel: STATE_LABELS[newState] || newState,
          projectIndex: activeIdx,
          project: activeProject || null
        });
      }
    }

    function beginProjectDelivery(index) {
      const list = latestPropsRef.current.projects || [];
      if (index >= list.length) {
        // All projects delivered -> transition to EXITING back to dock perch
        sm.exitStartPos.copy(sm.currentPos);
        sm.dockPos.copy(getDockPerchWorldPos());
        sm.phaseElapsed = 0;
        sm.phaseDuration = 0.52;
        robot.cargoPivot.visible = false;
        robot.scanBeamGroup.visible = false;
        notifyState(ANIMATION_STATES.EXITING, index, null, "MISSION COMPLETE · DOCKING");
        return;
      }

      const proj = list[index];
      sm.projectIndex = index;
      const slotTarget = getCardSlotWorldPos(proj.id, index, list.length);
      sm.vectors = getFlightVectorsForIndex(index, slotTarget);

      // Update the 3D miniature card texture with this project's real title & category
      robot.updateProjectCard(proj);
      robot.cargoPivot.visible = false;
      robot.scanBeamGroup.visible = false;

      // If index > 0, smoothly fly from current release point or edge
      if (index > 0) {
        sm.vectors.startPos.lerp(sm.currentPos, 0.35);
      }

      sm.phaseElapsed = 0;
      sm.phaseDuration = isMobile ? 0.24 : 0.26;
      notifyState(
        ANIMATION_STATES.ENTERING,
        index,
        proj,
        `INBOUND [${index + 1}/${list.length}] · ${proj.title}`
      );
    }

    function startFullSequence() {
      const list = latestPropsRef.current.projects || [];
      if (reducedMotion || list.length === 0) {
        list.forEach((p) => {
          if (latestPropsRef.current.onProjectLanded) {
            latestPropsRef.current.onProjectLanded(p.id);
          }
        });
        if (latestPropsRef.current.onAllDelivered) {
          latestPropsRef.current.onAllDelivered();
        }
        sm.currentPos.copy(getDockPerchWorldPos());
        robot.root.position.copy(sm.currentPos);
        notifyState(ANIMATION_STATES.IDLE, 0, null, "");
        return;
      }
      beginProjectDelivery(0);
    }

    function skipToCompleted() {
      const list = latestPropsRef.current.projects || [];
      list.forEach((p) => {
        if (latestPropsRef.current.onProjectLanded) {
          latestPropsRef.current.onProjectLanded(p.id);
        }
      });
      if (latestPropsRef.current.onAllDelivered) {
        latestPropsRef.current.onAllDelivered();
      }
      robot.cargoPivot.visible = false;
      robot.scanBeamGroup.visible = false;
      sm.exitStartPos.copy(sm.currentPos);
      sm.dockPos.copy(getDockPerchWorldPos());
      sm.phaseElapsed = 0;
      sm.phaseDuration = 0.38;
      notifyState(ANIMATION_STATES.EXITING, list.length, null, "FAST-FORWARD · DOCKING");
    }

    controllerRef.current = {
      startFullSequence,
      skipToCompleted,
      summonWave: () => {
        sm.celebrationTimer = 1.1;
      }
    };

    // IntersectionObserver & Page Visibility to pause rendering when off-screen
    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.02 }
    );
    io.observe(container);

    const onResize = () => {
      if (!container) return;
      const w = Math.max(320, container.clientWidth);
      const h = Math.max(420, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      baseScale = computePixelLockedScale();
      robot.root.scale.setScalar(baseScale);
      if (sm.state === ANIMATION_STATES.IDLE) {
        sm.currentPos.copy(getDockPerchWorldPos());
        robot.root.position.copy(sm.currentPos);
      }
    };
    window.addEventListener("resize", onResize);

    // Main Animation Loop
    let rafId = null;
    let lastTime = performance.now();
    const tempPos = new THREE.Vector3();

    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!isVisible || document.hidden) return;

      const tSec = now * 0.001;
      sm.prevPos.copy(sm.currentPos);

      const list = latestPropsRef.current.projects || [];
      const activeProj = list[sm.projectIndex] || null;

      // ====================================================================
      // STATE MACHINE UPDATE
      // ====================================================================
      if (sm.state === ANIMATION_STATES.ENTERING && sm.vectors) {
        sm.phaseElapsed += dt;
        const u = Math.min(1, sm.phaseElapsed / sm.phaseDuration);
        const eased = easeInOutCubic(u);
        evalCubicBezier3D(
          sm.vectors.startPos,
          sm.vectors.enterC1,
          sm.vectors.enterC2,
          sm.vectors.scanPos,
          eased,
          sm.currentPos
        );
        spawnTrailParticle(sm.currentPos, 1.3);

        // Open grippers in preparation
        robot.leftArmParts.gripperPivot.rotation.z = 0.25;
        robot.rightArmParts.gripperPivot.rotation.z = -0.25;

        if (u >= 1) {
          sm.phaseElapsed = 0;
          sm.phaseDuration = isMobile ? 0.16 : 0.18;
          robot.scanBeamGroup.visible = true;
          notifyState(
            ANIMATION_STATES.SCANNING,
            sm.projectIndex,
            activeProj,
            activeProj ? `SCANNING · ${activeProj.title}` : "SCANNING TARGET"
          );
        }
      } else if (sm.state === ANIMATION_STATES.SCANNING && sm.vectors) {
        sm.phaseElapsed += dt;
        const u = Math.min(1, sm.phaseElapsed / sm.phaseDuration);

        // Hover and sweep scanning beam
        sm.currentPos.copy(sm.vectors.scanPos);
        sm.currentPos.y += Math.sin(u * Math.PI * 2) * 0.08;
        robot.scanBeamGroup.rotation.y = Math.sin(u * Math.PI * 2) * 0.38;
        robot.scanReticle.rotation.z += dt * 5;
        robot.leftEye.scale.set(1.2, 1.35, 1.2);
        robot.rightEye.scale.set(1.2, 1.35, 1.2);

        if (u >= 1) {
          robot.scanBeamGroup.visible = false;
          robot.leftEye.scale.set(1, 1, 1);
          robot.rightEye.scale.set(1, 1, 1);
          sm.phaseElapsed = 0;
          sm.phaseDuration = isMobile ? 0.15 : 0.17;
          robot.cargoPivot.visible = true;
          robot.cargoPivot.scale.setScalar(0.2);
          notifyState(
            ANIMATION_STATES.PICKING_UP,
            sm.projectIndex,
            activeProj,
            activeProj ? `LOCKED ON · ${activeProj.title}` : "ATTACHING MODULE"
          );
        }
      } else if (sm.state === ANIMATION_STATES.PICKING_UP && sm.vectors) {
        sm.phaseElapsed += dt;
        const u = Math.min(1, sm.phaseElapsed / sm.phaseDuration);
        const popScale = Math.max(0.1, easeOutBack(u));
        robot.cargoPivot.scale.setScalar(popScale);

        // Grippers clamp inward onto the miniature project card
        robot.leftArmGroup.rotation.x = -0.35 * u;
        robot.rightArmGroup.rotation.x = -0.35 * u;
        robot.leftArmParts.gripperPivot.rotation.z = 0.25 * (1 - u) - 0.12 * u;
        robot.rightArmParts.gripperPivot.rotation.z = -0.25 * (1 - u) + 0.12 * u;

        if (u >= 1) {
          // Re-measure live DOM card slot right before flying to it
          if (activeProj) {
            const freshSlot = getCardSlotWorldPos(activeProj.id, sm.projectIndex, list.length);
            sm.vectors.dropHoverPos.set(freshSlot.x, freshSlot.y + 0.65 * baseScale, 0.45);
          }
          sm.phaseElapsed = 0;
          sm.phaseDuration = isMobile ? 0.26 : 0.31;
          notifyState(
            ANIMATION_STATES.DELIVERING,
            sm.projectIndex,
            activeProj,
            activeProj
              ? `DELIVERING [${sm.projectIndex + 1}/${list.length}] · ${activeProj.title}`
              : "DELIVERING MODULE"
          );
        }
      } else if (sm.state === ANIMATION_STATES.DELIVERING && sm.vectors) {
        sm.phaseElapsed += dt;
        const u = Math.min(1, sm.phaseElapsed / sm.phaseDuration);
        const eased = easeInOutCubic(u);

        evalCubicBezier3D(
          sm.vectors.scanPos,
          sm.vectors.deliverC1,
          sm.vectors.deliverC2,
          sm.vectors.dropHoverPos,
          eased,
          sm.currentPos
        );
        spawnTrailParticle(sm.currentPos, 1.45);

        // Natural pendulum sway on the suspended 3D miniature card
        const vx = (sm.currentPos.x - sm.prevPos.x) / dt;
        robot.cargoPivot.rotation.z = THREE.MathUtils.clamp(-vx * 0.045, -0.32, 0.32);
        robot.cargoPivot.rotation.x = Math.sin(u * Math.PI) * 0.14;
        robot.tractorRing.scale.setScalar(0.9 + Math.sin(tSec * 18) * 0.12);

        if (u >= 1) {
          sm.phaseElapsed = 0;
          sm.phaseDuration = isMobile ? 0.15 : 0.18;
          notifyState(
            ANIMATION_STATES.RELEASING,
            sm.projectIndex,
            activeProj,
            activeProj ? `DEPLOYED · ${activeProj.title}` : "DEPLOYING"
          );
          // Trigger the real DOM ProjectCard3D spring landing right as the robot releases it!
          if (activeProj && latestPropsRef.current.onProjectLanded) {
            latestPropsRef.current.onProjectLanded(activeProj.id);
          }
        }
      } else if (sm.state === ANIMATION_STATES.RELEASING && sm.vectors) {
        sm.phaseElapsed += dt;
        const u = Math.min(1, sm.phaseElapsed / sm.phaseDuration);

        // Open grippers and drop miniature card downward into the DOM card slot
        robot.leftArmParts.gripperPivot.rotation.z = 0.35 * u;
        robot.rightArmParts.gripperPivot.rotation.z = -0.35 * u;
        robot.cargoPivot.position.y = -0.78 - u * 0.65;
        robot.cargoPivot.scale.setScalar(Math.max(0.01, 1 - u * 0.92));

        // Happy squint on LED eyes
        robot.leftEye.scale.set(1.15, 0.55, 1);
        robot.rightEye.scale.set(1.15, 0.55, 1);

        if (u >= 1) {
          robot.cargoPivot.visible = false;
          robot.cargoPivot.position.y = -0.78;
          robot.cargoPivot.scale.setScalar(1);
          robot.leftEye.scale.set(1, 1, 1);
          robot.rightEye.scale.set(1, 1, 1);
          // Move to next project!
          beginProjectDelivery(sm.projectIndex + 1);
        }
      } else if (sm.state === ANIMATION_STATES.EXITING) {
        sm.phaseElapsed += dt;
        const u = Math.min(1, sm.phaseElapsed / sm.phaseDuration);
        const eased = easeInOutCubic(u);
        sm.dockPos.copy(getDockPerchWorldPos());
        sm.currentPos.lerpVectors(sm.exitStartPos, sm.dockPos, eased);
        sm.currentPos.y += Math.sin(u * Math.PI) * 0.65;
        spawnTrailParticle(sm.currentPos, 0.9);

        if (u >= 1) {
          if (latestPropsRef.current.onAllDelivered) {
            latestPropsRef.current.onAllDelivered();
          }
          notifyState(ANIMATION_STATES.IDLE, 0, null, "");
        }
      } else {
        // ==================================================================
        // IDLE / INTERACTIVE GUIDE MODE
        // Robot hovers at its holopad dock or glides to inspect a hovered card!
        // ==================================================================
        baseScale = computePixelLockedScale();
        robot.root.scale.setScalar(baseScale);

        const hoveredId =
          latestPropsRef.current.summonTargetId || latestPropsRef.current.hoveredProjectId;
        let targetIdlePos = getDockPerchWorldPos();

        if (hoveredId && !isMobile) {
          const idx = list.findIndex((p) => p.id === hoveredId);
          if (idx !== -1) {
            const cardWorld = getCardSlotWorldPos(hoveredId, idx, list.length);
            targetIdlePos = new THREE.Vector3(
              cardWorld.x + (idx % 2 === 0 ? 0.65 * baseScale : -0.65 * baseScale),
              cardWorld.y + 0.55 * baseScale,
              0.4
            );
          }
        }

        tempPos.copy(targetIdlePos);
        tempPos.y += Math.sin(tSec * 2.8) * 0.08 * baseScale;
        tempPos.x += Math.cos(tSec * 1.7) * 0.03 * baseScale;
        sm.currentPos.lerp(tempPos, Math.min(1, dt * 5.0));

        // Periodic natural eye blink in IDLE
        sm.blinkTimer += dt;
        if (sm.blinkTimer > 3.4) {
          const blinkPhase = (sm.blinkTimer - 3.4) / 0.16;
          if (blinkPhase < 1) {
            const sy = Math.max(0.12, Math.abs(Math.cos(blinkPhase * Math.PI)));
            robot.leftEye.scale.y = sy;
            robot.rightEye.scale.y = sy;
          } else {
            robot.leftEye.scale.y = 1;
            robot.rightEye.scale.y = 1;
            sm.blinkTimer = 0;
          }
        }

        // Playful wave / spin if summoned
        if (sm.celebrationTimer > 0) {
          sm.celebrationTimer = Math.max(0, sm.celebrationTimer - dt);
          robot.rightArmGroup.rotation.z =
            -2.2 + Math.sin(tSec * 18) * 0.45;
          robot.headGroup.rotation.z = Math.sin(tSec * 12) * 0.18;
        } else {
          robot.rightArmGroup.rotation.z = THREE.MathUtils.lerp(
            robot.rightArmGroup.rotation.z,
            0,
            dt * 6
          );
          robot.headGroup.rotation.z = THREE.MathUtils.lerp(
            robot.headGroup.rotation.z,
            0,
            dt * 6
          );
        }
      }

      // Apply robot position and natural banking/tilt based on velocity
      robot.root.position.copy(sm.currentPos);
      botPointLight.position.set(sm.currentPos.x, sm.currentPos.y + 0.4, sm.currentPos.z + 1.2);

      sm.velocity.subVectors(sm.currentPos, sm.prevPos).divideScalar(dt);
      const targetRoll = THREE.MathUtils.clamp(-sm.velocity.x * 0.055, -0.42, 0.42);
      const targetPitch = THREE.MathUtils.clamp(sm.velocity.y * 0.035, -0.28, 0.28);

      robot.bodyPivot.rotation.z = THREE.MathUtils.lerp(
        robot.bodyPivot.rotation.z,
        targetRoll,
        Math.min(1, dt * 10)
      );
      robot.bodyPivot.rotation.x = THREE.MathUtils.lerp(
        robot.bodyPivot.rotation.x,
        targetPitch,
        Math.min(1, dt * 10)
      );

      // Look direction: turn head slightly toward motion or hovered card
      const targetYaw = THREE.MathUtils.clamp(sm.velocity.x * 0.04, -0.45, 0.45);
      robot.headGroup.rotation.y = THREE.MathUtils.lerp(
        robot.headGroup.rotation.y,
        targetYaw,
        Math.min(1, dt * 8)
      );

      // Hover legs trail backward smoothly with speed
      const speedMag = sm.velocity.length();
      const legSwing = THREE.MathUtils.clamp(speedMag * 0.04, 0, 0.45);
      robot.leftLegGroup.rotation.x = legSwing + Math.sin(tSec * 6) * 0.06;
      robot.rightLegGroup.rotation.x = legSwing + Math.cos(tSec * 6) * 0.06;

      // Thruster flame and antigravity ring pulse
      const thrustScale = 0.85 + Math.min(0.65, speedMag * 0.06) + Math.sin(tSec * 28) * 0.12;
      robot.thrusterFlame.scale.set(1, thrustScale, 1);
      robot.antigravRing.scale.setScalar(0.92 + Math.sin(tSec * 10) * 0.12);

      // Update Particle Trail Pool
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        if (p.life > 0) {
          p.life -= dt;
          if (p.life <= 0) {
            p.mesh.visible = false;
          } else {
            p.mesh.position.addScaledVector(p.vel, dt);
            const ratio = p.life / p.maxLife;
            p.mat.opacity = ratio * 0.65;
            p.mesh.scale.setScalar(ratio * 0.9);
          }
        }
      }

      // Sync Floating Holographic HUD badge cleanly above the robot's antenna
      if (hudRef.current) {
        if (sm.hudVisible && sm.hudText) {
          const { px, py } = worldToDomPoint(
            new THREE.Vector3(sm.currentPos.x, sm.currentPos.y + 1.25 * baseScale, sm.currentPos.z)
          );
          const clampedX = Math.max(12, Math.min(container.clientWidth - 230, px - 84));
          const clampedY = Math.max(6, py - 32);
          hudRef.current.style.opacity = "1";
          hudRef.current.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
          const labelSpan = hudRef.current.querySelector(".hud-label");
          if (labelSpan && labelSpan.textContent !== sm.hudText) {
            labelSpan.textContent = sm.hudText;
          }
        } else {
          hudRef.current.style.opacity = "0";
        }
      }

      // Expose delivery state for visual styling, without moving the viewport.
      const isBotDelivering =
        sm.state === ANIMATION_STATES.ENTERING ||
        sm.state === ANIMATION_STATES.SCANNING ||
        sm.state === ANIMATION_STATES.PICKING_UP ||
        sm.state === ANIMATION_STATES.DELIVERING ||
        sm.state === ANIMATION_STATES.RELEASING;

      const projSectionEl = document.getElementById("projects");
      if (projSectionEl) {
        projSectionEl.setAttribute("data-projects-delivering", isBotDelivering ? "true" : "false");
      }

      // Viewport position belongs to the visitor; robot delivery never drives scrolling.

      renderer.render(scene, camera);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  // Trigger delivery sequence when deliveryRunId increments (> 0)
  useEffect(() => {
    if (deliveryRunId > 0 && controllerRef.current) {
      controllerRef.current.startFullSequence();
    }
  }, [deliveryRunId]);

  // Handle skip request
  useEffect(() => {
    if (skipRequested && controllerRef.current) {
      controllerRef.current.skipToCompleted();
    }
  }, [skipRequested]);

  // Handle summon wave
  useEffect(() => {
    if (summonTargetId && controllerRef.current) {
      controllerRef.current.summonWave();
    }
  }, [summonTargetId]);

  return h("div", {
    ref: mountRef,
    className: "robot-scene-canvas-layer",
    "aria-hidden": "true"
  });
}

// --------------------------------------------------------------------------
// 5. PROJECT DELIVERY ANIMATION WRAPPER (`ProjectDeliveryAnimation`)
// Coordinates scroll-triggered entry, telemetry bar, and WebGL fallback.
// --------------------------------------------------------------------------
export function ProjectDeliveryAnimation({
  stageRef,
  perchRef,
  slotRefsMap,
  projects,
  hoveredProjectId,
  summonTargetId,
  deliveryRunId,
  skipRequested,
  onStateChange,
  onProjectLanded,
  onAllDelivered
}) {
  return h(RobotScene, {
    stageRef,
    perchRef,
    slotRefsMap,
    projects,
    hoveredProjectId,
    summonTargetId,
    deliveryRunId,
    skipRequested,
    onStateChange,
    onProjectLanded,
    onAllDelivered
  });
}

// --------------------------------------------------------------------------
// 6. INTERACTIVE 3D PROJECT CARD (`ProjectCard3D`)
// Features spring-physics drop landing, 3D perspective hover tilt,
// robot inspection highlight, and full working links/actions.
// --------------------------------------------------------------------------
export function ProjectCard3D({
  project,
  index,
  isDelivered,
  isJustLanded,
  isActiveTarget,
  isRobotInspected,
  slotRefCallback,
  onHoverCard,
  onLeaveCard,
  onOpenModal,
  onOpenJourney
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handlePointerMove = (e) => {
    if (window.innerWidth < 768) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    setTilt({ rx: -ny * 5.5, ry: nx * 5.5 });
  };

  const handlePointerLeave = () => {
    setTilt({ rx: 0, ry: 0 });
    if (onLeaveCard) onLeaveCard();
  };

  // Subtle alternating drop rotation for realistic aerial release
  const dropRotateZ = index % 2 === 0 ? -2.2 : 2.2;

  return h(
    "div",
    {
      ref: (el) => slotRefCallback(project.id, el),
      className: `project-card-slot ${isActiveTarget ? "is-active-delivery-target" : ""}`,
      onMouseEnter: () => isDelivered && onHoverCard && onHoverCard(project.id),
      onMouseLeave: handlePointerLeave
    },
    isJustLanded && h("div", { className: "card-landing-pulse", "aria-hidden": "true" }),
    !isDelivered
      ? h("div", {
          className: "project-slot-dropzone",
          "aria-hidden": "true"
        })
      : h(
          motion.article,
          {
            layout: true,
            initial: { opacity: 0, scale: 0.84, y: -28, rotateZ: dropRotateZ },
            animate: {
              opacity: 1,
              scale: [0.84, 1.03, 1],
              y: [-28, 4, 0],
              rotateZ: [dropRotateZ, index % 2 === 0 ? 0.8 : -0.8, 0]
            },
            transition: {
              duration: 0.48,
              ease: [0.16, 1, 0.3, 1]
            },
            className: `bezel-outer project-card-3d ${
              isRobotInspected ? "is-robot-inspected" : ""
            }`,
            onPointerMove: handlePointerMove,
            onClick: () => onOpenModal(project),
            style: {
              transform: `perspective(950px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
            }
          },
          h(
            "div",
            { className: "bezel-inner", style: { display: "flex", flexDirection: "column", height: "100%" } },
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
                    title: project.liveUrl
                      ? `Open ${project.title} Live Demo`
                      : `Open ${project.title} GitHub`,
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
                { className: "project-body-top" },
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

              // Card Footer Actions (Live Demo, GitHub, View Details / Interactive Journey)
              h(
                "div",
                { className: "project-actions-footer" },
                h(
                  "div",
                  { style: { display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "nowrap" } },
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
                    : null,

                  h(
                    "button",
                    {
                      type: "button",
                      className: "project-action-pill",
                      style: { padding: "0.42rem 0.75rem", fontWeight: 600 },
                      onClick: (e) => {
                        e.stopPropagation();
                        onOpenModal(project);
                      }
                    },
                    "View Details"
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
        )
  );
}

// --------------------------------------------------------------------------
// 7. CATEGORY FILTERS COMPONENT (`ProjectFilters`)
// --------------------------------------------------------------------------
export function ProjectFilters({
  categories,
  activeCategory,
  onSelectCategory
}) {
  return h(
    "div",
    { className: "filter-pills-row", role: "tablist", "aria-label": "Filter projects by category" },
    categories.map((cat) =>
      h(
        "button",
        {
          key: cat.id,
          type: "button",
          role: "tab",
          "aria-selected": activeCategory === cat.id,
          className: `filter-pill-btn ${activeCategory === cat.id ? "active" : ""}`,
          onClick: () => onSelectCategory(cat.id)
        },
        cat.label
      )
    )
  );
}

// --------------------------------------------------------------------------
// 8. FEATURED PROJECTS SECTION (`FeaturedProjects`)
// Integrates the 3D Flying Robot Assistant, scroll-triggered delivery,
// live state telemetry bar, category filters, and 3D project cards.
// --------------------------------------------------------------------------
export function FeaturedProjects({
  projectsList,
  categories,
  onOpenModal,
  onOpenJourney
}) {
  const [projectFilter, setProjectFilter] = useState("all");

  // Filtered projects list (all 6 projects in exact order when 'all' is selected)
  const filteredProjects = useMemo(() => {
    if (projectFilter === "all") {
      return projectsList;
    }
    return projectsList.filter((p) => p.categories.includes(projectFilter));
  }, [projectsList, projectFilter]);

  // Delivery state tracking — starts empty so cards ONLY show after the bot delivers them!
  const [deliveredIds, setDeliveredIds] = useState(() =>
    prefersReducedMotion() || !checkWebGLSupport()
      ? new Set(projectsList.map((p) => p.id))
      : new Set()
  );
  const [justLandedId, setJustLandedId] = useState(null);
  const [robotTelemetry, setRobotTelemetry] = useState({
    state: ANIMATION_STATES.IDLE,
    stateLabel: STATE_LABELS.IDLE,
    projectIndex: 0,
    project: null
  });
  const [deliveryRunId, setDeliveryRunId] = useState(0);
  const [skipRequested, setSkipRequested] = useState(false);
  const [hoveredProjectId, setHoveredProjectId] = useState(null);
  const [summonTargetId, setSummonTargetId] = useState(null);

  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const perchRef = useRef(null);
  const slotRefsMap = useRef(new Map());
  const hasTriggeredInitialRef = useRef(false);
  const delayTimerRef = useRef(null);

  const registerSlotRef = useCallback((projectId, el) => {
    if (el) {
      slotRefsMap.current.set(projectId, el);
    } else {
      slotRefsMap.current.delete(projectId);
    }
  }, []);

  // Mark a project as landed when the robot drops it
  const handleProjectLanded = useCallback((projectId) => {
    setDeliveredIds((prev) => {
      const next = new Set(prev);
      next.add(projectId);
      return next;
    });
    setJustLandedId(projectId);
    setTimeout(() => {
      setJustLandedId((curr) => (curr === projectId ? null : curr));
    }, 700);
  }, []);

  const handleAllDelivered = useCallback(() => {
    setDeliveredIds(new Set(filteredProjects.map((p) => p.id)));
    setSkipRequested(false);
  }, [filteredProjects]);

  // Trigger initial robot delivery when the Featured Projects section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (prefersReducedMotion() || !checkWebGLSupport()) {
      setDeliveredIds(new Set(projectsList.map((p) => p.id)));
      return;
    }

    const checkProjScroll = () => {
      if (hasTriggeredInitialRef.current) return;
      if (window.scrollY < 200 && !window.location.hash.includes("projects")) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // If user has already scrolled past Projects, complete immediately without blocking
      if (rect.bottom < 0) {
        if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
        hasTriggeredInitialRef.current = true;
        setDeliveredIds(new Set(projectsList.map((p) => p.id)));
        return;
      }

      if (rect.top <= vh * 0.68 && rect.bottom >= vh * 0.2) {
        hasTriggeredInitialRef.current = true;
        if (prefersReducedMotion()) {
          setDeliveredIds(new Set(projectsList.map((p) => p.id)));
          return;
        }
        delayTimerRef.current = setTimeout(() => {
          setDeliveredIds(new Set());
          setSkipRequested(false);
          setDeliveryRunId((r) => r + 1);
        }, 1000);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            checkProjScroll();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);

    window.addEventListener("scroll", checkProjScroll, { passive: true });
    checkProjScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", checkProjScroll);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [projectsList]);

  // Replay full robot delivery sequence on demand
  const handleReplayDelivery = () => {
    setDeliveredIds(new Set());
    setSkipRequested(false);
    setSummonTargetId(null);
    setDeliveryRunId((r) => r + 1);
  };

  // Summon the robot to inspect a random or next featured project
  const handleSummonRobot = () => {
    if (filteredProjects.length === 0) return;
    const pick =
      filteredProjects[Math.floor(Math.random() * filteredProjects.length)];
    setSummonTargetId(pick.id);
    setTimeout(() => {
      setSummonTargetId((curr) => (curr === pick.id ? null : curr));
    }, 2600);
  };

  // Handle category filter change cleanly
  const handleSelectCategory = (catId) => {
    setProjectFilter(catId);
    setDeliveredIds(new Set(projectsList.map((p) => p.id)));
    setSkipRequested(true);
  };

  const isDeliveringNow =
    robotTelemetry.state !== ANIMATION_STATES.IDLE &&
    robotTelemetry.state !== ANIMATION_STATES.EXITING;

  const activeTargetId =
    isDeliveringNow && robotTelemetry.project ? robotTelemetry.project.id : null;

  return h(
    "section",
    { id: "projects", ref: sectionRef, className: "section-block" },
    // Section Header + Category Filters
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
          "Featured Projects",
          h("span", { className: "red-dot" })
        )
      ),
      h(ProjectFilters, {
        categories,
        activeCategory: projectFilter,
        onSelectCategory: handleSelectCategory
      })
    ),

    // Main 3D Showcase Stage (Telemetry Bar + 3D Robot WebGL Overlay + Project Bento Grid)
    h(
      "div",
      { ref: stageRef, className: "projects-showcase-stage" },
      // Robot Assistant Telemetry & Interactive Controls Bar (includes Holopad Dock)
      h(
        "div",
        { className: "robot-telemetry-bar", role: "region", "aria-label": "3D Robot Assistant Controls" },
        h(
          "div",
          { className: "robot-telemetry-left" },
          h("span", {
            ref: perchRef,
            className: "robot-holopad-dock",
            title: "Bot F-01 Holopad Dock",
            "aria-hidden": "true"
          }),
          h(
            "span",
            { className: "robot-unit-badge" },
            h("span", { className: "robot-unit-led" }),
            h("span", null, "BOT F-01")
          ),
          h(
            "span",
            {
              className: `robot-state-chip ${
                robotTelemetry.state === ANIMATION_STATES.IDLE ? "state-idle" : ""
              }`
            },
            robotTelemetry.stateLabel
          ),
          h(
            "span",
            { className: "robot-status-text" },
            isDeliveringNow && robotTelemetry.project
              ? `Carrying ${robotTelemetry.project.title} (${
                  robotTelemetry.projectIndex + 1
                }/${filteredProjects.length}) into the portfolio...`
              : hoveredProjectId
              ? `Inspecting ${
                  projectsList.find((p) => p.id === hoveredProjectId)?.title || "project"
                } · Click any card for full specs`
              : "All modules delivered · Hover a project card to guide Bot F-01 or replay aerial delivery"
          )
        ),
        h(
          "div",
          { className: "robot-telemetry-actions" },
          isDeliveringNow &&
            h(
              "button",
              {
                type: "button",
                className: "robot-control-btn",
                onClick: () => setSkipRequested(true)
              },
              "Instant Land All ⚡"
            ),
          h(
            "button",
            {
              type: "button",
              className: "robot-control-btn",
              onClick: handleSummonRobot,
              title: "Summon the 3D robot to inspect a project"
            },
            "Summon Bot 🤖"
          ),
          h(
            "button",
            {
              type: "button",
              className: "robot-control-btn primary-replay",
              onClick: handleReplayDelivery,
              title: "Replay the 3D robot project delivery sequence"
            },
            "Replay Robot Delivery ↻"
          )
        )
      ),

      h(ProjectDeliveryAnimation, {
        stageRef,
        perchRef,
        slotRefsMap,
        projects: filteredProjects,
        hoveredProjectId,
        summonTargetId,
        deliveryRunId,
        skipRequested,
        onStateChange: setRobotTelemetry,
        onProjectLanded: handleProjectLanded,
        onAllDelivered: handleAllDelivered
      }),

      h(
        motion.div,
        { layout: true, className: "projects-bento-grid" },
        h(
          AnimatePresence,
          { mode: "popLayout" },
          filteredProjects.map((project, idx) =>
            h(ProjectCard3D, {
              key: project.id,
              project,
              index: idx,
              isDelivered: deliveredIds.has(project.id),
              isJustLanded: justLandedId === project.id,
              isActiveTarget: activeTargetId === project.id,
              isRobotInspected:
                hoveredProjectId === project.id || summonTargetId === project.id,
              slotRefCallback: registerSlotRef,
              onHoverCard: setHoveredProjectId,
              onLeaveCard: () => setHoveredProjectId(null),
              onOpenModal,
              onOpenJourney
            })
          )
        )
      )
    )
  );
}
