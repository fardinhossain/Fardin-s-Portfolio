import * as THREE from 'three';

/**
 * Mount a self-contained, transparent portrait-stage overlay (no React).
 * host must have a measurable size and be positioned by its owner. The canvas
 * is pointer-inert and aria-hidden. No assets, external state, or shared Three
 * resources are used. API: { dispose(), setReducedMotion(boolean) }.
 *
 * Desktop: full ellipse around the halo; the rear arc passes BEHIND the
 * portrait via the host stacking order, so the robot cannot cover the face.
 * A conservative face exclusion rectangle includes the model's full envelope.
 * Mobile/narrow stages: a smaller right-perimeter ellipse restricts movement.
 * All coordinates are stage-relative, never viewport-relative. The stage must
 * sit only in the portrait column; the craft cannot enter the text column.
 */
export function mountHeroOrbit(host, options = {}) {
  const noop = { dispose() {}, setReducedMotion() {} };
  if (!host || typeof document === 'undefined' || typeof window === 'undefined') return noop;

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
    return noop;
  }

  let disposed = false;
  let reduced = Boolean(options.reducedMotion);
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
  }

  function contextLost(event) {
    // Fail closed rather than retrying GPU work or affecting the portrait.
    event.preventDefault();
    dispose();
  }

  function canRender() {
    return !disposed && inView && !document.hidden && width > 0 && height > 0;
  }

  function pose() {
    const angle = -0.65 + elapsed * (Math.PI * 2 / 21);
    const depth = Math.sin(angle);
    const stationary = Boolean(options.stationary);
    const narrow = width < 460;
    // Reference hero robot is deliberately legible rather than a tiny glyph.
    const scale = stationary
      ? Math.min(width * 0.82 / 2.9, height * 0.84 / 4.6)
      : Math.min(width * (narrow ? 0.14 : 0.24) / 2.9, height * (narrow ? 0.28 : 0.36) / 4.6);
    const depthScale = stationary ? 1 : 0.94 + 0.06 * depth;
    robot.scale.setScalar(scale * depthScale * (options.modelScale || 1));
    const x = stationary ? 0.5 : narrow ? 0.90 + 0.035 * Math.cos(angle) : 0.49 + 0.40 * Math.cos(angle);
    const y = stationary ? 0.56 : narrow ? 0.28 + 0.17 * Math.sin(angle) : 0.42 + 0.30 * Math.sin(angle);
    robot.position.set(width * (x - 0.5), height * (0.5 - y), depth * 24);
    // Expanded face exclusion: the enlarged craft is occluded by the actual
    // portrait on the rear arc instead of passing across facial features.
    const behindPortrait = !stationary && !narrow && x > 0.17 && x < 0.86 && y > 0.30 && y < 0.80;
    host.style.zIndex = behindPortrait ? '1' : '3';
    // Always front-facing: only a gentle bank and small head-on yaw.
    robot.rotation.set(0.04 * Math.cos(angle), -0.12 + depth * 0.10, -0.06 + 0.07 * Math.cos(angle));
    const pulse = reduced ? 1 : 1 + 0.06 * Math.sin(elapsed * 5.5);
    for (const flame of flames) flame.scale.y = flame.userData.baseY * pulse;
  }

  function draw() {
    if (!canRender()) return;
    pose();
    try {
      renderer.render(scene, camera);
    } catch (_) {
      dispose();
    }
  }

  function tick(time) {
    frame = 0;
    if (!canRender() || reduced) { previousTime = 0; return; }
    if (previousTime) elapsed += Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    draw();
    if (canRender() && !reduced) frame = window.requestAnimationFrame(tick);
  }

  function sync() {
    stop();
    if (!canRender()) return;
    draw();
    if (!reduced && !disposed) frame = window.requestAnimationFrame(tick);
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
      mesh(sphere, led, robot, [side * 0.24, 1.17, 0.672], [0.092, 0.13, 0.032]);
      // Little ear pods are cylinders along the X axis.
      const ear = mesh(cylinder, charcoal, robot, [side * 0.84, 1.10, 0], [0.26, 0.18, 0.26]);
      ear.rotation.z = Math.PI / 2;
      const cap = mesh(cylinder, enamel, robot, [side * 0.94, 1.10, 0], [0.20, 0.075, 0.20]);
      cap.rotation.z = Math.PI / 2;
      mesh(sphere, led, robot, [side * 0.994, 1.1, 0.03], [0.025, 0.08, 0.08]);
      mesh(sphere, charcoal, robot, [side * 0.62, 0.10, 0], [0.18, 0.19, 0.19]);
      const arm = mesh(sphere, enamel, robot, [side * 0.81, -0.16, 0.02], [0.20, 0.37, 0.22]);
      arm.rotation.z = side * 0.38;
      mesh(sphere, charcoal, robot, [side * 0.92, -0.48, 0.10], [0.17, 0.19, 0.17]);
      mesh(sphere, enamel, robot, [side * 0.94, -0.59, 0.13], [0.19, 0.21, 0.20]);
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
    resize();
  } catch (_) {
    dispose();
    return noop;
  }

  return {
    dispose,
    setReducedMotion(value) {
      if (disposed) return;
      const next = Boolean(value);
      if (next === reduced) return;
      reduced = next;
      sync();
    },
  };
}

export default mountHeroOrbit;
