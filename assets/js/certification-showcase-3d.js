// ==========================================================================
// FARDIN.AI — DUAL-SIDE FLYING ROBOT CERTIFICATION SHOWCASE (#certifications)
// Features:
//   - Robot A (Left Wing, Crimson LED) & Robot B (Right Wing, Amber-Red LED)
//   - Alternating dual-side deliveries across all 7 verified credentials:
//       F-01 (Left)  -> F-02 (Right) -> F-03 (Left)  -> F-04 (Right)
//       -> F-05 (Left)  -> F-06 (Right) -> F-07 (Left)
//   - Smooth 3D Bézier flight paths, banking body tilt, particle thruster trails
//   - Dynamic carried 3D miniature credential tiles with issuer logos
//   - Target row glow highlight, precision alignment, spring release & pulse
//   - Fully accessible, zero layout shift, interactive buttons & links preserved
// ==========================================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { gsap } from "gsap";
import { ExternalArrowIcon } from "./visual-previews.js";

const h = React.createElement;

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function checkWebGLSupport() {
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

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

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

// --------------------------------------------------------------------------
// 1. DYNAMIC 3D MINIATURE CREDENTIAL TILE TEXTURE
// --------------------------------------------------------------------------
function createCredentialMiniTileTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  function updateTile(cert, unitName = "ROBOT A") {
    if (!ctx) return;
    ctx.clearRect(0, 0, 512, 160);

    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark";

    // Card background with rounded edges
    ctx.fillStyle = isDark ? "#181C26" : "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 144, 22);
    ctx.fill();

    // Subtle outer border
    ctx.lineWidth = 4;
    ctx.strokeStyle = isDark ? "#292E3A" : "rgba(15, 23, 42, 0.12)";
    ctx.stroke();

    // Left accent strip (Crimson Red)
    ctx.fillStyle = isDark ? "#FF304F" : "#E11D48";
    ctx.beginPath();
    ctx.roundRect(14, 14, 12, 132, 6);
    ctx.fill();

    // Issuer logo box
    ctx.fillStyle = isDark ? "#12151D" : "#0F172A";
    ctx.beginPath();
    ctx.roundRect(40, 32, 96, 96, 16);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 44px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cert.logoText || "AI", 88, 80);

    // Unit carrier tag
    ctx.fillStyle = isDark ? "#FF304F" : "#E11D48";
    ctx.font = "bold 20px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText(`AIR DELIVERED BY ${unitName}`, 154, 46);

    // Title (truncated cleanly)
    ctx.fillStyle = isDark ? "#F5F6FA" : "#0F172A";
    ctx.font = "bold 32px 'Plus Jakarta Sans', sans-serif";
    const titleText = (cert.title || "").length > 24
      ? (cert.title || "").substring(0, 23) + "…"
      : cert.title || "";
    ctx.fillText(titleText, 154, 86);

    // Issuer & Period meta
    ctx.fillStyle = "#64748B";
    ctx.font = "24px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(`${cert.issuer || ""} · ${cert.period || "2026"}`, 154, 124);

    texture.needsUpdate = true;
  }

  return { texture, updateTile };
}

// --------------------------------------------------------------------------
// 2. 3D ROBOT CHARACTER GENERATOR (`createCertificationRobot3D`)
// Supports unit 'A' (Crimson LED, Left) and unit 'B' (Amber-Red LED, Right)
// --------------------------------------------------------------------------
export function createCertificationRobot3D(options = {}) {
  const isUnitB = options.unit === "B";
  const primaryLedColor = isUnitB ? 0xf59e0b : 0xe11d48; // Amber for B, Crimson for A
  const secondaryLedColor = isUnitB ? 0xef4444 : 0xfb7185;
  const unitName = isUnitB ? "ROBOT B" : "ROBOT A";

  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Materials
  const whiteShellMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.16,
    metalness: 0.08
  });

  const softGrayMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.32,
    metalness: 0.15
  });

  const darkJointMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.45,
    metalness: 0.25
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x050811,
    roughness: 0.08,
    metalness: 0.85
  });

  const primaryLedMat = new THREE.MeshBasicMaterial({
    color: primaryLedColor
  });

  const secondaryLedMat = new THREE.MeshBasicMaterial({
    color: secondaryLedColor
  });

  // --- A. HEAD GROUP ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.54, 0);
  bodyPivot.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.44, 28, 22);
  headGeo.scale(1.18, 0.92, 0.96);
  const headMesh = new THREE.Mesh(headGeo, whiteShellMat);
  headGroup.add(headMesh);

  // Curved obsidian visor plate
  const visorGeo = new THREE.SphereGeometry(0.41, 24, 18);
  visorGeo.scale(1.06, 0.72, 0.65);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, -0.02, 0.18);
  headGroup.add(visorMesh);

  // Expressive LED Eyes
  const eyeGroup = new THREE.Group();
  eyeGroup.position.set(0, -0.01, 0.44);
  headGroup.add(eyeGroup);

  const eyeGeo = isUnitB
    ? new THREE.SphereGeometry(0.065, 12, 12) // Rounder eyes for Robot B
    : new THREE.CapsuleGeometry(0.05, 0.045, 8, 12).rotateZ(Math.PI * 0.5); // Pill eyes for Robot A

  const leftEye = new THREE.Mesh(eyeGeo, primaryLedMat);
  leftEye.position.set(-0.135, 0, 0);
  eyeGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, primaryLedMat);
  rightEye.position.set(0.135, 0, 0);
  eyeGroup.add(rightEye);

  // Specular glints for cuteness
  const glintGeo = new THREE.SphereGeometry(0.018, 8, 8);
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const leftGlint = new THREE.Mesh(glintGeo, glintMat);
  leftGlint.position.set(-0.115, 0.02, 0.045);
  eyeGroup.add(leftGlint);

  const rightGlint = new THREE.Mesh(glintGeo, glintMat);
  rightGlint.position.set(0.155, 0.02, 0.045);
  eyeGroup.add(rightGlint);

  // Side Ear Pods + LED Rings
  const earGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.1, 16);
  earGeo.rotateZ(Math.PI * 0.5);
  const leftEar = new THREE.Mesh(earGeo, softGrayMat);
  leftEar.position.set(-0.52, 0, 0);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, softGrayMat);
  rightEar.position.set(0.52, 0, 0);
  headGroup.add(rightEar);

  const earRingGeo = new THREE.TorusGeometry(0.08, 0.018, 8, 20);
  earRingGeo.rotateY(Math.PI * 0.5);
  const leftEarRing = new THREE.Mesh(earRingGeo, primaryLedMat);
  leftEarRing.position.set(-0.57, 0, 0);
  headGroup.add(leftEarRing);

  const rightEarRing = new THREE.Mesh(earRingGeo, primaryLedMat);
  rightEarRing.position.set(0.57, 0, 0);
  headGroup.add(rightEarRing);

  // Antenna
  const antennaStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.028, 0.22, 10),
    softGrayMat
  );
  antennaStem.position.set(0, 0.46, 0);
  if (isUnitB) antennaStem.rotation.z = -0.16; // Playful tilt for B
  headGroup.add(antennaStem);

  const antennaTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 14, 14),
    primaryLedMat
  );
  antennaTip.position.set(isUnitB ? -0.04 : 0, 0.58, 0);
  headGroup.add(antennaTip);

  // --- B. TORSO / CHASSIS GROUP ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, -0.06, 0);
  bodyPivot.add(torsoGroup);

  const torsoGeo = new THREE.SphereGeometry(0.36, 24, 20);
  torsoGeo.scale(1.0, 1.08, 0.88);
  const torsoMesh = new THREE.Mesh(torsoGeo, whiteShellMat);
  torsoGroup.add(torsoMesh);

  // Chest Core Badge
  const chestCoreRing = new THREE.Mesh(
    new THREE.RingGeometry(0.06, 0.098, 20),
    primaryLedMat
  );
  chestCoreRing.position.set(0, 0.05, 0.33);
  torsoGroup.add(chestCoreRing);

  const chestCoreCenter = new THREE.Mesh(
    new THREE.CircleGeometry(0.048, 16),
    secondaryLedMat
  );
  chestCoreCenter.position.set(0, 0.05, 0.332);
  torsoGroup.add(chestCoreCenter);

  // --- C. ARTICULATED ARMS & MECHANICAL GRIPPERS ---
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.38, 0.1, 0.04);
  torsoGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.38, 0.1, 0.04);
  torsoGroup.add(rightArmGroup);

  function buildArm(isLeft) {
    const armRoot = new THREE.Group();
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 12), darkJointMat);
    armRoot.add(shoulder);

    const upperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.048, 0.18, 8, 10),
      whiteShellMat
    );
    upperArm.position.set(isLeft ? -0.04 : 0.04, -0.14, 0.03);
    upperArm.rotation.z = isLeft ? 0.16 : -0.16;
    armRoot.add(upperArm);

    const gripperPivot = new THREE.Group();
    gripperPivot.position.set(isLeft ? -0.05 : 0.05, -0.28, 0.06);
    armRoot.add(gripperPivot);

    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.04, 10), darkJointMat);
    gripperPivot.add(wrist);

    const clawGeo = new THREE.BoxGeometry(0.024, 0.1, 0.038);
    const outerClaw = new THREE.Mesh(clawGeo, primaryLedMat);
    outerClaw.position.set(isLeft ? -0.03 : 0.03, -0.05, 0);
    gripperPivot.add(outerClaw);

    const innerClaw = new THREE.Mesh(clawGeo, darkJointMat);
    innerClaw.position.set(isLeft ? 0.02 : -0.02, -0.05, 0);
    gripperPivot.add(innerClaw);

    return { armRoot, gripperPivot, outerClaw, innerClaw };
  }

  const leftArmParts = buildArm(true);
  leftArmGroup.add(leftArmParts.armRoot);

  const rightArmParts = buildArm(false);
  rightArmGroup.add(rightArmParts.armRoot);

  // --- D. HOVER LEGS & THRUSTER GROUP ---
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.15, -0.36, 0);
  torsoGroup.add(leftLegGroup);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.15, -0.36, 0);
  torsoGroup.add(rightLegGroup);

  function buildHoverLeg() {
    const leg = new THREE.Group();
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), darkJointMat);
    leg.add(hip);

    const boot = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.05, 0.1, 8, 10),
      whiteShellMat
    );
    boot.position.set(0, -0.08, 0);
    leg.add(boot);

    const soleGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.06, 0.035, 10),
      primaryLedMat
    );
    soleGlow.position.set(0, -0.16, 0);
    leg.add(soleGlow);
    return leg;
  }

  leftLegGroup.add(buildHoverLeg());
  rightLegGroup.add(buildHoverLeg());

  // Thruster Plume
  const thrusterGroup = new THREE.Group();
  thrusterGroup.position.set(0, -0.42, 0);
  torsoGroup.add(thrusterGroup);

  const thrusterConeGeo = new THREE.ConeGeometry(0.14, 0.38, 16, 1, true).rotateX(Math.PI);
  const thrusterMat = new THREE.MeshBasicMaterial({
    color: primaryLedColor,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide
  });
  const thrusterFlame = new THREE.Mesh(thrusterConeGeo, thrusterMat);
  thrusterFlame.position.set(0, -0.16, 0);
  thrusterGroup.add(thrusterFlame);

  const antigravRingGeo = new THREE.RingGeometry(0.18, 0.23, 24).rotateX(Math.PI * 0.5);
  const antigravRingMat = new THREE.MeshBasicMaterial({
    color: primaryLedColor,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const antigravRing = new THREE.Mesh(antigravRingGeo, antigravRingMat);
  antigravRing.position.set(0, -0.22, 0);
  thrusterGroup.add(antigravRing);

  // --- E. CARRIED 3D MINIATURE CREDENTIAL TILE + TRACTOR BEAM ---
  const cargoPivot = new THREE.Group();
  cargoPivot.position.set(0, -0.42, 0.1);
  cargoPivot.visible = false;
  bodyPivot.add(cargoPivot);

  const { texture: miniTileTexture, updateTile } = createCredentialMiniTileTexture();

  const tileMaterials = [
    whiteShellMat, // right
    whiteShellMat, // left
    whiteShellMat, // top
    whiteShellMat, // bottom
    new THREE.MeshBasicMaterial({ map: miniTileTexture }), // front
    whiteShellMat  // back
  ];
  // Sleek horizontal tile geometry matching list tile aspect ratio (1.8 : 0.58)
  const miniTileGeo = new THREE.BoxGeometry(1.75, 0.58, 0.05);
  const miniTileMesh = new THREE.Mesh(miniTileGeo, tileMaterials);
  miniTileMesh.position.set(0, -0.12, 0);
  cargoPivot.add(miniTileMesh);

  // Soft drop shadow plane beneath tile
  const miniShadowGeo = new THREE.PlaneGeometry(1.8, 0.28).rotateX(-Math.PI * 0.5);
  const miniShadowMat = new THREE.MeshBasicMaterial({
    color: 0x090d16,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  });
  const miniShadowMesh = new THREE.Mesh(miniShadowGeo, miniShadowMat);
  miniShadowMesh.position.set(0, -0.46, 0);
  cargoPivot.add(miniShadowMesh);

  // Tractor beam ring
  const tractorRingGeo = new THREE.TorusGeometry(0.28, 0.012, 8, 24).rotateX(Math.PI * 0.5);
  const tractorRingMat = new THREE.MeshBasicMaterial({
    color: primaryLedColor,
    transparent: true,
    opacity: 0.6
  });
  const tractorRing = new THREE.Mesh(tractorRingGeo, tractorRingMat);
  tractorRing.position.set(0, 0, 0);
  cargoPivot.add(tractorRing);

  // --- F. CONICAL SCANNING BEAM ---
  const scanBeamGroup = new THREE.Group();
  scanBeamGroup.position.set(0, 0.5, 0.4);
  scanBeamGroup.visible = false;
  bodyPivot.add(scanBeamGroup);

  const scanConeGeo = new THREE.ConeGeometry(0.6, 1.4, 24, 1, true);
  scanConeGeo.translate(0, -0.7, 0).rotateX(-Math.PI * 0.32);
  const scanBeamMat = new THREE.MeshBasicMaterial({
    color: primaryLedColor,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const scanConeMesh = new THREE.Mesh(scanConeGeo, scanBeamMat);
  scanBeamGroup.add(scanConeMesh);

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
    cargoPivot,
    miniTileMesh,
    tractorRing,
    scanBeamGroup,
    unitName,
    isUnitB,
    updateCredentialTile: (cert) => updateTile(cert, unitName)
  };
}

// --------------------------------------------------------------------------
// ANIMATION LIFECYCLE STATE CONSTANTS
// Explicit, unidirectional state machine ensuring user manual scrolling always
// takes absolute priority over animations without fighting or pulling the viewport.
// --------------------------------------------------------------------------
export const ANIM_LIFECYCLE = {
  IDLE: "IDLE",
  PLAYING: "PLAYING",
  INTERRUPTED: "INTERRUPTED",
  COMPLETED: "COMPLETED"
};

// --------------------------------------------------------------------------
// 3. DUAL ROBOT DELIVERY WEBGL SCENE (`DualRobotDeliveryScene`)
// --------------------------------------------------------------------------
export function DualRobotDeliveryScene({
  containerRef,
  slotRefsMap,
  certifications,
  runCount,
  controllerRef: externalControllerRef,
  onTargetRow,
  onRowDelivered,
  onAllDelivered,
  onTelemetryUpdate
}) {
  const mountRef = useRef(null);
  const internalControllerRef = useRef(null);

  const latestPropsRef = useRef({
    certifications,
    onTargetRow,
    onRowDelivered,
    onAllDelivered,
    onTelemetryUpdate
  });
  useEffect(() => {
    latestPropsRef.current = {
      certifications,
      onTargetRow,
      onRowDelivered,
      onAllDelivered,
      onTelemetryUpdate
    };
  }, [certifications, onTargetRow, onRowDelivered, onAllDelivered, onTelemetryUpdate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !checkWebGLSupport()) return;

    const reducedMotion = prefersReducedMotion();
    const isMobile = window.innerWidth < 680;

    const width = Math.max(320, container.clientWidth);
    const height = Math.max(400, container.clientHeight);

    const scene = new THREE.Scene();
    const cameraFov = 34;
    const cameraZ = 13.5;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 9, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffe4e6, 0.95);
    rimLight.position.set(-6, 4, -3);
    scene.add(rimLight);

    // Create Robot A (Left Wing) & Robot B (Right Wing)
    const robotA = createCertificationRobot3D({ unit: "A" });
    const robotB = createCertificationRobot3D({ unit: "B" });
    scene.add(robotA.root);
    scene.add(robotB.root);

    // Particle Trail Pool (Dual Red & Amber particles)
    const maxParticles = isMobile ? 16 : 36;
    const particleGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const particles = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    for (let i = 0; i < maxParticles; i++) {
      const pColor = i % 2 === 0 ? 0xe11d48 : 0xf59e0b;
      const pMat = new THREE.MeshBasicMaterial({
        color: pColor,
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
        maxLife: 0.48,
        vel: new THREE.Vector3()
      });
    }

    let particleCursor = 0;
    function spawnParticle(pos, colorHex = 0xe11d48) {
      if (reducedMotion) return;
      const p = particles[particleCursor];
      particleCursor = (particleCursor + 1) % maxParticles;
      p.life = p.maxLife;
      p.mat.color.setHex(colorHex);
      p.mesh.visible = true;
      p.mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.15,
        pos.y - 0.32 * baseScale + (Math.random() - 0.5) * 0.08,
        pos.z - 0.05
      );
      p.mesh.scale.setScalar(0.7 + Math.random() * 0.5);
      p.vel.set(
        (Math.random() - 0.5) * 0.35,
        -0.5 - Math.random() * 0.45,
        (Math.random() - 0.5) * 0.15
      );
    }

    // Coordinate Helpers
    function getVisibleBounds() {
      const cW = Math.max(320, container.clientWidth);
      const cH = Math.max(400, container.clientHeight);
      const vH = 2 * Math.tan((cameraFov * Math.PI) / 360) * cameraZ;
      const vW = vH * (cW / cH);
      const pxPerUnit = cH / vH;
      return { cW, cH, vW, vH, pxPerUnit };
    }

    function domToWorld(px, py) {
      const { cW, cH, vW, vH } = getVisibleBounds();
      const wx = (px / cW - 0.5) * vW;
      const wy = -(py / cH - 0.5) * vH;
      return new THREE.Vector3(wx, wy, 0);
    }

    function computeScale() {
      const { cW, pxPerUnit } = getVisibleBounds();
      const desiredPx = cW < 680 ? 46 : 66;
      return desiredPx / Math.max(20, pxPerUnit);
    }

    let baseScale = computeScale();
    robotA.root.scale.setScalar(baseScale);
    robotB.root.scale.setScalar(baseScale);

    // Initial Off-Screen Positions
    const { vW, vH } = getVisibleBounds();
    const restPosA = new THREE.Vector3(-vW * 0.65, vH * 0.45, 0.6);
    const restPosB = new THREE.Vector3(vW * 0.65, vH * 0.45, 0.6);
    robotA.root.position.copy(restPosA);
    robotB.root.position.copy(restPosB);

    // Delivery state management
    let currentDeliveryAbort = null;
    let isRunning = false;
    function getRowWorldCenter(certId, defaultY = 0) {
      const slotEl = slotRefsMap.current.get(certId);
      if (!slotEl) return new THREE.Vector3(0, defaultY, 0);
      const cRect = container.getBoundingClientRect();
      const sRect = slotEl.getBoundingClientRect();
      const px = sRect.left - cRect.left + sRect.width * 0.5;
      const py = sRect.top - cRect.top + sRect.height * 0.5;
      return domToWorld(px, py);
    }

    async function deliverOneCard(cert, idx, totalCount, abortSignal) {
      if (abortSignal.aborted) return;
      const isRobotBTurn = idx % 2 === 1;
      const currentBot = isRobotBTurn ? robotB : robotA;
      const botName = isRobotBTurn ? "ROBOT B (RIGHT)" : "ROBOT A (LEFT)";
      const sideMultiplier = isRobotBTurn ? 1 : -1;
      const startX = sideMultiplier * (vW * 0.62);

      const slotPos = getRowWorldCenter(
        cert.id,
        (0.5 - (idx + 1) / (totalCount + 1)) * vH * 0.7
      );

      // Telemetry update
      if (latestPropsRef.current.onTelemetryUpdate) {
        latestPropsRef.current.onTelemetryUpdate({
          active: true,
          chip: `ROW ${idx + 1}/${totalCount} · ${botName}`,
          text: `FLYING IN [F-0${idx + 1}] ${cert.issuer} — ${cert.title}...`
        });
      }

      // Target row highlight glow
      if (latestPropsRef.current.onTargetRow) {
        latestPropsRef.current.onTargetRow(cert.id);
      }

      // Prepare robot cargo tile
      currentBot.updateCredentialTile(cert);
      currentBot.cargoPivot.visible = true;
      currentBot.scanBeamGroup.visible = true;
      currentBot.leftArmParts.gripperPivot.rotation.z = 0.22;
      currentBot.rightArmParts.gripperPivot.rotation.z = -0.22;

      // Vertical offset so the carried tile aligns exactly with the row center
      const targetTileOffsetY = 0.54 * baseScale;

      // Positions for smooth 3D Bézier approach (clearly in front with z > 0.6)
      const p0 = new THREE.Vector3(startX, slotPos.y + targetTileOffsetY + 0.6, 0.6);
      const c1 = new THREE.Vector3(sideMultiplier * (vW * 0.28), slotPos.y + targetTileOffsetY + 1.2, 1.5);
      const c2 = new THREE.Vector3(sideMultiplier * (vW * 0.1), slotPos.y + targetTileOffsetY + 0.35, 1.1);
      const p3 = new THREE.Vector3(0, slotPos.y + targetTileOffsetY, 0.95); // precise alignment in front

      currentBot.root.position.copy(p0);

      // Inbound flight animation
      await new Promise((resolve) => {
        const flightObj = { progress: 0 };
        const tw = gsap.to(flightObj, {
          progress: 1,
          duration: isMobile ? 0.62 : 0.78,
          ease: "power2.inOut",
          onUpdate: () => {
            if (abortSignal.aborted) {
              tw.kill();
              resolve();
              return;
            }
            evalCubicBezier3D(p0, c1, c2, p3, flightObj.progress, currentBot.root.position);
            const bankAngle = Math.sin(flightObj.progress * Math.PI) * 0.25 * (-sideMultiplier);
            currentBot.bodyPivot.rotation.z = bankAngle;
            currentBot.bodyPivot.rotation.y = bankAngle * 0.5;
            spawnParticle(currentBot.root.position, isRobotBTurn ? 0xf59e0b : 0xe11d48);
          },
          onComplete: resolve
        });

        abortSignal.addEventListener("abort", () => {
          tw.kill();
          resolve();
        }, { once: true });
      });

      if (abortSignal.aborted) return;

      // Release tile and reveal DOM row with spring bounce
      currentBot.scanBeamGroup.visible = false;
      currentBot.cargoPivot.visible = false;
      currentBot.leftArmParts.gripperPivot.rotation.z = -0.15;
      currentBot.rightArmParts.gripperPivot.rotation.z = 0.15;

      if (latestPropsRef.current.onRowDelivered) {
        latestPropsRef.current.onRowDelivered(cert.id);
      }

      // Mini celebration hover & eye pulse
      gsap.to(currentBot.bodyPivot.rotation, {
        z: 0.12 * sideMultiplier,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });

      // Arc away off-screen in front
      const exitP0 = currentBot.root.position.clone();
      const exitP1 = new THREE.Vector3(sideMultiplier * (vW * 0.32), exitP0.y + 0.9, 1.2);
      const exitP2 = new THREE.Vector3(sideMultiplier * (vW * 0.68), exitP0.y + 1.5, 0.6);

      const exitPromise = new Promise((resolve) => {
        const exitObj = { progress: 0 };
        const tw = gsap.to(exitObj, {
          progress: 1,
          duration: isMobile ? 0.42 : 0.52,
          ease: "power2.in",
          onUpdate: () => {
            if (abortSignal.aborted) {
              tw.kill();
              resolve();
              return;
            }
            evalCubicBezier3D(exitP0, exitP1, exitP2, exitP2, exitObj.progress, currentBot.root.position);
            currentBot.bodyPivot.rotation.z = -0.2 * sideMultiplier;
            spawnParticle(currentBot.root.position, isRobotBTurn ? 0xf59e0b : 0xe11d48);
          },
          onComplete: () => {
            currentBot.bodyPivot.rotation.set(0, 0, 0);
            resolve();
          }
        });

        abortSignal.addEventListener("abort", () => {
          tw.kill();
          resolve();
        }, { once: true });
      });

      // Smooth cadence before next robot starts
      await Promise.race([
        exitPromise,
        new Promise((r) => {
          const timer = setTimeout(r, 450);
          abortSignal.addEventListener("abort", () => {
            clearTimeout(timer);
            r();
          }, { once: true });
        })
      ]);
    }

    function stopAllTweens() {
      try {
        gsap.killTweensOf(robotA.root.position);
        gsap.killTweensOf(robotB.root.position);
        gsap.killTweensOf(robotA.bodyPivot.rotation);
        gsap.killTweensOf(robotB.bodyPivot.rotation);
      } catch (_e) {}
    }

    function resetRobotsToRest() {
      robotA.cargoPivot.visible = false;
      robotB.cargoPivot.visible = false;
      robotA.scanBeamGroup.visible = false;
      robotB.scanBeamGroup.visible = false;
      if (robotA.leftArmParts && robotA.leftArmParts.gripperPivot) {
        robotA.leftArmParts.gripperPivot.rotation.z = 0;
      }
      if (robotB.leftArmParts && robotB.leftArmParts.gripperPivot) {
        robotB.leftArmParts.gripperPivot.rotation.z = 0;
      }
      if (robotA.rightArmParts && robotA.rightArmParts.gripperPivot) {
        robotA.rightArmParts.gripperPivot.rotation.z = 0;
      }
      if (robotB.rightArmParts && robotB.rightArmParts.gripperPivot) {
        robotB.rightArmParts.gripperPivot.rotation.z = 0;
      }
      robotA.bodyPivot.rotation.set(0, 0, 0);
      robotB.bodyPivot.rotation.set(0, 0, 0);
      robotA.root.position.copy(restPosA);
      robotB.root.position.copy(restPosB);
    }

    async function buildDeliverySequence() {
      const certs = latestPropsRef.current.certifications || [];
      if (certs.length === 0 || reducedMotion) {
        certs.forEach((c) => {
          if (latestPropsRef.current.onRowDelivered) {
            latestPropsRef.current.onRowDelivered(c.id);
          }
        });
        if (latestPropsRef.current.onAllDelivered) {
          latestPropsRef.current.onAllDelivered();
        }
        return;
      }

      if (currentDeliveryAbort) {
        currentDeliveryAbort.abort();
      }
      currentDeliveryAbort = new AbortController();
      const abortSignal = currentDeliveryAbort.signal;
      isRunning = true;

      // Reset both robots
      resetRobotsToRest();

      for (let idx = 0; idx < certs.length; idx++) {
        if (abortSignal.aborted) break;
        await deliverOneCard(certs[idx], idx, certs.length, abortSignal);
        if (abortSignal.aborted) break;
        await new Promise((r) => {
          const timer = setTimeout(r, 80);
          abortSignal.addEventListener("abort", () => {
            clearTimeout(timer);
            r();
          }, { once: true });
        });
      }

      if (!abortSignal.aborted) {
        isRunning = false;
        if (latestPropsRef.current.onAllDelivered) {
          latestPropsRef.current.onAllDelivered();
        }
        if (latestPropsRef.current.onTelemetryUpdate) {
          latestPropsRef.current.onTelemetryUpdate({
            active: false,
            chip: "7/7 DELIVERED · STANDBY",
            text: "DUAL BOTS MISSION COMPLETE · All 7 verified credential rows locked in place"
          });
        }
      }
    }

    const controller = {
      startDelivery: () => {
        buildDeliverySequence();
      },
      skipAll: () => {
        if (currentDeliveryAbort) {
          currentDeliveryAbort.abort();
          currentDeliveryAbort = null;
        }
        isRunning = false;
        stopAllTweens();
        resetRobotsToRest();

        const certs = latestPropsRef.current.certifications || [];
        certs.forEach((c) => {
          if (latestPropsRef.current.onRowDelivered) {
            latestPropsRef.current.onRowDelivered(c.id);
          }
        });
        if (latestPropsRef.current.onAllDelivered) {
          latestPropsRef.current.onAllDelivered();
        }
      }
    };

    internalControllerRef.current = controller;
    if (externalControllerRef) {
      externalControllerRef.current = controller;
    }

    // Render loop
    let rafId = null;
    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    let lastTime = performance.now();
    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!isVisible || document.hidden) return;

      // Particle updates
      particles.forEach((p) => {
        if (p.life > 0) {
          p.life -= dt;
          p.mesh.position.addScaledVector(p.vel, dt);
          p.mat.opacity = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) p.mesh.visible = false;
        }
      });

      // Subtle hover bob when idle/flying
      const bobA = Math.sin(now * 0.003) * 0.04;
      const bobB = Math.cos(now * 0.0032) * 0.04;
      robotA.headGroup.position.y = 0.54 + bobA * 0.5;
      robotB.headGroup.position.y = 0.54 + bobB * 0.5;

      // Delivery animates in place; never pull the page away from the visitor.

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = Math.max(320, container.clientWidth);
      const h = Math.max(400, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      baseScale = computeScale();
      robotA.root.scale.setScalar(baseScale);
      robotB.root.scale.setScalar(baseScale);
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (currentDeliveryAbort) currentDeliveryAbort.abort();
      stopAllTweens();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (externalControllerRef) {
        externalControllerRef.current = null;
      }
    };
  }, []);

  // Trigger delivery on runCount increment (> 0)
  useEffect(() => {
    if (runCount > 0 && internalControllerRef.current) {
      internalControllerRef.current.startDelivery();
    }
  }, [runCount]);

  return h("div", {
    ref: mountRef,
    className: "cert-robot-canvas-layer",
    "aria-hidden": "true"
  });
}

// --------------------------------------------------------------------------
// 4. CERTIFICATION ROW COMPONENT (`CertificationRow`)
// Matches reference screenshot 100%: F-01 badge, issuer logo, title, period,
// status pill, and action buttons.
// --------------------------------------------------------------------------
export function CertificationRow({
  cert,
  index,
  isDelivered,
  isActiveTarget,
  isJustLanded,
  isInstant = false,
  slotRefCallback,
  onOpenModal,
  onOpenCertWall,
  onOpenJourney
}) {
  const unitNum = String(index + 1).padStart(2, "0");
  const isLeftOrigin = index % 2 === 0;

  return h(
    "div",
    {
      ref: (el) => slotRefCallback(cert.id, el),
      className: `cert-row-slot ${isActiveTarget ? "is-active-target" : ""}`,
      id: `cert-slot-${cert.id}`
    },
    // Shockwave pulse ring upon card landing (suppressed during quick reveal)
    !isInstant && isJustLanded && h("div", { className: "card-landing-pulse", "aria-hidden": "true" }),

    // Slot placeholder while awaiting robot delivery
    !isDelivered
      ? h("div", { className: "cert-slot-placeholder", "aria-hidden": "true" })
      : h(
          motion.div,
          {
            role: "listitem",
            className: `cert-row-card cert-list-tile is-tile-settled ${
              isLeftOrigin ? "delivered-from-left" : "delivered-from-right"
            }`,
            initial: isInstant ? false : { opacity: 0, scale: 0.95, y: -10 },
            animate: {
              opacity: 1,
              scale: isInstant ? 1 : [0.95, 1.018, 1],
              y: isInstant ? 0 : [-10, 2, 0]
            },
            transition: isInstant
              ? { duration: 0 }
              : {
                  duration: 0.44,
                  ease: [0.16, 1, 0.3, 1]
                }
          },
          // Left side: Callsign Badge + Issuer Logo + Title & Meta
          h(
            "div",
            { className: "cert-tile-left" },
            h(
              "span",
              {
                className: "cert-mini-bot-badge",
                title: `Credential ${unitNum} — Delivered by ${isLeftOrigin ? "Robot A" : "Robot B"}`
              },
              h(
                "svg",
                {
                  className: "bot-f01-mascot-svg",
                  width: 20,
                  height: 20,
                  viewBox: "0 0 100 100",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg"
                },
                h("circle", { cx: 50, cy: 50, r: 42, fill: "#0F172A" }),
                h("rect", { x: 26, y: 38, width: 48, height: 26, rx: 13, fill: "#E11D48" }),
                h("circle", { cx: 40, cy: 51, r: 4.5, fill: "#FFFFFF" }),
                h("circle", { cx: 60, cy: 51, r: 4.5, fill: "#FFFFFF" })
              ),
              h("span", { className: "cert-mini-bot-tag" }, `F-${unitNum}`)
            ),
            h("div", { className: "cert-issuer-logo cert-tile-logo" }, cert.logoText),
            h(
              "div",
              { className: "cert-tile-text" },
              h(
                "div",
                { className: "cert-tile-title-row" },
                h("span", { className: "cert-tile-title", title: cert.title }, cert.title)
              ),
              h(
                "div",
                { className: "cert-tile-meta-row" },
                h("span", { className: "cert-tile-issuer" }, cert.issuer),
                cert.period && h("span", { className: "cert-tile-period" }, `· ${cert.period}`)
              )
            )
          ),

          // Right side: Status Pill + Action Buttons
          h(
            "div",
            { className: "cert-tile-right" },
            Boolean(cert.status && cert.statusType !== "none") &&
              h(
                "span",
                {
                  className:
                    cert.statusType === "verified"
                      ? "verified-pill"
                      : "inprogress-pill"
                },
                cert.statusType === "verified" ? `✓ ${cert.status}` : `⏳ ${cert.status}`
              ),
            cert.verifyUrl &&
              h(
                "a",
                {
                  href: cert.verifyUrl,
                  target: "_blank",
                  rel: "noopener",
                  className: "icon-circle-btn cert-tile-icon-btn",
                  title: `Verify ${cert.issuer} Credential`
                },
                h(ExternalArrowIcon, { size: 12 })
              ),
            cert.certificateImage &&
              h(
                "button",
                {
                  type: "button",
                  className: "icon-circle-btn cert-tile-icon-btn",
                  title: `View ${cert.title} Certificate Scan`,
                  onClick: () => onOpenModal && onOpenModal(cert)
                },
                "👁"
              ),
            cert.openCertWall &&
              h(
                "button",
                {
                  type: "button",
                  className: "icon-circle-btn cert-tile-icon-btn",
                  title: "Explore 20/20 Certificate Wall on FlyRank Internship Page",
                  onClick: () => onOpenCertWall && onOpenCertWall("journey-certificates")
                },
                "→"
              ),
            cert.openJourney &&
              h(
                "button",
                {
                  type: "button",
                  className: "icon-circle-btn cert-tile-icon-btn",
                  title: "Open in Interactive Journey",
                  onClick: () => onOpenJourney && onOpenJourney("journey-timeline")
                },
                "→"
              )
          )
        )
  );
}

// --------------------------------------------------------------------------
// 5. CERTIFICATION SHOWCASE CONTAINER (`CertificationShowcase`)
// Full section with Telemetry Bar, Dual Robot 3D Canvas, and 7 Credential Rows
// --------------------------------------------------------------------------
export function CertificationShowcase({
  certifications,
  onOpenModal,
  onOpenJourneyExperience
}) {
  const stageRef = useRef(null);
  const sectionRef = useRef(null);
  const slotRefsMap = useRef(new Map());
  const controllerRef = useRef(null);
  const lifecycleRef = useRef(ANIM_LIFECYCLE.IDLE);
  const delayTimerRef = useRef(null);

  const [lifecycle, setLifecycle] = useState(ANIM_LIFECYCLE.IDLE);
  const [isQuickReveal, setIsQuickReveal] = useState(false);

  // Delivered card state tracking
  const [deliveredIds, setDeliveredIds] = useState(() =>
    prefersReducedMotion() || !checkWebGLSupport()
      ? new Set(certifications.map((c) => c.id))
      : new Set()
  );
  const [activeTargetId, setActiveTargetId] = useState(null);
  const [justLandedId, setJustLandedId] = useState(null);
  const [runCount, setRunCount] = useState(0);

  // Telemetry state
  const [telemetry, setTelemetry] = useState({
    active: false,
    chip: "DUAL ROBOTS · READY",
    text: "ROBOT A (LEFT) & ROBOT B (RIGHT) READY · Scroll into section to initiate dual-side delivery"
  });

  const registerSlotRef = useCallback((certId, el) => {
    if (el) {
      slotRefsMap.current.set(certId, el);
    } else {
      slotRefsMap.current.delete(certId);
    }
  }, []);

  const handleTargetRow = useCallback((certId) => {
    setActiveTargetId(certId);
  }, []);

  const handleRowDelivered = useCallback((certId) => {
    setDeliveredIds((prev) => {
      const next = new Set(prev);
      next.add(certId);
      return next;
    });
    setActiveTargetId(null);
    setJustLandedId(certId);
    setTimeout(() => {
      setJustLandedId((curr) => (curr === certId ? null : curr));
    }, 650);
  }, []);

  const handleAllDelivered = useCallback(() => {
    setDeliveredIds(new Set(certifications.map((c) => c.id)));
    setActiveTargetId(null);
    lifecycleRef.current = ANIM_LIFECYCLE.COMPLETED;
    setLifecycle(ANIM_LIFECYCLE.COMPLETED);
  }, [certifications]);

  const handleTelemetryUpdate = useCallback((tState) => {
    setTelemetry(tState);
  }, []);

  // Safe interruption: Immediately stops in-flight work and settles rows silently
  const interruptSequence = useCallback(
    (_reason = "manual-scroll") => {
      if (lifecycleRef.current !== ANIM_LIFECYCLE.PLAYING) return;
      lifecycleRef.current = ANIM_LIFECYCLE.INTERRUPTED;
      setLifecycle(ANIM_LIFECYCLE.INTERRUPTED);
      setIsQuickReveal(true);

      if (controllerRef.current && typeof controllerRef.current.skipAll === "function") {
        controllerRef.current.skipAll();
      }

      setDeliveredIds(new Set(certifications.map((c) => c.id)));
      setActiveTargetId(null);
      setJustLandedId(null);

      setTelemetry({
        active: false,
        chip: "7/7 DELIVERED · STANDBY",
        text: "DUAL BOTS MISSION COMPLETE · All 7 verified credential rows locked in place"
      });

      lifecycleRef.current = ANIM_LIFECYCLE.COMPLETED;
      setLifecycle(ANIM_LIFECYCLE.COMPLETED);
    },
    [certifications]
  );

  // If user scrolls completely away from Certifications while playing, quietly complete remaining rows
  // without any viewport movement or forcing
  useEffect(() => {
    if (lifecycle !== ANIM_LIFECYCLE.PLAYING) return;

    const checkScrollAway = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // If user has scrolled completely past or far away:
      if (rect.bottom < -180 || rect.top > window.innerHeight + 180) {
        interruptSequence("scrolled-away");
      }
    };

    window.addEventListener("scroll", checkScrollAway, { passive: true });
    return () => window.removeEventListener("scroll", checkScrollAway);
  }, [lifecycle, interruptSequence]);

  // Initial trigger on arrival into view (ONE TIME ONLY)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (prefersReducedMotion() || !checkWebGLSupport()) {
      lifecycleRef.current = ANIM_LIFECYCLE.COMPLETED;
      setLifecycle(ANIM_LIFECYCLE.COMPLETED);
      setDeliveredIds(new Set(certifications.map((c) => c.id)));
      return;
    }

    const triggerIfArrived = () => {
      if (lifecycleRef.current !== ANIM_LIFECYCLE.IDLE) return;
      if (window.scrollY < 200) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      // If user has already scrolled past Certifications, complete immediately without animation
      if (rect.bottom < 0) {
        if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
        lifecycleRef.current = ANIM_LIFECYCLE.COMPLETED;
        setLifecycle(ANIM_LIFECYCLE.COMPLETED);
        setIsQuickReveal(true);
        setDeliveredIds(new Set(certifications.map((c) => c.id)));
        return;
      }

      // If section has arrived in comfortable view
      if (rect.top <= vh * 0.65 && rect.bottom >= vh * 0.2) {
        if (prefersReducedMotion()) {
          lifecycleRef.current = ANIM_LIFECYCLE.COMPLETED;
          setLifecycle(ANIM_LIFECYCLE.COMPLETED);
          setDeliveredIds(new Set(certifications.map((c) => c.id)));
          return;
        }
        lifecycleRef.current = "PENDING_DELAY";
        delayTimerRef.current = setTimeout(() => {
          lifecycleRef.current = ANIM_LIFECYCLE.PLAYING;
          setLifecycle(ANIM_LIFECYCLE.PLAYING);
          setIsQuickReveal(false);
          setDeliveredIds(new Set());
          setRunCount((r) => r + 1);
        }, 1000);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerIfArrived();
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(el);

    window.addEventListener("scroll", triggerIfArrived, { passive: true });
    triggerIfArrived();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", triggerIfArrived);
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [certifications]);

  const handleReplayDelivery = () => {
    lifecycleRef.current = ANIM_LIFECYCLE.PLAYING;
    setLifecycle(ANIM_LIFECYCLE.PLAYING);
    setIsQuickReveal(false);
    setDeliveredIds(new Set());
    setActiveTargetId(null);
    setJustLandedId(null);
    setRunCount((r) => r + 1);
  };

  return h(
    "section",
    { id: "certifications", ref: sectionRef, className: "section-block" },
    // Section Header Bar
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
          "Certifications",
          h("span", { className: "red-dot" })
        )
      ),
      h(
        "button",
        {
          type: "button",
          className: "project-action-pill",
          onClick: () => onOpenJourneyExperience && onOpenJourneyExperience("journey-certificates")
        },
        "20/20 Certificate Wall (FlyRank Explore) →"
      )
    ),

    // Dual-Robot Telemetry & Control Bar
    h(
      "div",
      {
        className: "robot-telemetry-bar",
        role: "region",
        "aria-label": "Dual Robot Credential Delivery Controls"
      },
      h(
        "div",
        { className: "robot-telemetry-left" },
        // Twin Holopad Dock Icons
        h(
          "span",
          {
            className: `robot-holopad-dock bot-f01-dock-stage ${
              telemetry.active ? "is-bot-scanning" : "is-bot-docked"
            }`,
            title: "Robot A & Robot B Dual Dock"
          },
          h(
            "span",
            { style: { display: "inline-flex", alignItems: "center", gap: "4px" } },
            // Robot A mascot
            h(
              "svg",
              { width: 22, height: 22, viewBox: "0 0 100 100", fill: "none" },
              h("circle", { cx: 50, cy: 50, r: 42, fill: "#0F172A" }),
              h("rect", { x: 26, y: 38, width: 48, height: 24, rx: 12, fill: "#E11D48" }),
              h("circle", { cx: 40, cy: 50, r: 4.5, fill: "#FFFFFF" }),
              h("circle", { cx: 60, cy: 50, r: 4.5, fill: "#FFFFFF" })
            ),
            // Robot B mascot
            h(
              "svg",
              { width: 22, height: 22, viewBox: "0 0 100 100", fill: "none" },
              h("circle", { cx: 50, cy: 50, r: 42, fill: "#0F172A" }),
              h("rect", { x: 26, y: 38, width: 48, height: 24, rx: 12, fill: "#F59E0B" }),
              h("circle", { cx: 40, cy: 50, r: 4.5, fill: "#FFFFFF" }),
              h("circle", { cx: 60, cy: 50, r: 4.5, fill: "#FFFFFF" })
            )
          )
        ),
        h(
          "span",
          { className: "robot-unit-badge" },
          h("span", { className: "robot-unit-led" }),
          h("span", null, "DUAL ROBOTS · A & B")
        ),
        h(
          "span",
          {
            className: `robot-state-chip ${!telemetry.active ? "state-idle" : ""}`
          },
          telemetry.chip
        ),
        h(
          "span",
          { className: "robot-status-text" },
          telemetry.text
        )
      ),
      h(
        "div",
        { className: "robot-telemetry-actions" },
        h(
          "button",
          {
            type: "button",
            className: "robot-control-btn primary-replay",
            onClick: handleReplayDelivery,
            title: "Replay dual-side robot delivery sequence"
          },
          "Replay Delivery ↻"
        ),
        h(
          "button",
          {
            type: "button",
            className: "robot-control-btn",
            onClick: () => onOpenJourneyExperience && onOpenJourneyExperience("journey-certificates"),
            title: "Open 20/20 Anthropic Certificate Wall on FlyRank Internship Explore Page"
          },
          "Explore 20/20 Wall ↗"
        )
      )
    ),

    // Main Stage Container
    h(
      "div",
      { className: "bezel-outer" },
      h(
        "div",
        {
          ref: stageRef,
          className: "bezel-inner credentials-strip-container cert-squad-stage-inner cert-showcase-stage"
        },
        // Overlay Dual Robot 3D WebGL Canvas Layer
        h(DualRobotDeliveryScene, {
          containerRef: stageRef,
          slotRefsMap,
          certifications,
          runCount,
          controllerRef,
          onTargetRow: handleTargetRow,
          onRowDelivered: handleRowDelivered,
          onAllDelivered: handleAllDelivered,
          onTelemetryUpdate: handleTelemetryUpdate
        }),

        // Credentials Header (matching screenshot)
        h(
          "div",
          { className: "credentials-strip-header" },
          h(
            "span",
            { className: "credentials-strip-eyebrow" },
            h("span", { className: "red-dot", style: { width: 6, height: 6 } }),
            "PRIMARY INDUSTRY & ACADEMIC CREDENTIALS (7 VERIFIED TRACKS)"
          ),
          h(
            "span",
            { className: "credentials-strip-hint" },
            "Click 👁 to view scan or ↗ to verify"
          )
        ),

        // Vertically stacked credential row slots
        h(
          "div",
          { className: "cert-tiles-list", role: "list" },
          certifications.map((cert, idx) =>
            h(CertificationRow, {
              key: cert.id,
              cert,
              index: idx,
              isDelivered: deliveredIds.has(cert.id),
              isActiveTarget: activeTargetId === cert.id,
              isJustLanded: justLandedId === cert.id,
              isInstant: isQuickReveal || prefersReducedMotion(),
              slotRefCallback: registerSlotRef,
              onOpenModal,
              onOpenCertWall: onOpenJourneyExperience,
              onOpenJourney: onOpenJourneyExperience
            })
          )
        )
      )
    )
  );
}
