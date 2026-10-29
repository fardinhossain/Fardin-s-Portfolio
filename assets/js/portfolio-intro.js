// ==========================================================================
// FARDIN.AI — ROBOTIC PORTFOLIO ENTRANCE SEQUENCE
// Bot F-01 Futuristic Portal Access & Welcome Animation
// ==========================================================================

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import gsap from "gsap";

const STORAGE_KEY = "fardin_intro_seen";

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

export function hasSeenIntro() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch (_e) {
    return false;
  }
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(STORAGE_KEY, "true");
  } catch (_e) {}
}

export function resetIntroSeen() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (_e) {}
}

// --------------------------------------------------------------------------
// 3D MODEL BUILDERS
// --------------------------------------------------------------------------

function createPortalDoor3D(isDark) {
  const root = new THREE.Group();

  // High-contrast Architectural Materials for Light & Dark Themes
  const frameMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x181c26 : 0x7c8ba1,
    roughness: 0.25,
    metalness: isDark ? 0.75 : 0.6
  });

  const panelMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x0f141f : 0xd8e0e9,
    roughness: 0.18,
    metalness: isDark ? 0.4 : 0.35
  });

  const innerTrimMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x242b3d : 0xa4b1c2,
    roughness: 0.32,
    metalness: 0.5
  });

  const seamGlowMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.85
  });

  const scannerPadMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48
  });

  // 1. Heavy Outer Portal Frame
  const frameGroup = new THREE.Group();
  root.add(frameGroup);

  // Top arch header
  const topHeader = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.45, 0.4), frameMat);
  topHeader.position.set(0, 2.05, 0);
  frameGroup.add(topHeader);

  // Bottom threshold
  const bottomThresh = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.3, 0.6), frameMat);
  bottomThresh.position.set(0, -1.95, 0);
  frameGroup.add(bottomThresh);

  // Left & Right frame pillars
  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.8, 0.4), frameMat);
  leftPillar.position.set(-2.05, 0.05, 0);
  frameGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.8, 0.4), frameMat);
  rightPillar.position.set(2.05, 0.05, 0);
  frameGroup.add(rightPillar);

  // Neon Seam in Frame Header
  const headerStrip = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.04, 0.42), seamGlowMat);
  headerStrip.position.set(0, 1.95, 0);
  frameGroup.add(headerStrip);

  // 2. Sliding Left and Right Door Panels
  const leftDoor = new THREE.Group();
  leftDoor.position.set(-0.85, 0.05, 0.02);
  root.add(leftDoor);

  const leftPanelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.68, 3.6, 0.16), panelMat);
  leftDoor.add(leftPanelMesh);

  // Inset groove on left panel
  const leftGroove = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.1, 0.18), innerTrimMat);
  leftGroove.position.set(-0.1, 0, 0);
  leftDoor.add(leftGroove);

  const rightDoor = new THREE.Group();
  rightDoor.position.set(0.85, 0.05, 0.02);
  root.add(rightDoor);

  const rightPanelMesh = new THREE.Mesh(new THREE.BoxGeometry(1.68, 3.6, 0.16), panelMat);
  rightDoor.add(rightPanelMesh);

  // Inset groove on right panel
  const rightGroove = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.1, 0.18), innerTrimMat);
  rightGroove.position.set(0.1, 0, 0);
  rightDoor.add(rightGroove);

  // Center vertical seam glow between doors
  const centerSeam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 3.5, 0.19), seamGlowMat);
  centerSeam.position.set(0, 0.05, 0.02);
  root.add(centerSeam);

  // 3. Biometric Scanner Console (Right side)
  const scannerGroup = new THREE.Group();
  scannerGroup.position.set(1.78, 0.05, 0.22);
  root.add(scannerGroup);

  const scannerBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.5, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  scannerGroup.add(scannerBase);

  const scannerPad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.04, 24).rotateX(Math.PI / 2),
    scannerPadMat
  );
  scannerPad.position.set(0, 0.04, 0.06);
  scannerGroup.add(scannerPad);

  // Laser Scan Beam (Initially invisible)
  const laserBeamGeo = new THREE.CylinderGeometry(0.015, 0.015, 1, 8);
  const laserBeamMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0
  });
  const laserBeam = new THREE.Mesh(laserBeamGeo, laserBeamMat);
  root.add(laserBeam);

  // 4. Portal Interior Chamber (Revealed when doors open)
  const chamberGroup = new THREE.Group();
  chamberGroup.position.set(0, 0.05, -0.22);
  root.add(chamberGroup);

  const backWallMat = new THREE.MeshStandardMaterial({
    color: isDark ? 0x07090e : 0x1e293b,
    roughness: 0.35,
    metalness: 0.4
  });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 3.8), backWallMat);
  chamberGroup.add(backWall);

  // Inner illuminated energy ring
  const energyRingGeo = new THREE.RingGeometry(0.72, 0.82, 32);
  const energyRingMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide
  });
  const energyRing = new THREE.Mesh(energyRingGeo, energyRingMat);
  energyRing.position.set(0, 0, 0.02);
  chamberGroup.add(energyRing);

  // Soft interior radiance (Fades in when doors open)
  const portalGlowGeo = new THREE.PlaneGeometry(3.6, 3.7);
  const portalGlowMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const portalGlow = new THREE.Mesh(portalGlowGeo, portalGlowMat);
  portalGlow.position.set(0, 0, 0.01);
  chamberGroup.add(portalGlow);

  return {
    root,
    leftDoor,
    rightDoor,
    centerSeam,
    scannerPadMat,
    laserBeam,
    laserBeamMat,
    portalGlow,
    portalGlowMat
  };
}

function createIntroRobot3D() {
  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Materials
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.14,
    metalness: 0.06
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x050811,
    roughness: 0.15,
    metalness: 0.05
  });

  const eyeLedMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48
  });

  const eyeGlintMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.35,
    metalness: 0.8
  });

  const thrusterGlowMat = new THREE.MeshBasicMaterial({
    color: 0xe11d48,
    transparent: true,
    opacity: 0.9
  });

  // A. Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.48, 0);
  bodyPivot.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.38, 24, 20);
  headGeo.scale(1.15, 0.9, 0.95);
  const headMesh = new THREE.Mesh(headGeo, shellMat);
  headGroup.add(headMesh);

  // Obsidian Visor
  const visorGeo = new THREE.SphereGeometry(0.35, 20, 16);
  visorGeo.scale(1.04, 0.68, 0.62);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, -0.02, 0.16);
  headGroup.add(visorMesh);

  // Twin LED Eyes
  const eyeGeo = new THREE.CapsuleGeometry(0.045, 0.04, 8, 12).rotateZ(Math.PI * 0.5);
  const leftEye = new THREE.Mesh(eyeGeo, eyeLedMat);
  leftEye.position.set(-0.115, -0.01, 0.38);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeLedMat);
  rightEye.position.set(0.115, -0.01, 0.38);
  headGroup.add(rightEye);

  // Specular Glints
  const glintGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const leftGlint = new THREE.Mesh(glintGeo, eyeGlintMat);
  leftGlint.position.set(-0.095, 0.015, 0.42);
  headGroup.add(leftGlint);

  const rightGlint = new THREE.Mesh(glintGeo, eyeGlintMat);
  rightGlint.position.set(0.135, 0.015, 0.42);
  headGroup.add(rightGlint);

  // Antenna
  const antennaStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8),
    metalMat
  );
  antennaStem.position.set(0, 0.42, 0);
  headGroup.add(antennaStem);

  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), eyeLedMat);
  antennaTip.position.set(0, 0.51, 0);
  headGroup.add(antennaTip);

  // B. Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, -0.05, 0);
  bodyPivot.add(torsoGroup);

  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.48, 20);
  const torsoMesh = new THREE.Mesh(torsoGeo, shellMat);
  torsoGroup.add(torsoMesh);

  // Chest Heart Badge
  const badgeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.1, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
  );
  badgeMesh.position.set(0, 0.05, 0.26);
  torsoGroup.add(badgeMesh);

  const coreLed = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), eyeLedMat);
  coreLed.position.set(0, 0.05, 0.285);
  torsoGroup.add(coreLed);

  // C. Articulated Arms
  // Right Arm (Reaches out to scanner, waves)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.32, 0.1, 0);
  torsoGroup.add(rightArmGroup);

  const rightArmUpper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.045, 0.16, 8, 8),
    shellMat
  );
  rightArmUpper.position.set(0.04, -0.08, 0);
  rightArmGroup.add(rightArmUpper);

  const rightForearmGroup = new THREE.Group();
  rightForearmGroup.position.set(0.08, -0.16, 0);
  rightArmGroup.add(rightForearmGroup);

  const rightForearm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.04, 0.15, 8, 8),
    shellMat
  );
  rightForearm.position.set(0.02, -0.06, 0.04);
  rightForearmGroup.add(rightForearm);

  const rightGripper = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.07, 0.04),
    metalMat
  );
  rightGripper.position.set(0.03, -0.15, 0.06);
  rightForearmGroup.add(rightGripper);

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.32, 0.1, 0);
  torsoGroup.add(leftArmGroup);

  const leftArmMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.045, 0.24, 8, 8),
    shellMat
  );
  leftArmMesh.position.set(-0.04, -0.1, 0);
  leftArmGroup.add(leftArmMesh);

  // D. Dual Rear Thrusters
  const thrustersGroup = new THREE.Group();
  thrustersGroup.position.set(0, -0.22, -0.18);
  torsoGroup.add(thrustersGroup);

  const thrusterGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.16, 12);
  const leftCone = new THREE.Mesh(thrusterGeo, metalMat);
  leftCone.position.set(-0.13, 0, 0);
  thrustersGroup.add(leftCone);

  const rightCone = new THREE.Mesh(thrusterGeo, metalMat);
  rightCone.position.set(0.13, 0, 0);
  thrustersGroup.add(rightCone);

  // Thruster Plumes
  const plumeGeo = new THREE.ConeGeometry(0.07, 0.24, 12);
  plumeGeo.rotateX(Math.PI);
  const leftPlume = new THREE.Mesh(plumeGeo, thrusterGlowMat);
  leftPlume.position.set(-0.13, -0.16, 0);
  thrustersGroup.add(leftPlume);

  const rightPlume = new THREE.Mesh(plumeGeo, thrusterGlowMat);
  rightPlume.position.set(0.13, -0.16, 0);
  thrustersGroup.add(rightPlume);

  return {
    root,
    bodyPivot,
    headGroup,
    rightArmGroup,
    rightForearmGroup,
    eyeLedMat,
    leftPlume,
    rightPlume,
    thrusterGlowMat
  };
}

// --------------------------------------------------------------------------
// MAIN PORTFOLIO INTRO REACT COMPONENT
// --------------------------------------------------------------------------
export function PortfolioIntro({ onComplete, forceShow = false }) {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const [statusText, setStatusText] = useState("APPROACHING ACCESS PORTAL...");
  const [subText, setSubText] = useState("AI System Clearance Required");
  const [isGranted, setIsGranted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleFinish = useCallback((immediate = false) => {
    markIntroSeen();
    setIsExiting(true);
    if (immediate) {
      if (onComplete) onComplete();
    } else {
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 240);
    }
  }, [onComplete]);

  useEffect(() => {
    // If reduced motion is requested or WebGL isn't supported, finish immediately
    if (prefersReducedMotion() || !checkWebGLSupport()) {
      handleFinish(true);
      return;
    }

    // User manual scroll / gesture interruption:
    // Any scroll input (wheel, mobile swipe, arrow/page keys) immediately reveals the portfolio
    const onUserScrollInput = (e) => {
      if (e.type === "wheel") {
        if (Math.abs(e.deltaY) > 5 || Math.abs(e.deltaX) > 5) {
          handleFinish(true);
        }
        return;
      }
      if (e.type === "touchmove") {
        handleFinish(true);
        return;
      }
      if (e.type === "keydown") {
        const scrollKeys = [
          "ArrowDown", "ArrowUp", "PageDown", "PageUp",
          "Space", "End", "Home", "Escape", "Enter"
        ];
        if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key)) {
          if (e.key === "Escape" || e.code === "Space") e.preventDefault();
          handleFinish(true);
        }
      }
    };

    window.addEventListener("wheel", onUserScrollInput, { passive: true });
    window.addEventListener("touchmove", onUserScrollInput, { passive: true });
    window.addEventListener("keydown", onUserScrollInput);

    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance"
      });
    } catch (_e) {
      handleFinish();
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 7.8);

    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark";

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.35);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.4 : 1.6);
    mainLight.position.set(4, 5, 8);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xe11d48, 0.7);
    rimLight.position.set(-5, -2, -2);
    scene.add(rimLight);

    // Build 3D Door and Robot
    const door = createPortalDoor3D(isDark);
    scene.add(door.root);

    const bot = createIntroRobot3D();
    scene.add(bot.root);

    // Initial Robot Pose (High right, coming into view)
    bot.root.position.set(3.8, 2.4, 2.8);
    bot.root.rotation.set(-0.25, -0.4, 0.15);

    // Timeline Choreography
    const tl = gsap.timeline({
      onComplete: () => {
        handleFinish();
      }
    });

    // Phase 1 (0.0s - 0.75s): Robot Swoops Down & Approaches Scanner
    tl.to(
      bot.root.position,
      {
        x: 1.38,
        y: 0.18,
        z: 1.05,
        duration: 0.75,
        ease: "power2.out"
      },
      0
    );

    tl.to(
      bot.root.rotation,
      {
        x: 0.05,
        y: 0.28,
        z: -0.05,
        duration: 0.75,
        ease: "power2.out"
      },
      0
    );

    // Phase 2 (0.75s - 1.35s): Authentication
    tl.call(
      () => {
        setStatusText("AUTHENTICATING ENGINE...");
        setSubText("Scanning Identity Matrix • Md. Fardin Hossain");
      },
      null,
      0.75
    );

    // Bot raises arm towards scanner
    tl.to(
      bot.rightArmGroup.rotation,
      {
        x: -0.65,
        y: 0.85,
        z: 0.45,
        duration: 0.35,
        ease: "back.out(1.8)"
      },
      0.75
    );

    // Laser scan connects
    tl.call(
      () => {
        const start = new THREE.Vector3(1.65, 0.12, 1.05);
        const end = new THREE.Vector3(1.78, 0.09, 0.24);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        door.laserBeam.position.copy(mid);
        door.laserBeam.quaternion.setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3().subVectors(end, start).normalize()
        );
        door.laserBeam.scale.set(1, start.distanceTo(end), 1);
        door.laserBeamMat.opacity = 0.95;
      },
      null,
      0.9
    );

    // Authorization Granted: Switch to Green, Bot nods & blinks
    tl.call(
      () => {
        setIsGranted(true);
        setStatusText("ACCESS GRANTED • PORTAL UNLOCKED");
        setSubText("Welcome to Fardin's Intelligent Systems");
        door.scannerPadMat.color.setHex(0x10b981);
        bot.eyeLedMat.color.setHex(0x10b981);
        door.laserBeamMat.color.setHex(0x10b981);
      },
      null,
      1.15
    );

    // Bot head nod
    tl.to(
      bot.headGroup.rotation,
      {
        x: 0.32,
        duration: 0.16,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      },
      1.15
    );

    // Turn off scan beam
    tl.to(door.laserBeamMat, { opacity: 0, duration: 0.18 }, 1.32);

    // Phase 3 (1.35s - 2.05s): Doors Slide Open with Light Spill
    tl.call(
      () => {
        setStatusText("INITIALIZING ENVIRONMENT...");
        setSubText("Opening fardin.ai Portfolio Workspace");
      },
      null,
      1.35
    );

    // Sliding left & right doors apart
    tl.to(
      door.leftDoor.position,
      {
        x: -2.6,
        duration: 0.7,
        ease: "power3.inOut"
      },
      1.35
    );

    tl.to(
      door.rightDoor.position,
      {
        x: 2.6,
        duration: 0.7,
        ease: "power3.inOut"
      },
      1.35
    );

    tl.to(door.centerSeam.scale, { y: 0.01, duration: 0.4 }, 1.35);

    // Portal Radiance surges through
    tl.to(door.portalGlowMat, { opacity: 0.9, duration: 0.6, ease: "power2.in" }, 1.38);

    // Bot turns to face user and waves
    tl.to(
      bot.root.rotation,
      {
        x: -0.05,
        y: -0.2,
        z: 0.05,
        duration: 0.45,
        ease: "power2.out"
      },
      1.4
    );

    tl.to(
      bot.rightArmGroup.rotation,
      {
        x: -1.2,
        y: 0.2,
        z: 0.8,
        duration: 0.3,
        ease: "power2.out"
      },
      1.45
    );

    tl.to(
      bot.rightForearmGroup.rotation,
      {
        z: -0.5,
        duration: 0.14,
        yoyo: true,
        repeat: 3,
        ease: "sine.inOut"
      },
      1.65
    );

    // Phase 4 (2.0s - 2.45s): Camera pushes into the portal, Bot flies through
    tl.to(
      camera.position,
      {
        z: 4.8,
        duration: 0.45,
        ease: "power2.in"
      },
      2.0
    );

    tl.to(
      bot.root.position,
      {
        z: -0.5,
        y: 0.3,
        duration: 0.45,
        ease: "power2.in"
      },
      2.0
    );

    // Render loop
    let rafId;
    let clock = new THREE.Clock();

    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);
      const t = clock.getElapsedTime();

      // Gentle floating bob for the robot
      bot.bodyPivot.position.y = Math.sin(t * 5) * 0.04;
      bot.thrusterGlowMat.opacity = 0.75 + Math.sin(t * 16) * 0.25;

      renderer.render(scene, camera);
    };

    renderLoop();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("wheel", onUserScrollInput);
      window.removeEventListener("touchmove", onUserScrollInput);
      window.removeEventListener("keydown", onUserScrollInput);
      window.removeEventListener("resize", handleResize);
      tl.kill();
      if (rafId) cancelAnimationFrame(rafId);
      try {
        renderer.dispose();
      } catch (_e) {}
    };
  }, [handleFinish]);

  return React.createElement(
    "aside",
    {
      ref: overlayRef,
      className: `portfolio-intro-overlay ${isExiting ? "intro-fading" : ""}`,
      "aria-label": "Portfolio Entrance Animation",
      role: "dialog",
      "aria-modal": "true"
    },
    // Top Bar
    React.createElement(
      "div",
      { className: "intro-top-bar" },
      React.createElement(
        "div",
        { className: "intro-system-tag" },
        React.createElement("span", {
          className: `intro-system-beacon ${isGranted ? "beacon-granted" : ""}`
        }),
        "FARDIN.AI // GATEWAY F-01"
      ),
      React.createElement(
        "button",
        {
          type: "button",
          className: "intro-skip-btn",
          onClick: handleFinish,
          "aria-label": "Skip intro sequence"
        },
        React.createElement("span", null, "Skip Intro"),
        React.createElement("span", { className: "intro-kbd-hint" }, "ESC")
      )
    ),

    // 3D Canvas Mount Point
    React.createElement("div", {
      ref: containerRef,
      className: "intro-canvas-container"
    }),

    // Bottom Status HUD
    React.createElement(
      "div",
      { className: "intro-bottom-bar" },
      React.createElement(
        "div",
        { className: `intro-status-badge ${isGranted ? "status-granted" : ""}` },
        React.createElement("span", null, statusText)
      ),
      React.createElement("div", { className: "intro-status-sub" }, subText)
    )
  );
}
