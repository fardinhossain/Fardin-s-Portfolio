// Site-wide scrolling, progressively enhanced with a locally pinned Lenis.
// No transformed page wrapper: sticky navigation, WebGL and scroll observers
// keep using the real window.scrollY. Touch/keyboard remain browser-native.
import gsap from "gsap";

let engine = null;
let owners = 0;
let teardown = null;
let navigationToken = 0;
let navigating = false;
const motionQuery = "(prefers-reduced-motion: reduce)";
const reduce = () => window.matchMedia(motionQuery).matches;

export function scrollToTarget(target, { offset, immediate = false, onComplete } = {}) {
  const element = typeof target === "string" ? document.querySelector(target) : typeof target === "number" ? null : target;
  if (typeof target !== "number" && !element) return;
  const margin = element ? parseFloat(getComputedStyle(element).scrollMarginTop) || parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80 : 0;
  const shift = offset ?? -margin;
  const instant = immediate || reduce();
  const token = ++navigationToken;
  navigating = false;
  if (engine && !instant) {
    engine.stop();
    engine.start();
    engine.resize(); // React route/filter changes can alter document height.
    navigating = true;
    engine.scrollTo(element || target, { offset: shift, duration: 0.95, lock: false, onComplete: () => {
      if (token === navigationToken) navigating = false;
      onComplete?.();
    } });
  } else {
    const top = element ? element.getBoundingClientRect().top + window.scrollY + shift : target + shift;
    // Cancel any previous Lenis destination before an immediate navigation.
    if (engine) {
      engine.stop();
      engine.start();
      engine.scrollTo(top, { immediate: true });
    } else window.scrollTo({ top, behavior: instant ? "instant" : "smooth" });
    if (instant) onComplete?.();
  }
}

export function installSmoothScrolling() {
  owners += 1;
  if (owners === 1) {
    let disposed = false;
    let generation = 0;
    const media = window.matchMedia(motionQuery);
    const tick = seconds => engine?.raf(seconds * 1000);
    const removeTicker = () => { gsap.ticker.remove(tick); };
    const visibility = () => {
      removeTicker();
      if (engine && !document.hidden) {
        engine.resize();
        gsap.ticker.add(tick);
      }
    };
    const destroy = () => {
      removeTicker();
      engine?.destroy();
      engine = null;
      navigating = false;
      navigationToken += 1;
      document.documentElement.dataset.scrollEngine = "native";
    };
    const configure = async () => {
      const run = ++generation;
      destroy();
      if (media.matches || disposed) return;
      try {
        const { default: Lenis } = await import("./vendor/lenis-1.3.11.mjs");
        if (disposed || run !== generation || media.matches) return;
        engine = new Lenis({
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.105,
          wheelMultiplier: 0.85,
          autoRaf: false,
          anchors: false,
          prevent: node => Boolean(node.closest?.('[role="dialog"], [data-lenis-prevent], textarea, select'))
        });
        document.documentElement.dataset.scrollEngine = "lenis";
        visibility();
      } catch (_) {
        // Native smooth anchors and native wheel still work if enhancement fails.
        if (run === generation) destroy();
      }
    };
    const anchors = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash || url.hash === '#') return;
      let id;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch (_) { return; }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target);
      // Preserve anchor keyboard semantics, particularly the skip-to-content link.
      const addedTabIndex = !target.hasAttribute('tabindex');
      if (addedTabIndex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (addedTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      history.pushState(history.state, '', url.hash);
    };
    // Manual intent cancels only a programmatic destination, not ongoing wheel
    // easing. Capture also catches input inside a nested dialog/textarea, which
    // correctly bypasses Lenis's own wheel handler but must still win over nav.
    const cancelNavigation = event => {
      if (!engine || !navigating) return;
      if (event.type === "keydown" && !["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) return;
      navigating = false;
      navigationToken += 1;
      // stop/start cancels the animation even when its current target equals
      // actualScroll (Lenis scrollTo alone early-returns for equal targets).
      engine.stop();
      engine.start();
    };
    const manualEvents = ["wheel", "touchstart", "pointerdown", "keydown"];
    manualEvents.forEach(type => document.addEventListener(type, cancelNavigation, { passive: true, capture: true }));
    media.addEventListener("change", configure);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("click", anchors);
    configure();
    teardown = () => {
      disposed = true;
      generation += 1;
      manualEvents.forEach(type => document.removeEventListener(type, cancelNavigation, true));
      media.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("click", anchors);
      destroy();
      delete document.documentElement.dataset.scrollEngine;
    };
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    owners = Math.max(0, owners - 1);
    if (!owners) { teardown?.(); teardown = null; }
  };
}
