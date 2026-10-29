// ==========================================================================
// FARDIN.AI — ROBOTIC THEME TRANSFORMATION & SYSTEM MANAGER
// Signature Feature: 3D Robot Theme Assistant (Bot F-01)
// Smoothly transforms the entire portfolio between Light & Dark themes
// ==========================================================================

import * as THREE from "three";
import gsap from "gsap";

const STORAGE_KEY = "fardin_theme";
const subscribers = new Set();
let isTransitioning = false;

// --------------------------------------------------------------------------
// 1. THEME STATE HELPERS
// --------------------------------------------------------------------------
export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch (_e) {}
  return "dark";
}

let currentTheme = getStoredTheme();

export function getCurrentTheme() {
  return currentTheme;
}

export function subscribeTheme(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers(theme) {
  subscribers.forEach((cb) => {
    try {
      cb(theme);
    } catch (_e) {}
  });
}

export function applyTheme(theme, persist = true) {
  currentTheme = theme;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_e) {}
  }
  notifySubscribers(theme);
}

// --------------------------------------------------------------------------
// 2. 3D ROBOT MASCOT GENERATOR (Theme Assistant Bot F-01)
// --------------------------------------------------------------------------
function createThemeRobot3D(targetTheme) {
  const isDarkTarget = targetTheme === "dark";
  const primaryLedColor = isDarkTarget ? 0xff304f : 0xfacc15;
  const secondaryLedColor = isDarkTarget ? 0xf43f5e : 0xf59e0b;

  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Shell materials: glossy white porcelain with subtle metallic sheen
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

  const eyeGeo = new THREE.CapsuleGeometry(0.05, 0.045, 8, 12).rotateZ(Math.PI * 0.5);

  const leftEye = new THREE.Mesh(eyeGeo, primaryLedMat);
  leftEye.position.set(-0.135, 0, 0);
  eyeGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, primaryLedMat);
  rightEye.position.set(0.135, 0, 0);
  eyeGroup.add(rightEye);

  // Specular Glints
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
  headGroup.add(antennaStem);

  const antennaTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    secondaryLedMat
  );
  antennaTip.position.set(0, 0.58, 0);
  headGroup.add(antennaTip);

  // --- B. TORSO & CHASSIS ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 0, 0);
  bodyPivot.add(torsoGroup);

  // Neck collar ring
  const neckRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.28, 0.08, 20),
    darkJointMat
  );
  neckRing.position.set(0, 0.28, 0);
  torsoGroup.add(neckRing);

  // Main Torso Capsule
  const torsoGeo = new THREE.CapsuleGeometry(0.34, 0.38, 12, 20);
  const torsoMesh = new THREE.Mesh(torsoGeo, whiteShellMat);
  torsoGroup.add(torsoMesh);

  // Crimson / Accent Collar Trim Ring
  const collarTrimGeo = new THREE.TorusGeometry(0.35, 0.022, 8, 28);
  collarTrimGeo.rotateX(Math.PI * 0.5);
  const collarTrim = new THREE.Mesh(collarTrimGeo, primaryLedMat);
  collarTrim.position.set(0, 0.16, 0);
  torsoGroup.add(collarTrim);

  // Chest AI Core Badge
  const coreOuterGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.04, 20).rotateX(Math.PI * 0.5);
  const coreOuter = new THREE.Mesh(coreOuterGeo, darkJointMat);
  coreOuter.position.set(0, 0.02, 0.33);
  torsoGroup.add(coreOuter);

  const coreInnerGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.05, 16).rotateX(Math.PI * 0.5);
  const coreInner = new THREE.Mesh(coreInnerGeo, primaryLedMat);
  coreInner.position.set(0, 0.02, 0.34);
  torsoGroup.add(coreInner);

  // --- C. MECHANICAL ARMS ---
  function buildArm(isLeft) {
    const armGroup = new THREE.Group();
    const side = isLeft ? -1 : 1;
    armGroup.position.set(side * 0.42, 0.12, 0);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), darkJointMat);
    armGroup.add(shoulder);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.16, 8, 12), whiteShellMat);
    upperArm.position.set(side * 0.04, -0.1, 0.02);
    upperArm.rotation.z = side * 0.2;
    armGroup.add(upperArm);

    const forearmPivot = new THREE.Group();
    forearmPivot.position.set(side * 0.08, -0.22, 0.04);
    armGroup.add(forearmPivot);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.13, 8, 12), whiteShellMat);
    forearm.position.set(0, -0.06, 0.04);
    forearmPivot.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), softGrayMat);
    hand.position.set(0, -0.14, 0.06);
    forearmPivot.add(hand);

    return { armGroup, forearmPivot, hand };
  }

  const leftArm = buildArm(true);
  const rightArm = buildArm(false);
  torsoGroup.add(leftArm.armGroup);
  torsoGroup.add(rightArm.armGroup);

  // --- D. JET THRUSTER EXHAUST ---
  const thrusterGroup = new THREE.Group();
  thrusterGroup.position.set(0, -0.38, 0);
  torsoGroup.add(thrusterGroup);

  const nozzleGeo = new THREE.ConeGeometry(0.18, 0.2, 18, 1, true);
  nozzleGeo.rotateX(Math.PI);
  const nozzleMesh = new THREE.Mesh(nozzleGeo, darkJointMat);
  thrusterGroup.add(nozzleMesh);

  const antigravRingGeo = new THREE.TorusGeometry(0.18, 0.022, 8, 24).rotateX(Math.PI * 0.5);
  const antigravRing = new THREE.Mesh(antigravRingGeo, primaryLedMat);
  antigravRing.position.set(0, -0.02, 0);
  thrusterGroup.add(antigravRing);

  // Inner flame cone
  const flameGeo = new THREE.ConeGeometry(0.12, 0.35, 16);
  flameGeo.rotateX(Math.PI);
  const flameMat = new THREE.MeshBasicMaterial({
    color: primaryLedColor,
    transparent: true,
    opacity: 0.85
  });
  const flameMesh = new THREE.Mesh(flameGeo, flameMat);
  flameMesh.position.set(0, -0.18, 0);
  thrusterGroup.add(flameMesh);

  return {
    root,
    bodyPivot,
    headGroup,
    eyeGroup,
    leftEye,
    rightEye,
    leftArm,
    rightArm,
    flameMesh,
    flameMat,
    materials: [
      whiteShellMat,
      softGrayMat,
      darkJointMat,
      visorMat,
      primaryLedMat,
      secondaryLedMat,
      glintMat,
      flameMat
    ]
  };
}

// --------------------------------------------------------------------------
// 3. CINEMATIC ROBOTIC THEME TRANSFORMATION CONTROLLER
// --------------------------------------------------------------------------
export function launchRobotThemeTransition(targetTheme, triggerRect) {
  if (isTransitioning) return Promise.resolve();
  isTransitioning = true;

  // Check reduced motion preference
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    applyTheme(targetTheme);
    isTransitioning = false;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create fixed overlay canvas layer
    const overlay = document.createElement("div");
    overlay.className = "theme-robot-canvas-layer";
    document.body.appendChild(overlay);

    // Setup Three.js WebGL Renderer
    const scene = new THREE.Scene();
    const cameraFov = 40;
    const cameraZ = 12.0;
    const camera = new THREE.PerspectiveCamera(cameraFov, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraZ);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
    } catch (_e) {
      // Fallback if WebGL fails
      applyTheme(targetTheme);
      overlay.remove();
      isTransitioning = false;
      resolve();
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    overlay.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(5, 8, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffdbe0, 1.2);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);

    // Coordinate conversion: Viewport pixels to 3D world space
    const vH = 2 * Math.tan((cameraFov * Math.PI) / 360) * cameraZ;
    const vW = vH * (width / height);

    function domToWorld(px, py) {
      const wx = (px / width - 0.5) * vW;
      const wy = -(py / height - 0.5) * vH;
      return new THREE.Vector3(wx, wy, 0);
    }

    // Default trigger origin: top-right navbar area
    const originX = triggerRect ? triggerRect.left + triggerRect.width * 0.5 : width * 0.88;
    const originY = triggerRect ? triggerRect.top + triggerRect.height * 0.5 : 44;
    const startWorld = domToWorld(originX, originY);
    startWorld.z = 0.5;

    // Create Robot Model
    const robot = createThemeRobot3D(targetTheme);
    const baseScale = width < 640 ? 0.95 : 1.25;
    robot.root.scale.setScalar(baseScale);
    robot.root.position.copy(startWorld);
    scene.add(robot.root);

    // Particle Trail Emitter Pool (120 particles)
    const maxParticles = 120;
    const particles = [];
    const particleColors =
      targetTheme === "dark"
        ? [0xff304f, 0xf43f5e, 0xc084fc, 0xfb7185, 0xffffff]
        : [0xfacc15, 0xf59e0b, 0xfde047, 0xffffff, 0xfbbf24];

    const pGeo = new THREE.SphereGeometry(0.045, 8, 8);
    for (let i = 0; i < maxParticles; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: particleColors[i % particleColors.length],
        transparent: true,
        opacity: 0
      });
      const mesh = new THREE.Mesh(pGeo, pMat);
      mesh.visible = false;
      scene.add(mesh);
      particles.push({
        mesh,
        mat: pMat,
        life: 0,
        maxLife: 0.55,
        vel: new THREE.Vector3()
      });
    }

    let pCursor = 0;
    function emitParticle(pos) {
      const p = particles[pCursor];
      pCursor = (pCursor + 1) % maxParticles;
      p.life = p.maxLife;
      p.mesh.visible = true;
      p.mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.12,
        pos.y - 0.35 * baseScale + (Math.random() - 0.5) * 0.08,
        pos.z + (Math.random() - 0.5) * 0.06
      );
      p.mesh.scale.setScalar(0.7 + Math.random() * 0.7);
      p.vel.set(
        (Math.random() - 0.5) * 0.5,
        -0.8 - Math.random() * 0.6,
        (Math.random() - 0.5) * 0.3
      );
    }

    // Bézier Flight Path Definition
    // 1. Start: near toggle button
    // 2. Control Point 1: sweeps across upper-mid quadrant
    // 3. Control Point 2: swoops deep through center-bottom
    // 4. End Point: settles near toggle or left arc
    const p0 = startWorld.clone();
    const p1 = new THREE.Vector3(vW * 0.1, vH * 0.28, 1.4);
    const p2 = new THREE.Vector3(-vW * 0.22, -vH * 0.18, 1.8);
    const p3 = new THREE.Vector3(-vW * 0.05, vH * 0.12, 1.2);
    const pEnd = startWorld.clone();

    function evalCubicBezier(a, b, c, d, t, out) {
      const it = 1 - t;
      const it2 = it * it;
      const it3 = it2 * it;
      const t2 = t * t;
      const t3 = t2 * t;
      out.x = it3 * a.x + 3 * it2 * t * b.x + 3 * it * t2 * c.x + t3 * d.x;
      out.y = it3 * a.y + 3 * it2 * t * b.y + 3 * it * t2 * c.y + t3 * d.y;
      out.z = it3 * a.z + 3 * it2 * t * b.z + 3 * it * t2 * c.z + t3 * d.z;
      return out;
    }

    // Animation Loop
    let rafId;
    let lastTime = performance.now();
    let themeFlipped = false;

    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Update particle physics
      particles.forEach((p) => {
        if (p.life > 0) {
          p.life -= dt;
          p.mesh.position.addScaledVector(p.vel, dt);
          p.mat.opacity = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) p.mesh.visible = false;
        }
      });

      // Subtle thruster flame flicker
      robot.flameMesh.scale.y = 0.9 + Math.random() * 0.35;
      robot.flameMesh.scale.x = 0.95 + Math.random() * 0.2;

      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    // Master GSAP Choreography Timeline (~1.18s)
    const tl = gsap.timeline({
      onComplete: () => {
        cancelAnimationFrame(rafId);
        robot.materials.forEach((m) => m.dispose());
        pGeo.dispose();
        particles.forEach((p) => p.mat.dispose());
        renderer.dispose();
        overlay.remove();
        isTransitioning = false;
        resolve();
      }
    });

    // Phase 1: Activation & Greeting (0.0s - 0.22s)
    robot.root.scale.set(0.1, 0.1, 0.1);
    tl.to(robot.root.scale, {
      x: baseScale,
      y: baseScale,
      z: baseScale,
      duration: 0.22,
      ease: "back.out(2)"
    });

    // Eye blink & nod
    tl.to(
      robot.eyeGroup.scale,
      {
        y: 0.15,
        duration: 0.08,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      },
      0.08
    );

    // Right arm wave
    tl.to(
      robot.rightArm.armGroup.rotation,
      {
        z: -0.65,
        x: 0.35,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      },
      0.06
    );

    // Phase 2: Cosmic Sweep Across Viewport (0.24s - 0.78s)
    const flightObj = { t: 0 };
    tl.to(
      flightObj,
      {
        t: 1,
        duration: 0.54,
        ease: "power2.inOut",
        onUpdate: () => {
          evalCubicBezier(p0, p1, p2, p3, flightObj.t, robot.root.position);
          // Banking angle based on lateral motion
          const bank = Math.sin(flightObj.t * Math.PI) * 0.42;
          robot.bodyPivot.rotation.z = -bank;
          robot.bodyPivot.rotation.y = bank * 0.5;
          robot.bodyPivot.rotation.x = 0.15;

          // Emit particle trail
          emitParticle(robot.root.position);
          emitParticle(robot.root.position);

          // Trigger global theme flip at flight apex
          if (flightObj.t >= 0.48 && !themeFlipped) {
            themeFlipped = true;
            applyTheme(targetTheme);
          }
        }
      },
      0.24
    );

    // Phase 3: Celebratory Spin & Bob (0.78s - 1.02s)
    tl.to(
      robot.bodyPivot.rotation,
      {
        y: Math.PI * 2,
        x: 0,
        z: 0,
        duration: 0.24,
        ease: "power1.inOut"
      },
      0.78
    );

    // Excited eye flash
    tl.to(
      robot.eyeGroup.scale,
      {
        x: 1.25,
        y: 1.25,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      },
      0.82
    );

    // Phase 4: Smooth Return & Dissolve into Toggle (1.02s - 1.18s)
    const returnObj = { t: 0 };
    tl.to(
      returnObj,
      {
        t: 1,
        duration: 0.22,
        ease: "power2.in",
        onUpdate: () => {
          evalCubicBezier(p3, p3, pEnd, pEnd, returnObj.t, robot.root.position);
          emitParticle(robot.root.position);
        }
      },
      0.96
    );

    tl.to(
      robot.root.scale,
      {
        x: 0.05,
        y: 0.05,
        z: 0.05,
        duration: 0.18,
        ease: "power2.in"
      },
      1.0
    );
  });
}
