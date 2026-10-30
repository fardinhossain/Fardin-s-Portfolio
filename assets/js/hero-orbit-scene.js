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
  let revealProgress = -1;
  const stationary = Boolean(options.stationary);
  const modelScale = Number.isFinite(options.modelScale) && options.modelScale > 0 ? options.modelScale : 1;
  const entranceDuration = 1;
  const revealDuration = 1.1;
  let inView = false;
  let width = 0;
  let height = 0;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let resizeObserver;
  let intersectionObserver;
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
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    window.removeEventListener('resize', resize);
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
    return !disposed && inView && !document.hidden && width > 0 && height > 0;
  }

  function setPhase(value) {
    if (phase === value) return;
    phase = value;
    notify('onPhase', value);
  }

  function setReveal(value) {
    const next = Math.max(0, Math.min(1, value));
    if (next === revealProgress) return;
    revealProgress = next;
    notify('onRevealProgress', next);
  }

  const smooth = (t) => t * t * (3 - 2 * t);
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
    const narrow = width < 460;
    const isStatic = reduced || stationary;
    let angle = 0;
    let x = narrow ? 0.91 : 0.12;
    let y = narrow ? 0.25 : 0.58;
    let gesture = 0;
    if (isStatic) {
      setPhase('static');
      setReveal(1);
      if (stationary) { x = 0.5; y = 0.56; }
    } else if (elapsed < entranceDuration) {
      setPhase('enter');
      setReveal(0);
      const t = smooth(elapsed / entranceDuration);
      // The desktop transit crosses the portrait only behind its stacking layer.
      x = mix(1.22, x, t);
      y = mix(-0.32, y, t);
    } else if (elapsed < entranceDuration + revealDuration) {
      setPhase('reveal');
      const t = (elapsed - entranceDuration) / revealDuration;
      setReveal(smooth(t));
      gesture = Math.sin(Math.PI * t) ** 2;
    } else {
      setPhase('orbit');
      setReveal(1);
      const t = elapsed - entranceDuration - revealDuration;
      // Integrate a velocity ramp: exact reveal endpoint with zero initial
      // velocity, then smoothly reach the familiar 21-second orbit speed.
      const ramp = 0.8;
      const orbitTime = t < ramp ? t ** 3 / (3 * ramp ** 2) : t - 2 * ramp / 3;
      angle = orbitTime * Math.PI * 2 / 21;
      if (narrow) {
        x = 0.91 - 0.025 * Math.sin(angle);
        y = 0.25 + 0.065 * Math.sin(angle);
      } else {
        x = 0.49 - 0.37 * Math.cos(angle);
        y = 0.43 + 0.15 * Math.cos(angle) + 0.23 * Math.sin(angle);
      }
    }
    const depth = Math.sin(angle);
    // Safe envelope rather than just the torso governs size. Mobile is kept
    // outside the right edge of the expanded face box, even at full bank.
    const scale = stationary
      ? Math.min(width * 0.82 / 2.9, height * 0.84 / 4.6) * modelScale
      : Math.min(width * (narrow ? 0.078 : 0.22) / 2.9, height * (narrow ? 0.17 : 0.32) / 4.6) * Math.min(modelScale, narrow ? 1.05 : 1.15);
    robot.scale.setScalar(scale * (stationary ? 1 : 0.97 + 0.03 * Math.cos(angle)));
    robot.position.set(width * (x - 0.5), height * (0.5 - y), depth * 24);
    const motionTime = isStatic ? 0 : elapsed;
    robot.rotation.set(0.035 * Math.sin(motionTime * 0.7), -0.10 + depth * 0.08, 0.045 * Math.sin(motionTime * 0.9));
    for (const arm of gestureArms) arm.rotation.z = arm.userData.rest + arm.userData.side * gesture * 0.38;
    const pulse = isStatic ? 1 : 1 + 0.045 * Math.sin(motionTime * 5.5);
    for (const flame of flames) flame.scale.y = flame.userData.baseY * pulse;
    const bounds = boundsForRobot();
    const intersectsFace = bounds.x < width * 0.80 && bounds.x + bounds.width > width * 0.27
      && bounds.y < height * 0.66 && bounds.y + bounds.height > height * 0.13;
    const behind = !stationary && (intersectsFace || (!narrow && phase === 'enter'));
    host.style.zIndex = behind ? '1' : '3';
    bounds.visible = !behind && bounds.x + bounds.width > 0 && bounds.x < width
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

  function visibilityChanged() { sync(); }

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
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        inView = entries.some((entry) => entry.isIntersecting);
        sync();
      }, { threshold: 0 });
      intersectionObserver.observe(host);
    } else {
      inView = true;
    }
    // Settle semantics immediately, even if the stage starts offscreen/zero size.
    setPhase(reduced || stationary ? 'static' : 'enter');
    setReveal(reduced || stationary ? 1 : 0);
    resize();
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
