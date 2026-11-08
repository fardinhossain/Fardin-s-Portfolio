import React, { useEffect, useRef, useState } from "react";
import { getCurrentTheme, subscribeTheme } from "./theme-manager.js";

const h = React.createElement;

export const SUMMIT_SMOKE_VIDEOS = {
  desktopDark: "/assets/videos/summit-background/Summit_Smoke_Desktop_Dark.mp4",
  desktopLight: "/assets/videos/summit-background/Summit_Smoke_Desktop_Light.mp4",
  mobileDark: "/assets/videos/summit-background/Summit_Smoke_Mobile_Dark.mp4",
  mobileLight: "/assets/videos/summit-background/Summit_Smoke_Mobile_Light.mp4"
};

const MOBILE_QUERY = "(max-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia) {
    return window.matchMedia(MOBILE_QUERY).matches;
  }
  return window.innerWidth <= 768;
}

function isReducedMotionPreferred() {
  if (typeof window === "undefined") return false;
  return !!window.matchMedia?.(REDUCED_MOTION_QUERY).matches;
}

export function getSummitVideoSource(theme, isMobile) {
  const isLight = theme === "light";
  if (isMobile) {
    return isLight ? SUMMIT_SMOKE_VIDEOS.mobileLight : SUMMIT_SMOKE_VIDEOS.mobileDark;
  }
  return isLight ? SUMMIT_SMOKE_VIDEOS.desktopLight : SUMMIT_SMOKE_VIDEOS.desktopDark;
}

export function SectionSummitBg({ theme: propTheme }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const loadedSrcRef = useRef(null);

  const [theme, setTheme] = useState(() => propTheme || getCurrentTheme());
  const [isMobile, setIsMobile] = useState(isMobileViewport);
  const [reducedMotion, setReducedMotion] = useState(isReducedMotionPreferred);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isOnScreen, setIsOnScreen] = useState(false);
  const [readySrc, setReadySrc] = useState(null);
  const [failedSrc, setFailedSrc] = useState(null);

  // Sync with propTheme if provided
  useEffect(() => {
    if (propTheme === "light" || propTheme === "dark") {
      setTheme(propTheme);
    }
  }, [propTheme]);

  // Subscribe to theme manager and root data-theme attribute mutations
  useEffect(() => {
    const unsubscribe = subscribeTheme((nextTheme) => {
      setTheme(nextTheme);
    });
    setTheme(getCurrentTheme());

    let attrObserver = null;
    if (typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
      attrObserver = new MutationObserver(() => {
        const domTheme = document.documentElement.getAttribute("data-theme");
        if (domTheme === "light" || domTheme === "dark") {
          setTheme(domTheme);
        }
      });
      attrObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
      });
    }

    return () => {
      unsubscribe();
      if (attrObserver) attrObserver.disconnect();
    };
  }, []);

  // Track viewport crossing 768px and prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileMedia = window.matchMedia?.(MOBILE_QUERY);
    const motionMedia = window.matchMedia?.(REDUCED_MOTION_QUERY);

    const updateViewport = () => {
      setIsMobile(isMobileViewport());
    };
    const updateMotion = () => {
      setReducedMotion(isReducedMotionPreferred());
    };

    updateViewport();
    updateMotion();

    window.addEventListener("resize", updateViewport, { passive: true });
    if (mobileMedia) {
      if (mobileMedia.addEventListener) mobileMedia.addEventListener("change", updateViewport);
      else mobileMedia.addListener(updateViewport);
    }
    if (motionMedia) {
      if (motionMedia.addEventListener) motionMedia.addEventListener("change", updateMotion);
      else motionMedia.addListener(updateMotion);
    }

    return () => {
      window.removeEventListener("resize", updateViewport);
      if (mobileMedia) {
        if (mobileMedia.removeEventListener) mobileMedia.removeEventListener("change", updateViewport);
        else mobileMedia.removeListener(updateViewport);
      }
      if (motionMedia) {
        if (motionMedia.removeEventListener) motionMedia.removeEventListener("change", updateMotion);
        else motionMedia.removeListener(updateMotion);
      }
    };
  }, []);

  // Observe banner visibility to lazy-load near the fold and play/pause on screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    if (rect.top < vh + 220 && rect.bottom > -220) {
      setShouldLoad(true);
    }
    if (rect.top < vh && rect.bottom > 0) {
      setIsOnScreen(true);
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      setIsOnScreen(true);
      return;
    }

    const approachObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
          }
        });
      },
      { rootMargin: "220px 0px", threshold: 0 }
    );

    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsOnScreen(visible);
          if (visible) {
            setShouldLoad(true);
          }
        });
      },
      { rootMargin: "0px", threshold: 0.01 }
    );

    approachObserver.observe(el);
    playObserver.observe(el);

    return () => {
      approachObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  const isLight = theme === "light";
  const staticWebp = isLight
    ? "/assets/images/about-summitscape-light.webp"
    : "/assets/images/about-summitscape.webp";
  const staticPng = isLight
    ? "/assets/images/about-summitscape-light.png"
    : "/assets/images/about-summitscape.png";
  const activeVideoSrc = getSummitVideoSource(theme, isMobile);

  // Swap video source immediately on theme/viewport change without reload
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (reducedMotion || !shouldLoad) {
      videoEl.pause();
      return;
    }

    if (loadedSrcRef.current !== activeVideoSrc) {
      loadedSrcRef.current = activeVideoSrc;
      setFailedSrc((prev) => (prev === activeVideoSrc ? null : prev));
      if (videoEl.getAttribute("src") !== activeVideoSrc) {
        videoEl.setAttribute("src", activeVideoSrc);
      }
      videoEl.load();
    } else if (videoEl.readyState >= 2) {
      setReadySrc(activeVideoSrc);
    }

    if (isOnScreen) {
      const playPromise = videoEl.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } else {
      videoEl.pause();
    }
  }, [activeVideoSrc, shouldLoad, reducedMotion, isOnScreen]);

  const isVideoReady = readySrc === activeVideoSrc && failedSrc !== activeVideoSrc;
  const isVideoFailed = failedSrc === activeVideoSrc;

  return h(
    "div",
    {
      ref: containerRef,
      className: "section-summit-bg",
      "aria-hidden": "true"
    },
    h(
      "picture",
      { className: "section-summit-pic" },
      h("source", {
        srcSet: staticWebp,
        type: "image/webp"
      }),
      h("img", {
        src: staticPng,
        alt: "",
        width: 1568,
        height: 627,
        loading: "lazy",
        decoding: "async",
        className: "section-summit-img"
      })
    ),
    !reducedMotion &&
      h("video", {
        ref: videoRef,
        className: `section-summit-video${isVideoReady ? " is-ready" : ""}${isVideoFailed ? " is-failed" : ""}`,
        src: shouldLoad ? activeVideoSrc : undefined,
        poster: staticWebp,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        preload: shouldLoad ? "auto" : "none",
        "aria-hidden": "true",
        tabIndex: -1,
        onLoadedData: () => setReadySrc(activeVideoSrc),
        onCanPlay: () => setReadySrc(activeVideoSrc),
        onPlaying: () => setReadySrc(activeVideoSrc),
        onError: () => {
          setFailedSrc(activeVideoSrc);
          setReadySrc((prev) => (prev === activeVideoSrc ? null : prev));
        }
      }),
    h("div", { className: "section-summit-glow" }),
    h("div", { className: "section-summit-overlay" })
  );
}
