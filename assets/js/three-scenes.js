// ==========================================================================
// FARDIN.AI — PERFORMANT THREE.JS 3D SCENES
// 1. HeroNeuralScene: 3D Neural Nodes, Orbital Rings & Geometric Primitives
// 2. ContactGlobeScene: 3D Network Globe with Dhaka, Bangladesh Beacon
// 3. JourneyPipelineScene: 3D Ranking Funnel (78.8M -> 9,961 -> Top-50)
// All scenes lazy-pause via IntersectionObserver & respect reduced-motion.
// ==========================================================================

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

// --------------------------------------------------------------------------
// 1. HERO 3D NEURAL NETWORK & ORBITAL RINGS SCENE
// --------------------------------------------------------------------------
export function HeroNeuralScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobileViewport() });
    } catch (err) {
      return; // Graceful fallback if WebGL is disabled
    }

    const mobile = isMobileViewport();
    const reduced = prefersReducedMotion();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    camera.position.set(0, 0, 14);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Subtle Lighting for 3D Geometric Spheres & Polyhedra
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(6, 8, 10);
    scene.add(dirLight);

    // Orbital Rings (Echoing the Figma Red & Slate Concentric Orbits)
    const ringMatRed = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide
    });
    const ringMatDark = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide
    });

    const ring1 = new THREE.Mesh(new THREE.RingGeometry(4.2, 4.24, 64), ringMatRed);
    ring1.position.set(2.4, 0.2, -1.5);
    ring1.rotation.set(0.35, -0.25, 0.1);
    rootGroup.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(5.35, 5.38, 64), ringMatDark);
    ring2.position.set(2.4, 0.2, -2.2);
    ring2.rotation.set(-0.25, 0.3, -0.15);
    rootGroup.add(ring2);

    // Neural Nodes + Connections
    const nodeCount = mobile ? 14 : 26;
    const nodePositions = [];
    const nodeMeshes = [];

    const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const icosaGeo = new THREE.IcosahedronGeometry(0.24, 0);

    const matRed = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.3,
      metalness: 0.2
    });
    const matDark = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.3
    });
    const matYellow = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.3,
      metalness: 0.2
    });

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.6 + (i % 4) * 1.15;
      const x = (i % 2 === 0 ? 1.8 : -1.2) + Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.68);
      const z = -1.5 - (i % 3) * 0.9;

      const mat = i % 4 === 0 ? matRed : i % 5 === 0 ? matYellow : matDark;
      const geo = i % 6 === 0 ? icosaGeo : sphereGeo;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = {
        baseX: x,
        baseY: y,
        baseZ: z,
        phase: i * 0.7,
        speed: 0.4 + (i % 4) * 0.15
      };
      rootGroup.add(mesh);
      nodeMeshes.push(mesh);
      nodePositions.push(mesh.position);
    }

    // Neural Synaptic Lines connecting nearby nodes
    const linePoints = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 3.6) {
          linePoints.push(nodePositions[i].clone(), nodePositions[j].clone());
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.13
    });
    const linesMesh = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(linesMesh);

    // Pointer Parallax
    let targetX = 0;
    let targetY = 0;
    const onPointerMove = (e) => {
      if (reduced || mobile) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1);
      targetX = nx * 0.45;
      targetY = ny * 0.35;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // IntersectionObserver to pause rendering when scrolled out of view
    let isVisible = true;
    let rafId = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let clock = new THREE.Clock();
    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);
      if (!isVisible) return;

      const t = clock.getElapsedTime();
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      matDark.color.setHex(isDark ? 0x94a3b8 : 0x0f172a);
      ringMatDark.color.setHex(isDark ? 0x64748b : 0x0f172a);
      ringMatDark.opacity = isDark ? 0.22 : 0.1;

      if (!reduced) {
        rootGroup.rotation.y += (targetX * 0.35 - rootGroup.rotation.y) * 0.05;
        rootGroup.rotation.x += (targetY * 0.25 - rootGroup.rotation.x) * 0.05;
        ring1.rotation.z = t * 0.08;
        ring2.rotation.z = -t * 0.06;

        for (let i = 0; i < nodeMeshes.length; i++) {
          const m = nodeMeshes[i];
          const u = m.userData;
          m.position.y = u.baseY + Math.sin(t * u.speed + u.phase) * 0.18;
          m.rotation.x = t * 0.3;
          m.rotation.y = t * 0.25;
        }
      }

      renderer.render(scene, camera);
    };

    // Render once immediately, then loop if motion is enabled
    renderer.render(scene, camera);
    if (!reduced) {
      renderLoop();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return React.createElement("div", {
    ref: mountRef,
    className: "hero-three-canvas-wrap",
    "aria-hidden": "true"
  });
}

// --------------------------------------------------------------------------
// 2. CONTACT SECTION 3D GLOBE SCENE (DHAKA, BANGLADESH BEACON)
// --------------------------------------------------------------------------
export function ContactGlobeScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (err) {
      return;
    }

    const reduced = prefersReducedMotion();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      50
    );
    camera.position.set(0, 0.3, 5.2);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Inner Translucent Sphere
    const innerGeo = new THREE.SphereGeometry(1.62, 28, 28);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.85
    });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // Wireframe Geodesic Lattice
    const wireGeo = new THREE.SphereGeometry(1.65, 20, 14);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.16
    });
    globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

    // Glowing Red Beacon Marker for Dhaka, Bangladesh
    const beaconGroup = new THREE.Group();
    const pinDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xe11d48 })
    );
    const pinRing = new THREE.Mesh(
      new THREE.RingGeometry(0.13, 0.19, 24),
      new THREE.MeshBasicMaterial({
        color: 0xe11d48,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      })
    );
    beaconGroup.add(pinDot);
    beaconGroup.add(pinRing);

    // Position on front-right hemisphere facing viewer
    beaconGroup.position.set(0.75, 0.58, 1.38);
    beaconGroup.lookAt(0, 0, 0);
    globeGroup.add(beaconGroup);

    // Orbital Equatorial Ring
    const orbitRing = new THREE.Mesh(
      new THREE.RingGeometry(2.02, 2.05, 64),
      new THREE.MeshBasicMaterial({
        color: 0xe11d48,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.28
      })
    );
    orbitRing.rotation.set(1.15, 0.25, 0);
    globeGroup.add(orbitRing);

    let isVisible = true;
    let rafId = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const onResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const t = clock.getElapsedTime();
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      innerMat.color.setHex(isDark ? 0x12151d : 0xf8fafc);
      wireMat.color.setHex(isDark ? 0x64748b : 0x0f172a);
      wireMat.opacity = isDark ? 0.35 : 0.16;

      if (!reduced) {
        globeGroup.rotation.y = Math.sin(t * 0.45) * 0.32;
        const pulse = 1 + Math.sin(t * 3.2) * 0.25;
        pinRing.scale.set(pulse, pulse, 1);
      }
      renderer.render(scene, camera);
    };

    renderer.render(scene, camera);
    if (!reduced) animate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return React.createElement("div", {
    ref: mountRef,
    style: { width: "100%", height: "195px" },
    "aria-hidden": "true"
  });
}

// --------------------------------------------------------------------------
// 3. JOURNEY 3D RANKING PIPELINE VISUALIZATION (78.8M -> 9,961 -> TOP-50)
// --------------------------------------------------------------------------
export function JourneyPipelineScene({ topN = 6 }) {
  const mountRef = useRef(null);
  const topNRef = useRef(topN);
  topNRef.current = topN;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (err) {
      return;
    }

    const reduced = prefersReducedMotion();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.1,
      60
    );
    camera.position.set(0, 0.4, 8.5);

    const group = new THREE.Group();
    scene.add(group);

    // 12 Interactive 3D Page Nodes representing the 12 candidate pages in the demo
    const nodes = [];
    const geo = new THREE.OctahedronGeometry(0.26, 0);
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: i < 6 ? 0x10b981 : 0x94a3b8,
        wireframe: false
      });
      const mesh = new THREE.Mesh(geo, mat);
      const col = i - 5.5;
      mesh.position.set(col * 0.62, (i % 2 === 0 ? 0.35 : -0.35), 0);
      mesh.userData = { index: i, baseY: mesh.position.y };
      group.add(mesh);
      nodes.push(mesh);
    }

    // Connecting baseline axis
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4, 0, -0.2),
      new THREE.Vector3(4, 0, -0.2)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0 });
    group.add(new THREE.Line(lineGeo, lineMat));

    let isVisible = true;
    let rafId = null;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const onResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!isVisible) return;
      const t = clock.getElapsedTime();
      const activeCut = topNRef.current;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const selected = i < activeCut;
        n.material.color.setHex(selected ? 0x10b981 : 0xcbd5e1);
        const targetScale = selected ? 1.18 : 0.78;
        n.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        if (!reduced) {
          n.rotation.y = t * 0.8 + i * 0.3;
          n.rotation.x = t * 0.4;
          n.position.y = n.userData.baseY + Math.sin(t * 1.8 + i * 0.6) * 0.12;
        }
      }

      renderer.render(scene, camera);
    };

    renderer.render(scene, camera);
    if (!reduced) animate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return React.createElement("div", {
    ref: mountRef,
    style: { width: "100%", height: "110px", marginTop: "0.5rem" },
    "aria-hidden": "true"
  });
}
