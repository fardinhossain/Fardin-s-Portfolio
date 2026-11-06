// ==========================================================================
// FARDIN.AI — SITEWIDE SCROLL REVEAL OBSERVER
// Ultra-lightweight IntersectionObserver for viewport entrance animations
// ==========================================================================

export function initScrollReveals(root = document) {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    // Fallback: reveal immediately
    root.querySelectorAll(".reveal-on-scroll, .reveal-stagger, .reveal-image-card").forEach(el => {
      el.classList.add("is-revealed");
    });
    return () => {};
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (motionQuery.matches) {
    root.querySelectorAll(".reveal-on-scroll, .reveal-stagger, .reveal-image-card").forEach(el => {
      el.classList.add("is-revealed");
    });
    return () => {};
  }

  // Pre-index children for staggered containers
  root.querySelectorAll(".reveal-stagger").forEach(container => {
    Array.from(container.children).forEach((child, idx) => {
      child.style.setProperty("--reveal-idx", String(idx));
    });
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.1
    }
  );

  const targets = root.querySelectorAll(".reveal-on-scroll, .reveal-stagger, .reveal-image-card");
  targets.forEach(target => observer.observe(target));

  return () => observer.disconnect();
}
