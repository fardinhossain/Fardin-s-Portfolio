import * as THREE from 'three';

/**
 * Transparent procedural Three.js portrait companion; no external assets.
 * mountHeroOrbit(host, { reducedMotion=false, stationary=false, modelScale=1,
 *   onPhase, onRevealProgress, onPosition }) returns
 * { dispose(), setReducedMotion(boolean), setPaused(boolean) }.
 * Phases: enter (1s), reveal (1.1s), orbit; stationary/reduced => static.
 * onRevealProgress receives 0..1 (only during reveal, plus settling updates).
 * onPosition receives a conservative FULL model envelope in host CSS pixels:
 * { x, y, width, height, visible }. x/y are top-left, not model center.
 * Use refs/styles, not React state, for this per-draw tracking callback.
 * visible=false on rear/occluded arcs, offstage, hidden, paused-offscreen,
 * disposal and GPU failure. The parent owns the accessible interactive hitbox.
 * Host must be positioned in the portrait column. Its z-index switches 1/3
 * around portrait z-index 2. Every face-intersecting envelope stays BEHIND it.
 * Narrow stages (<460px) use a smaller upper-right perimeter, DPR <=1.5.
 * Explicit pause freezes the current pose and redraws without scheduling RAF;
 * visibility/intersection suspend the clock as well. Resume never catches up.
 * Unavailable WebGL settles progress=1 and phase=unavailable, returning no-ops.
 */
export function mountHeroOrbit(host, options = {}) {
  function notify(name, value) {
    // Consumer callback errors must never kill rendering or resource cleanup.
    try { if (typeof options[name] === 'function') options[name](value); } catch (_) { /* consumer-owned */ }
  }
  const emptyPosition = { x: 0, y: 0, width: 0, height: 0, visible: false };
  const noop = { dispose() {}, setReducedMotion() {}, setPaused() {} };
  function unavailable() {
    notify('onRevealProgress', 1);
    notify('onAssistantProgress', 1);
    notify('onStage', 'unavailable');
    notify('onPhase', 'unavailable');
    notify('onPosition', { ...emptyPosition });
  }
  if (!host || typeof document === 'undefined' || typeof window === 'undefined') {
    unavailable();
    return noop;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
      depth: true,
      stencil: false,
    });
  } catch (_) {
    unavailable();
    return noop;
  }

  let disposed = false;
  let reduced = Boolean(options.reducedMotion);
  let paused = false;
  let phase = '';
  let stage = '';
  let revealProgress = -1;
  let assistantProgress = -1;
  const stationary = Boolean(options.stationary);
  const modelScale = Number.isFinite(options.modelScale) && options.modelScale > 0 ? options.modelScale : 1;
  const entranceDuration = 1.0;
  const revealDuration = 1.15;
  const orbitDuration = 2.40;
  const landDuration = 0.85;
  const assistantDuration = 1.10;
  const revealEnd = entranceDuration + revealDuration;
  const orbitEnd = revealEnd + orbitDuration;
  const landEnd = orbitEnd + landDuration;
  const assistantEnd = landEnd + assistantDuration;
  function checkInView() {
    if (!host || typeof window === 'undefined') return true;
    const r = host.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    if (r.width === 0 || r.height === 0 || vh === 0) return true;
    return r.bottom > -80 && r.top < vh + 80 && r.right > -80 && r.left < vw + 80;
  }
  let inView = true;
  let width = 0;
  let height = 0;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let resizeObserver;
  let intersectionObserver;
  const retryTimers = [];
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  const originalZIndex = host.style.zIndex;
  const canvas = renderer.domElement;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);
  camera.position.z = 1000;
  const robot = new THREE.Group();
  const flames = [];
  const gestureArms = [];
  // Includes antenna, banked arms, pulsing exhaust AND the entire glow sprites.
  const envelope = new THREE.Box3(new THREE.Vector3(-1.5, -1.75, -0.85), new THREE.Vector3(1.5, 2.3, 0.95));
  const projected = new THREE.Vector3();
  const corners = [];
  for (const x of [envelope.min.x, envelope.max.x]) {
    for (const y of [envelope.min.y, envelope.max.y]) {
      for (const z of [envelope.min.z, envelope.max.z]) corners.push(new THREE.Vector3(x, y, z));
    }
  }
  scene.add(robot);

  function geometry(value) { geometries.add(value); return value; }
  function material(value) { materials.add(value); return value; }
  const sphere = geometry(new THREE.SphereGeometry(1, 20, 12));
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, 16));
  const cone = geometry(new THREE.ConeGeometry(1, 1, 16));
  const ring = geometry(new THREE.TorusGeometry(1, 0.075, 6, 24));

  function mesh(shape, surface, parent, position, scale) {
    const object = new THREE.Mesh(shape, surface);
    object.position.set(...position);
    object.scale.set(...scale);
    parent.add(object);
    return object;
  }

  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    while (retryTimers.length) clearTimeout(retryTimers.pop());
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pageshow', wake);
    window.removeEventListener('focus', wake);
    document.removeEventListener('visibilitychange', visibilityChanged);
    canvas.removeEventListener('webglcontextlost', contextLost);
    for (const item of geometries) item.dispose();
    for (const item of materials) item.dispose();
    for (const item of textures) item.dispose();
    scene.clear();
    renderer.dispose();
    canvas.remove();
    host.style.zIndex = originalZIndex;
    notify('onPosition', { ...emptyPosition });
  }

  function contextLost(event) {
    // Fail closed rather than retrying GPU work or affecting the portrait.
    event.preventDefault();
    dispose();
    unavailable();
  }

  function canRender() {
    return !disposed && (inView || checkInView()) && !document.hidden && width > 0 && height > 0;
  }

  function setPhase(value) {
    if (phase === value) return;
    phase = value;
    notify('onPhase', value);
  }

  function setStage(value) {
    if (stage === value) return;
    stage = value;
    notify('onStage', value);
  }

  function setReveal(value) {
    const next = Math.max(0, Math.min(1, value));
    if (next === revealProgress) return;
    revealProgress = next;
    notify('onRevealProgress', next);
  }

  function setAssistant(value) {
    const next = Math.max(0, Math.min(1, value));
    if (next === assistantProgress) return;
    assistantProgress = next;
    notify('onAssistantProgress', next);
  }

  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOutCubic = (t) => 1 - (1 - t) ** 3;
  const mix = (a, b, t) => a + (b - a) * t;

  function boundsForRobot() {
    robot.updateMatrixWorld(true);
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const corner of corners) {
      projected.copy(corner).applyMatrix4(robot.matrixWorld).project(camera);
      const x = (projected.x + 1) * width / 2;
      const y = (1 - projected.y) * height / 2;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    return { x: left, y: top, width: right - left, height: bottom - top, visible: false };
  }

  function pose() {
    const narrow = width < 700;
    const isStatic = reduced || stationary;
    const revealX = narrow ? 0.78 : 0.14;
    const revealY = narrow ? 0.25 : 0.54;
    let landX = narrow ? 0.82 : 0.965;
    let landY = narrow ? 0.88 : 0.78;

    if (narrow && typeof document !== 'undefined') {
      const anchor = document.querySelector('.fh-robot-mobile-anchor') || document.querySelector('.fh-resume');
      if (anchor && host) {
        const aRect = anchor.getBoundingClientRect();
        const hRect = host.getBoundingClientRect();
        if (hRect.width > 0 && hRect.height > 0) {
          landX = Math.max(0.05, Math.min(0.95, (aRect.left + aRect.width / 2 - hRect.left) / hRect.width));
          landY = Math.max(0.05, Math.min(0.95, (aRect.top + aRect.height / 2 - hRect.top) / hRect.height));
        }
      }
    }
    let x = revealX;
    let y = revealY;
    let depth = 0;
    let gesture = 0;
    let bankZ = 0;
    let nodX = 0;
    let behind = false;
    let interactiveReady = false;

    if (isStatic) {
      setPhase('static');
      setStage('settled');
      setReveal(1);
      setAssistant(1);
      x = stationary ? 0.5 : landX;
      y = stationary ? 0.56 : landY;
      interactiveReady = true;
    } else if (elapsed < entranceDuration) {
      // Phase 1: Robot Arrival — fly in from outside the viewport
      setPhase('enter');
      setStage('enter');
      setReveal(0);
      setAssistant(0);
      const rawT = Math.max(0, Math.min(1, elapsed / entranceDuration));
      const t = easeOutCubic(rawT);
      x = mix(narrow ? 1.18 : 1.24, revealX, t);
      y = mix(narrow ? -0.15 : -0.22, revealY, t) - 0.045 * Math.sin(Math.PI * rawT);
      depth = -0.35 * (1 - t);
      bankZ = (1 - t) * (narrow ? 0.16 : 0.26);
      behind = !narrow;
    } else if (elapsed < revealEnd) {
      // Phase 2: Name Reveal — hover near portrait & reveal "Md. Fardin Hossain"
      setPhase('reveal');
      setStage('reveal');
      setAssistant(0);
      const rawT = Math.max(0, Math.min(1, (elapsed - entranceDuration) / revealDuration));
      setReveal(smooth(rawT));
      gesture = Math.sin(Math.PI * rawT) ** 2;
      x = revealX + (narrow ? -0.014 : 0.018) * Math.sin(rawT * Math.PI);
      y = revealY - 0.018 * Math.sin(rawT * Math.PI * 2);
      depth = 0.22 * Math.sin(rawT * Math.PI);
      bankZ = -0.05 * Math.sin(rawT * Math.PI);
      behind = false;
    } else if (elapsed < orbitEnd) {
      // Phase 3: Fly Around the Portrait — 3D loop behind & in front of the portrait
      setPhase('orbit');
      setReveal(1);
      setAssistant(0);
      const rawU = Math.max(0, Math.min(1, (elapsed - revealEnd) / orbitDuration));
      const u = smooth(rawU);
      if (u < 0.5) {
        // First half: pass BEHIND the portrait (occluded by cutout head/halo/shoulders)
        setStage('orbit-behind');
        const p = u * 2; // 0 -> 1
        const startX = revealX;
        const endX = narrow ? 0.14 : 0.86;
        const endY = narrow ? 0.28 : 0.30;
        x = mix(startX, endX, smooth(p));
        y = mix(revealY, endY, smooth(p)) - 0.16 * Math.sin(Math.PI * p);
        depth = -Math.sin(Math.PI * p);
        bankZ = (narrow ? 0.18 : -0.20) * Math.sin(Math.PI * p);
        behind = true;
      } else {
        // Second half: emerge & sweep IN FRONT OF the portrait across the foreground
        setStage('orbit-front');
        const p = (u - 0.5) * 2; // 0 -> 1
        const startX = narrow ? 0.14 : 0.86;
        const startY = narrow ? 0.28 : 0.30;
        const endX = narrow ? 0.82 : 0.72;
        const endY = narrow ? 0.60 : 0.64;
        // Sweep across the front of the portrait before curving toward the right corner
        const sweepX = narrow
          ? mix(startX, endX, smooth(p)) + 0.12 * Math.sin(Math.PI * p)
          : mix(startX, endX, smooth(p)) - 0.42 * Math.sin(Math.PI * p);
        x = sweepX;
        y = mix(startY, endY, smooth(p)) + 0.08 * Math.sin(Math.PI * p);
        depth = Math.sin(Math.PI * p);
        bankZ = (narrow ? -0.16 : 0.20) * Math.sin(Math.PI * p);
        gesture = 0.35 * Math.sin(Math.PI * p);
        behind = false;
      }
    } else if (elapsed < landEnd) {
      // Phase 4: Land at the Hero's Right Corner
      setPhase('orbit');
      setStage('land');
      setReveal(1);
      setAssistant(0);
      const rawV = Math.max(0, Math.min(1, (elapsed - orbitEnd) / landDuration));
      const v = easeOutCubic(rawV);
      const startX = narrow ? 0.82 : 0.72;
      const startY = narrow ? 0.60 : 0.64;
      x = mix(startX, landX, v);
      y = mix(startY, landY, v) + 0.015 * Math.sin(Math.PI * rawV);
      depth = 0.30 * (1 - v);
      bankZ = -0.08 * (1 - v);
      nodX = 0.06 * Math.sin(Math.PI * rawV);
      behind = false;
    } else if (elapsed < assistantEnd) {
      // Phase 5: Reveal "Fardin's AI Assistant" above the landed robot
      setPhase('orbit');
      setStage('assistant');
      setReveal(1);
      const rawW = Math.max(0, Math.min(1, (elapsed - landEnd) / assistantDuration));
      setAssistant(smooth(rawW));
      const idleT = elapsed - landEnd;
      x = landX + (narrow ? 0.004 : 0.006) * Math.sin(idleT * 1.6);
      y = landY + 0.007 * Math.sin(idleT * 2.1);
      depth = 0.18;
      gesture = 0.65 * Math.sin(Math.PI * rawW) ** 2;
      nodX = -0.05 * Math.sin(Math.PI * rawW);
      behind = false;
      interactiveReady = true;
    } else {
      // Settled at the Hero's right corner with gentle idle floating
      setPhase('orbit');
      setStage('settled');
      setReveal(1);
      setAssistant(1);
      const idleT = elapsed - landEnd;
      x = landX + (narrow ? 0.004 : 0.006) * Math.sin(idleT * 1.6);
      y = landY + 0.007 * Math.sin(idleT * 2.1);
      depth = 0.15 * Math.cos(idleT * 1.1);
      behind = false;
      interactiveReady = true;
    }

    // Safe envelope governs size so the landed robot never overlaps the face box
    // (face: x in 0.27..0.80, y in 0.13..0.66).
    const scale = stationary
      ? Math.min(width * 0.82 / 2.9, height * 0.84 / 4.6) * modelScale
      : Math.min(width * (narrow ? 0.17 : 0.165) / 3.0, height * (narrow ? 0.15 : 0.21) / 4.05) * Math.min(modelScale, narrow ? 1.3 : 1.12);
    const depthScale = stationary ? 1 : 1 + 0.11 * depth;
    robot.scale.setScalar(scale * depthScale);
    robot.position.set(width * (x - 0.5), height * (0.5 - y), depth * 28);
    const motionTime = isStatic ? 0 : elapsed;
    robot.rotation.set(
      nodX + 0.035 * Math.sin(motionTime * 1.3),
      -0.10 + depth * 0.14 + (0.5 - x) * 0.18,
      bankZ + 0.04 * Math.sin(motionTime * 1.1)
    );
    for (const arm of gestureArms) arm.rotation.z = arm.userData.rest + arm.userData.side * gesture * 0.38;
    const pulse = isStatic ? 1 : 1 + 0.045 * Math.sin(motionTime * 5.5);
    for (const flame of flames) flame.scale.y = flame.userData.baseY * pulse;
    const bounds = boundsForRobot();
    const intersectsFace = !narrow && (bounds.x < width * 0.80 && bounds.x + bounds.width > width * 0.27
      && bounds.y < height * 0.66 && bounds.y + bounds.height > height * 0.13);
    const layerBehind = !stationary && behind;
    host.style.zIndex = layerBehind ? '1' : '4';
    bounds.visible = interactiveReady && !layerBehind && !intersectsFace
      && bounds.x + bounds.width > 0 && bounds.x < width
      && bounds.y + bounds.height > 0 && bounds.y < height;
    notify('onPosition', bounds);
  }

  function draw() {
    if (!canRender()) return;
    pose();
    try {
      renderer.render(scene, camera);
    } catch (_) {
      dispose();
      unavailable();
    }
  }

  function tick(time) {
    frame = 0;
    if (!canRender() || reduced || stationary || paused) { previousTime = 0; return; }
    if (previousTime) elapsed += Math.min(Math.max((time - previousTime) / 1000, 0), 0.05);
    previousTime = time;
    draw();
    if (canRender() && !reduced && !stationary && !paused) frame = window.requestAnimationFrame(tick);
  }

  function sync() {
    stop();
    if (!canRender()) {
      notify('onPosition', { ...emptyPosition });
      return;
    }
    draw();
    if (!reduced && !stationary && !paused && !disposed) frame = window.requestAnimationFrame(tick);
  }

  function resize() {
    if (disposed) return;
    inView = checkInView();
    const bounds = host.getBoundingClientRect();
    width = Math.max(0, bounds.width);
    height = Math.max(0, bounds.height);
    if (width && height) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();
    }
    sync();
  }

  function visibilityChanged() {
    inView = checkInView();
    sync();
  }

  function wake() {
    inView = checkInView();
    resize();
  }

  try {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('role', 'presentation');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    canvas.addEventListener('webglcontextlost', contextLost, false);
    host.appendChild(canvas);

    const enamel = material(new THREE.MeshStandardMaterial({ color: 0xf5f3ee, roughness: 0.25, metalness: 0.17 }));
    const trim = material(new THREE.MeshStandardMaterial({ color: 0xbfc7cb, roughness: 0.32, metalness: 0.65 }));
    const charcoal = material(new THREE.MeshStandardMaterial({ color: 0x202b32, roughness: 0.32, metalness: 0.32 }));
    const visor = material(new THREE.MeshStandardMaterial({ color: 0x101c25, roughness: 0.19, metalness: 0.45 }));
    const led = material(new THREE.MeshStandardMaterial({ color: 0xff896a, emissive: 0xff592e, emissiveIntensity: 1.8, roughness: 0.3 }));
    const softLed = material(new THREE.MeshBasicMaterial({ color: 0xffa27b, transparent: true, opacity: 0.6, depthWrite: false }));

    scene.add(new THREE.HemisphereLight(0xf4faff, 0x7a7770, 2.4));
    const key = new THREE.DirectionalLight(0xfff6e9, 3.2);
    key.position.set(-250, 350, 650);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc4e6ff, 1.7);
    rim.position.set(300, 100, -100);
    scene.add(rim);

    // Compact rounded enamel torso, dark neck and oversized friendly helmet.
    mesh(sphere, enamel, robot, [0, -0.13, 0], [0.59, 0.68, 0.39]);
    mesh(cylinder, charcoal, robot, [0, 0.51, 0], [0.23, 0.25, 0.23]);
    mesh(sphere, enamel, robot, [0, 1.10, 0], [0.82, 0.65, 0.58]);
    mesh(sphere, trim, robot, [0, 1.12, 0.36], [0.704, 0.426, 0.30]);
    mesh(sphere, visor, robot, [0, 1.13, 0.43], [0.67, 0.39, 0.255]);
    for (const side of [-1, 1]) {
      mesh(sphere, led, robot, [side * 0.24, 1.17, 0.672], [0.105, 0.145, 0.035]);
      // Little ear pods are cylinders along the X axis.
      const ear = mesh(cylinder, charcoal, robot, [side * 0.84, 1.10, 0], [0.26, 0.18, 0.26]);
      ear.rotation.z = Math.PI / 2;
      const cap = mesh(cylinder, enamel, robot, [side * 0.94, 1.10, 0], [0.20, 0.075, 0.20]);
      cap.rotation.z = Math.PI / 2;
      mesh(sphere, led, robot, [side * 0.994, 1.1, 0.03], [0.025, 0.08, 0.08]);
      mesh(sphere, charcoal, robot, [side * 0.62, 0.10, 0], [0.18, 0.19, 0.19]);
      // Shoulder pivot carries the whole limb, including its hand: a real
      // readable invitation gesture rather than a disconnected forearm wobble.
      const limb = new THREE.Group();
      limb.position.set(side * 0.62, 0.10, 0);
      robot.add(limb);
      const arm = mesh(sphere, enamel, limb, [side * 0.19, -0.26, 0.02], [0.20, 0.37, 0.22]);
      arm.rotation.z = side * 0.38;
      mesh(sphere, charcoal, limb, [side * 0.30, -0.58, 0.10], [0.17, 0.19, 0.17]);
      mesh(sphere, enamel, limb, [side * 0.32, -0.69, 0.13], [0.19, 0.21, 0.20]);
      limb.userData.rest = 0;
      limb.userData.side = side;
      gestureArms.push(limb);
      const nozzle = mesh(cylinder, charcoal, robot, [side * 0.31, -0.79, 0], [0.21, 0.29, 0.21]);
      const lip = mesh(ring, trim, robot, [side * 0.31, -0.95, 0], [0.19, 0.19, 0.19]);
      lip.rotation.x = Math.PI / 2;
      nozzle.rotation.z = side * -0.05;
      const jet = mesh(cone, softLed, robot, [side * 0.31, -1.15, 0], [0.115, 0.38, 0.115]);
      jet.rotation.z = Math.PI;
      jet.userData.baseY = jet.scale.y;
      flames.push(jet);
    }
    mesh(cylinder, trim, robot, [0.19, 1.91, -0.04], [0.035, 0.38, 0.035]);
    mesh(sphere, led, robot, [0.19, 2.13, -0.04], [0.09, 0.09, 0.09]);
    mesh(sphere, charcoal, robot, [0, -0.04, 0.37], [0.245, 0.20, 0.06]);
    mesh(sphere, led, robot, [0, -0.03, 0.43], [0.075, 0.075, 0.025]);
    mesh(sphere, trim, robot, [0, -0.42, 0.31], [0.18, 0.035, 0.04]);

    // Generated radial texture: very restrained exhaust bloom, no downloaded art.
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 64;
    const context = glowCanvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255,186,126,0.7)');
      gradient.addColorStop(0.25, 'rgba(255,112,62,0.25)');
      gradient.addColorStop(1, 'rgba(255,102,51,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      const texture = new THREE.CanvasTexture(glowCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.add(texture);
      const bloom = material(new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.65, depthWrite: false, blending: THREE.AdditiveBlending }));
      for (const side of [-1, 1]) {
        const sprite = new THREE.Sprite(bloom);
        sprite.position.set(side * 0.31, -1.18, 0.01);
        sprite.scale.set(0.64, 0.85, 1);
        sprite.userData.baseY = sprite.scale.y;
        flames.push(sprite);
        robot.add(sprite);
      }
    }

    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pageshow', wake, { passive: true });
    window.addEventListener('focus', wake, { passive: true });
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      if (host.parentElement) resizeObserver.observe(host.parentElement);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        const obsInView = entries.some((entry) => entry.isIntersecting);
        inView = obsInView || checkInView();
        if (inView) resize();
        else sync();
      }, { threshold: 0, rootMargin: '120px' });
      intersectionObserver.observe(host);
      if (host.parentElement) intersectionObserver.observe(host.parentElement);
    } else {
      inView = true;
    }
    // Settle semantics immediately, even if the stage starts offscreen/zero size.
    setPhase(reduced || stationary ? 'static' : 'enter');
    setStage(reduced || stationary ? 'settled' : 'enter');
    setReveal(reduced || stationary ? 1 : 0);
    setAssistant(reduced || stationary ? 1 : 0);
    const wakeCheck = () => {
      if (disposed) return;
      if (!frame && canRender() && !reduced && !stationary && !paused) {
        resize();
      }
    };
    resize();
    retryTimers.push(
      setTimeout(resize, 40),
      setTimeout(wakeCheck, 120),
      setTimeout(wakeCheck, 300),
      setTimeout(wakeCheck, 600),
      setTimeout(wakeCheck, 1200),
      setTimeout(wakeCheck, 2000)
    );
  } catch (_) {
    dispose();
    unavailable();
    return noop;
  }

  return {
    dispose,
    setReducedMotion(value) {
      if (disposed) return;
      const next = Boolean(value);
      if (next === reduced) return;
      reduced = next;
      // Opting out completes the reveal permanently; opting back in starts at
      // the orbit anchor, never replays or re-hides the semantic name.
      elapsed = Math.max(elapsed, entranceDuration + revealDuration);
      setReveal(1);
      if (reduced || stationary) {
        setAssistant(1);
        setStage('settled');
      }
      setPhase(reduced || stationary ? 'static' : 'orbit');
      sync();
    },
    setPaused(value) {
      if (disposed) return;
      paused = Boolean(value);
      sync();
    },
  };
}

export default mountHeroOrbit;
