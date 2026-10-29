// ==========================================================================
// FARDIN.AI — ROBOT-GUIDED VERTICAL EXPERIENCE TIMELINE (#experience)
// Features:
//   - Displays ONLY the FlyRank AI Machine Learning Internship (Jul–Oct 2026)
//   - 3 concise achievement highlights + client-grouped holdout context
//   - Cute white-and-red 3D robot that enters from above, floats down the
//     vertical timeline, illuminates the red milestone, reveals the card,
//     pauses to wave, and settles beside the "Explore Internship ->" CTA.
// ==========================================================================

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { createFlyingRobot3D } from "./project-showcase-3d.js";

const h = React.createElement;

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
// 1. 3D ROBOT TIMELINE SCENE (`ExperienceRobotScene`)
// --------------------------------------------------------------------------
export function ExperienceRobotScene({
  nodeTopRef,
  nodeMidRef,
  nodeBotRef,
  runTrigger,
  ctaHovered,
  onProgressUpdate
}) {
  const mountRef = useRef(null);
  const controllerRef = useRef(null);
  const latestCallbacksRef = useRef({ onProgressUpdate, ctaHovered });

  useEffect(() => {
    latestCallbacksRef.current = { onProgressUpdate, ctaHovered };
  }, [onProgressUpdate, ctaHovered]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !checkWebGLSupport()) return;

    const reducedMotion = prefersReducedMotion();
    const isMobile = window.innerWidth < 640;

    const width = Math.max(260, container.clientWidth);
    const height = Math.max(340, container.clientHeight);

    const scene = new THREE.Scene();
    const cameraFov = 34;
    const cameraZ = 12;
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
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Soft studio lighting for glossy white porcelain shell + red LED details
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 8, 9);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffe4e6, 0.9);
    rimLight.position.set(-5, 4, -3);
    scene.add(rimLight);

    const milestoneGlowLight = new THREE.PointLight(0xe11d48, 0.8, 4.5);
    scene.add(milestoneGlowLight);

    // Build the 3D robot assistant (cargo hidden; timeline guide configuration)
    const robot = createFlyingRobot3D();
    robot.cargoPivot.visible = false;
    robot.scanBeamGroup.visible = false;
    scene.add(robot.root);

    // Subtle red particle trail pool (lightweight)
    const maxParticles = isMobile ? 12 : 24;
    const particleGeo = new THREE.SphereGeometry(0.048, 8, 8);
    const particles = [];
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    for (let i = 0; i < maxParticles; i++) {
      const pMat = new THREE.MeshBasicMaterial({
        color: i % 4 === 0 ? 0xfb7185 : 0xe11d48,
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

    let particleIdx = 0;
    function getVisibleBounds() {
      const cW = Math.max(260, container.clientWidth);
      const cH = Math.max(340, container.clientHeight);
      const vH = 2 * Math.tan((cameraFov * Math.PI) / 360) * cameraZ;
      const vW = vH * (cW / cH);
      const pxPerUnit = cH / vH;
      return { cW, cH, vW, vH, pxPerUnit };
    }

    function computeRobotScale() {
      const { cW, pxPerUnit } = getVisibleBounds();
      // Keep the timeline guide robot crisp (~64px tall on desktop, ~42px on mobile)
      const desiredUnitPx = cW < 640 ? 22 : 34;
      return desiredUnitPx / Math.max(20, pxPerUnit);
    }

    let baseScale = computeRobotScale();
    robot.root.scale.setScalar(baseScale);

    function spawnParticle(pos) {
      if (reducedMotion) return;
      const p = particles[particleIdx];
      particleIdx = (particleIdx + 1) % maxParticles;
      p.life = p.maxLife;
      p.mesh.visible = true;
      p.mesh.position.set(
        pos.x + (Math.random() - 0.5) * 0.1 * baseScale,
        pos.y - 0.35 * baseScale,
        pos.z - 0.05
      );
      p.mesh.scale.setScalar(baseScale * (0.7 + Math.random() * 0.4));
      p.vel.set(
        (Math.random() - 0.5) * 0.25 * baseScale,
        -0.45 * baseScale,
        0
      );
    }

    function domPointToWorld(px, py) {
      const { cW, cH, vW, vH } = getVisibleBounds();
      const wx = (px / cW - 0.5) * vW;
      const wy = (0.5 - py / cH) * vH;
      return new THREE.Vector3(wx, wy, 0);
    }

    function getMilestoneWorldPositions() {
      const cRect = container.getBoundingClientRect();
      const topEl = nodeTopRef.current;
      const midEl = nodeMidRef.current;
      const botEl = nodeBotRef.current;

      if (cRect.width > 0 && cRect.height > 0 && topEl && midEl && botEl) {
        const tR = topEl.getBoundingClientRect();
        const mR = midEl.getBoundingClientRect();
        const bR = botEl.getBoundingClientRect();

        const topW = domPointToWorld(
          tR.left - cRect.left + tR.width * 0.5,
          tR.top - cRect.top + tR.height * 0.5
        );
        const midW = domPointToWorld(
          mR.left - cRect.left + mR.width * 0.5,
          mR.top - cRect.top + mR.height * 0.5
        );
        const botW = domPointToWorld(
          bR.left - cRect.left + bR.width * 0.5,
          bR.top - cRect.top + bR.height * 0.5
        );
        return { topW, midW, botW };
      }

      const { vW, vH } = getVisibleBounds();
      const railX = -vW * 0.41;
      return {
        topW: new THREE.Vector3(railX, vH * 0.38, 0),
        midW: new THREE.Vector3(railX, vH * 0.12, 0),
        botW: new THREE.Vector3(railX, -vH * 0.38, 0)
      };
    }

    // Sequence State Machine:
    // "WAITING" -> "STEP1_ENTER" -> "STEP2_DESCEND_MID" -> "STEP3_HIGHLIGHT_WAVE" -> "STEP5_DESCEND_BOT" -> "STEP6_SETTLED"
    const seq = {
      phase: reducedMotion ? "STEP6_SETTLED" : "WAITING",
      elapsed: 0,
      currentPos: new THREE.Vector3(),
      prevPos: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      blinkTimer: 0,
      notifiedTop: reducedMotion,
      notifiedMid: reducedMotion,
      notifiedCard: reducedMotion,
      notifiedBot: reducedMotion
    };

    const initNodes = getMilestoneWorldPositions();
    if (reducedMotion) {
      seq.currentPos.copy(initNodes.botW);
    } else {
      seq.currentPos.set(initNodes.topW.x - 0.6 * baseScale, initNodes.topW.y + 1.6 * baseScale, 0.3);
    }
    seq.prevPos.copy(seq.currentPos);
    robot.root.position.copy(seq.currentPos);

    function emitProgress(fillPct, topLit, midLit, cardRevealed, botLit) {
      if (latestCallbacksRef.current.onProgressUpdate) {
        latestCallbacksRef.current.onProgressUpdate({
          fillPct,
          topLit,
          midLit,
          cardRevealed,
          botLit
        });
      }
    }

    function startGuidedSequence() {
      if (reducedMotion) {
        emitProgress(100, true, true, true, true);
        return;
      }
      seq.phase = "STEP1_ENTER";
      seq.elapsed = 0;
      seq.notifiedTop = false;
      seq.notifiedMid = false;
      seq.notifiedCard = false;
      seq.notifiedBot = false;
      emitProgress(0, false, false, false, false);
    }

    controllerRef.current = { startGuidedSequence };

    // Pause rendering when off-screen
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
      const w = Math.max(260, container.clientWidth);
      const h = Math.max(340, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      baseScale = computeRobotScale();
      robot.root.scale.setScalar(baseScale);
      if (seq.phase === "STEP6_SETTLED") {
        const { botW } = getMilestoneWorldPositions();
        seq.currentPos.copy(botW);
        robot.root.position.copy(seq.currentPos);
      }
    };
    window.addEventListener("resize", onResize);

    let rafId = null;
    let lastTime = performance.now();
    const p0 = new THREE.Vector3();
    const p1 = new THREE.Vector3();
    const p2 = new THREE.Vector3();
    const p3 = new THREE.Vector3();

    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      if (!isVisible || document.hidden) return;

      const tSec = now * 0.001;
      baseScale = computeRobotScale();
      robot.root.scale.setScalar(baseScale);

      const { topW, midW, botW } = getMilestoneWorldPositions();
      seq.prevPos.copy(seq.currentPos);

      let targetYaw = 0.15;

      if (seq.phase === "STEP1_ENTER") {
        // Step 1: Enter from above along a smooth curved flight path to top milestone
        const duration = 0.55;
        seq.elapsed += dt;
        const u = Math.min(1, seq.elapsed / duration);
        const eased = easeInOutCubic(u);

        p0.set(topW.x + 0.65 * baseScale, topW.y + 1.45 * baseScale, 0.35);
        p1.set(topW.x - 0.35 * baseScale, topW.y + 0.95 * baseScale, 0.25);
        p2.set(topW.x + 0.2 * baseScale, topW.y + 0.35 * baseScale, 0.1);
        p3.copy(topW);

        evalCubicBezier3D(p0, p1, p2, p3, eased, seq.currentPos);
        spawnParticle(seq.currentPos);

        if (u >= 0.75 && !seq.notifiedTop) {
          seq.notifiedTop = true;
          emitProgress(10, true, false, false, false);
        }

        if (u >= 1) {
          seq.phase = "STEP2_DESCEND_MID";
          seq.elapsed = 0;
        }
      } else if (seq.phase === "STEP2_DESCEND_MID") {
        // Step 2: Gently float downward along the vertical timeline toward the internship milestone
        const duration = 0.68;
        seq.elapsed += dt;
        const u = Math.min(1, seq.elapsed / duration);
        const eased = easeInOutCubic(u);

        p0.copy(topW);
        p1.set(topW.x + 0.28 * baseScale, THREE.MathUtils.lerp(topW.y, midW.y, 0.35), 0.15);
        p2.set(midW.x - 0.18 * baseScale, THREE.MathUtils.lerp(topW.y, midW.y, 0.72), 0.1);
        p3.copy(midW);

        evalCubicBezier3D(p0, p1, p2, p3, eased, seq.currentPos);
        spawnParticle(seq.currentPos);

        // Step 3 & 4: As it approaches the internship milestone, eyes glow, marker highlights & card reveals
        const fillPct = Math.round(10 + eased * 42);
        const approaching = u >= 0.62;
        if (approaching && !seq.notifiedCard) {
          seq.notifiedCard = true;
        }
        emitProgress(fillPct, true, approaching, seq.notifiedCard, false);

        if (approaching) {
          robot.leftEye.scale.set(1.28, 1.28, 1.2);
          robot.rightEye.scale.set(1.28, 1.28, 1.2);
          milestoneGlowLight.intensity = 1.65;
        }

        if (u >= 1) {
          seq.phase = "STEP3_HIGHLIGHT_WAVE";
          seq.elapsed = 0;
          emitProgress(54, true, true, true, false);
        }
      } else if (seq.phase === "STEP3_HIGHLIGHT_WAVE") {
        // Step 5: Pause beside the internship card, turn toward it, and perform a friendly hover & wave
        const duration = 0.85;
        seq.elapsed += dt;
        const u = Math.min(1, seq.elapsed / duration);

        seq.currentPos.set(
          midW.x + Math.sin(u * Math.PI) * 0.12 * baseScale,
          midW.y + Math.sin(u * Math.PI * 2) * 0.08 * baseScale,
          0.18
        );

        // Turn toward the internship card on the right and wave right arm
        targetYaw = 0.42;
        robot.rightArmGroup.rotation.z = -2.15 + Math.sin(u * Math.PI * 6) * 0.38;
        robot.leftEye.scale.set(1.2, 0.65, 1);
        robot.rightEye.scale.set(1.2, 0.65, 1);
        milestoneGlowLight.intensity = 1.4;

        if (u >= 1) {
          robot.rightArmGroup.rotation.z = 0;
          robot.leftEye.scale.set(1, 1, 1);
          robot.rightEye.scale.set(1, 1, 1);
          milestoneGlowLight.intensity = 0.8;
          seq.phase = "STEP5_DESCEND_BOT";
          seq.elapsed = 0;
        }
      } else if (seq.phase === "STEP5_DESCEND_BOT") {
        // Step 6a: Continue downward along the vertical timeline to the bottom Explore Internship CTA
        const duration = 0.82;
        seq.elapsed += dt;
        const u = Math.min(1, seq.elapsed / duration);
        const eased = easeInOutCubic(u);

        p0.copy(midW);
        p1.set(midW.x + 0.32 * baseScale, THREE.MathUtils.lerp(midW.y, botW.y, 0.35), 0.16);
        p2.set(botW.x - 0.18 * baseScale, THREE.MathUtils.lerp(midW.y, botW.y, 0.72), 0.12);
        p3.copy(botW);

        evalCubicBezier3D(p0, p1, p2, p3, eased, seq.currentPos);
        spawnParticle(seq.currentPos);

        const fillPct = Math.round(54 + eased * 46);
        emitProgress(fillPct, true, true, true, u >= 0.85);

        if (u >= 1) {
          seq.phase = "STEP6_SETTLED";
          seq.elapsed = 0;
          emitProgress(100, true, true, true, true);
        }
      } else if (seq.phase === "STEP6_SETTLED") {
        // Step 6b: Settle beside the Explore Internship CTA at the bottom milestone
        const hoverShiftX = latestCallbacksRef.current.ctaHovered ? 0.18 * baseScale : 0;
        seq.currentPos.set(
          botW.x + hoverShiftX + Math.cos(tSec * 1.8) * 0.03 * baseScale,
          botW.y + Math.sin(tSec * 2.6) * 0.08 * baseScale,
          0.1
        );
        targetYaw = latestCallbacksRef.current.ctaHovered ? 0.45 : 0.22;

        // Gentle friendly wave when user hovers "Explore Internship ->"
        if (latestCallbacksRef.current.ctaHovered) {
          robot.rightArmGroup.rotation.z = -2.1 + Math.sin(tSec * 14) * 0.35;
        } else {
          robot.rightArmGroup.rotation.z = THREE.MathUtils.lerp(
            robot.rightArmGroup.rotation.z,
            0,
            dt * 6
          );
        }

        // Periodic natural blink
        seq.blinkTimer += dt;
        if (seq.blinkTimer > 3.2) {
          const bp = (seq.blinkTimer - 3.2) / 0.15;
          if (bp < 1) {
            const sy = Math.max(0.12, Math.abs(Math.cos(bp * Math.PI)));
            robot.leftEye.scale.y = sy;
            robot.rightEye.scale.y = sy;
          } else {
            robot.leftEye.scale.y = 1;
            robot.rightEye.scale.y = 1;
            seq.blinkTimer = 0;
          }
        }
      }

      // Apply robot transform & natural banking tilt
      robot.root.position.copy(seq.currentPos);
      milestoneGlowLight.position.set(
        seq.currentPos.x,
        seq.currentPos.y,
        seq.currentPos.z + 0.8
      );

      seq.velocity.subVectors(seq.currentPos, seq.prevPos).divideScalar(dt);
      const roll = THREE.MathUtils.clamp(-seq.velocity.x * 0.06, -0.32, 0.32);
      const pitch = THREE.MathUtils.clamp(seq.velocity.y * 0.04, -0.24, 0.24);

      robot.bodyPivot.rotation.z = THREE.MathUtils.lerp(
        robot.bodyPivot.rotation.z,
        roll,
        Math.min(1, dt * 10)
      );
      robot.bodyPivot.rotation.x = THREE.MathUtils.lerp(
        robot.bodyPivot.rotation.x,
        pitch,
        Math.min(1, dt * 10)
      );
      robot.headGroup.rotation.y = THREE.MathUtils.lerp(
        robot.headGroup.rotation.y,
        targetYaw,
        Math.min(1, dt * 8)
      );

      // Thruster & hover-legs animation
      const speed = seq.velocity.length();
      robot.thrusterFlame.scale.set(
        1,
        0.85 + Math.min(0.5, speed * 0.08) + Math.sin(tSec * 24) * 0.1,
        1
      );
      robot.antigravRing.scale.setScalar(0.9 + Math.sin(tSec * 9) * 0.1);

      // Update particle trail
      for (let i = 0; i < maxParticles; i++) {
        const p = particles[i];
        if (p.life > 0) {
          p.life -= dt;
          if (p.life <= 0) {
            p.mesh.visible = false;
          } else {
            p.mesh.position.addScaledVector(p.vel, dt);
            const r = p.life / p.maxLife;
            p.mat.opacity = r * 0.6;
          }
        }
      }

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

  useEffect(() => {
    if (runTrigger > 0 && controllerRef.current) {
      controllerRef.current.startGuidedSequence();
    }
  }, [runTrigger]);

  return h("div", {
    ref: mountRef,
    className: "exp-robot-canvas-layer",
    "aria-hidden": "true"
  });
}

// --------------------------------------------------------------------------
// 2. EXPERIENCE SECTION COMPONENT (`ExperienceTimelineSection`)
// Shows ONLY the FlyRank AI Machine Learning Internship guided by the 3D robot.
// --------------------------------------------------------------------------
export function ExperienceTimelineSection({ onExploreInternship }) {
  const sectionRef = useRef(null);
  const nodeTopRef = useRef(null);
  const nodeMidRef = useRef(null);
  const nodeBotRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  const [runTrigger, setRunTrigger] = useState(0);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [timelineState, setTimelineState] = useState(() => {
    const instant = prefersReducedMotion() || !checkWebGLSupport();
    return {
      fillPct: instant ? 100 : 0,
      topLit: instant,
      midLit: instant,
      cardRevealed: true, // Always readable for screen readers / instant visitors; animates smoothly on entry
      botLit: instant
    };
  });
  const [cardAnimKey, setCardAnimKey] = useState(0);

  // Trigger the sequence ONCE when the Experience section enters the viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (prefersReducedMotion() || !checkWebGLSupport()) {
      setTimelineState({
        fillPct: 100,
        topLit: true,
        midLit: true,
        cardRevealed: true,
        botLit: true
      });
      return;
    }

    const checkExpScroll = () => {
      if (hasTriggeredRef.current) return;
      if (window.scrollY < 150) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      if (rect.top <= vh * 0.55 && rect.bottom >= vh * 0.2) {
        hasTriggeredRef.current = true;
        setTimelineState({
          fillPct: 0,
          topLit: false,
          midLit: false,
          cardRevealed: false,
          botLit: false
        });
        setRunTrigger((c) => c + 1);
      }
    };

    window.addEventListener("scroll", checkExpScroll, { passive: true });
    checkExpScroll();

    return () => {
      window.removeEventListener("scroll", checkExpScroll);
    };
  }, []);

  const handleProgressUpdate = (next) => {
    setTimelineState((prev) => {
      if (!prev.cardRevealed && next.cardRevealed) {
        setCardAnimKey((k) => k + 1);
      }
      return next;
    });
  };

  return h(
    "section",
    { id: "experience", ref: sectionRef, className: "section-block" },
    // Section Header
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
          "Experience",
          h("span", { className: "red-dot" })
        )
      ),
      h(
        "span",
        { className: "exp-timeline-top-tag" },
        h("span", { className: "red-dot", style: { width: 6, height: 6 } }),
        "Bot-Guided Timeline"
      )
    ),

    // Outer Double-Bezel Stage
    h(
      "div",
      { className: "bezel-outer" },
      h(
        "div",
        { className: "bezel-inner exp-robot-stage" },
        // 3D Flying Robot Canvas Layer
        h(ExperienceRobotScene, {
          nodeTopRef,
          nodeMidRef,
          nodeBotRef,
          runTrigger,
          ctaHovered,
          onProgressUpdate: handleProgressUpdate
        }),

        // Two-Column Guided Timeline Layout (Left: Vertical Rail + Red Milestones, Right: Internship Card + CTA)
        h(
          "div",
          { className: "exp-guided-layout" },
          // Left Column: Thin Vertical Timeline Rail & 3 Red Milestone Markers
          h(
            "div",
            { className: "exp-rail-col", "aria-hidden": "true" },
            h(
              "div",
              { className: "exp-rail-track" },
              h("div", {
                className: "exp-rail-fill",
                style: { height: `${timelineState.fillPct}%` }
              })
            ),
            h("div", {
              ref: nodeTopRef,
              className: `exp-milestone-node ${timelineState.topLit ? "is-lit" : ""}`
            }),
            h("div", {
              ref: nodeMidRef,
              className: `exp-milestone-node node-primary ${
                timelineState.midLit ? "is-lit" : ""
              }`
            }),
            h("div", {
              ref: nodeBotRef,
              className: `exp-milestone-node ${timelineState.botLit ? "is-lit" : ""}`
            })
          ),

          // Right Column: Offset FlyRank AI Internship Card & Bottom Explore Internship CTA
          h(
            "div",
            { className: "exp-content-col" },
            // Top Timeline Label
            h(
              "div",
              { className: "exp-timeline-top-tag" },
              "JULY – OCTOBER 2026 · CAREER MILESTONE"
            ),

            // Single Internship Card: Machine Learning Intern — FlyRank AI
            h(
              motion.article,
              {
                key: cardAnimKey,
                initial: { opacity: 0.25, y: 14, scale: 0.98 },
                animate: timelineState.cardRevealed
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0.32, y: 10, scale: 0.985 },
                transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
                className: `exp-internship-card ${
                  timelineState.midLit ? "is-highlighted" : ""
                }`
              },
              h(
                "div",
                { className: "exp-card-header-flex" },
                h(
                  "div",
                  null,
                  h("h3", { className: "exp-role-title" }, "Machine Learning Intern"),
                  h("div", { className: "exp-org-meta" }, "FlyRank AI · Remote")
                ),
                h("div", { className: "exp-period-pill" }, "July–October 2026")
              ),

              h(
                "p",
                { className: "exp-short-desc" },
                "Built and evaluated machine-learning ranking systems for content-refresh prioritization using large-scale search performance data."
              )
            ),

            // Bottom Destination Row: Robot Settles Beside "Explore Internship ->" CTA
            h(
              "div",
              { className: "exp-bottom-cta-bar" },
              h(
                "button",
                {
                  type: "button",
                  className: "exp-explore-btn",
                  onMouseEnter: () => setCtaHovered(true),
                  onMouseLeave: () => setCtaHovered(false),
                  onClick: () => onExploreInternship()
                },
                h("span", null, "Explore Internship"),
                h("span", { className: "btn-trailing-circle", style: { width: 24, height: 24 } }, "→")
              )
            )
          )
        )
      )
    )
  );
}
