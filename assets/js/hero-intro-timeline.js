import gsap from "gsap";

// Animate only hero-owned nodes; context.revert restores all inline properties
// if navigation interrupts the entrance. Never mutate the shared navbar.
export function createHeroIntroTimeline({ elements, onComplete, isReducedMotion = false }) {
  const { headlineLines = [], nameWords = [], labelBadge, portraitContainer, haloAura, actions } = elements;
  const targets = [labelBadge, portraitContainer, haloAura, actions, ...headlineLines, ...nameWords].filter(Boolean);
  if (isReducedMotion) return { play() { onComplete?.(); }, skip() {}, kill() {} };
  let timeline;
  const context = gsap.context(() => {
    timeline = gsap.timeline({ paused: true, defaults: { ease: "power2.out" }, onComplete });
    if (haloAura) timeline.from(haloAura, { opacity: 0, duration: .8 }, 0);
    if (portraitContainer) timeline.from(portraitContainer, { opacity: 0, y: 14, duration: .85 }, .05);
    if (labelBadge) timeline.from(labelBadge, { opacity: 0, y: 8, duration: .45 }, .08);
    timeline.from(headlineLines, { opacity: 0, y: 14, duration: .55, stagger: .09 }, .16);
    timeline.from(nameWords, { opacity: 0, y: 16, duration: .55, stagger: .11 }, .35);
    if (actions) timeline.from(actions, { opacity: 0, y: 8, duration: .5 }, .65);
  });
  return {
    play: () => timeline.play(),
    skip: () => { timeline.progress(1); gsap.set(targets, { clearProps: "opacity,transform" }); },
    kill: () => context.revert()
  };
}
