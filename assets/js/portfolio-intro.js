// ==========================================================================
// FARDIN.AI — CINEMATIC WELCOME INTRO COMPONENT
// 6-Second Entrance Animation: Bot F-01 & Doorway Access to Fardin.AI
// ==========================================================================

import React, { useEffect, useRef, useState, useCallback } from "react";

const h = React.createElement;
const SESSION_KEY = "welcome-intro-seen";
const motionQuery = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(motionQuery).matches;
}

export function shouldPlayWelcomeIntro() {
  if (typeof window === "undefined") return false;

  // Trigger 3: Hard reload or normal reload
  try {
    const navEntries = performance.getEntriesByType?.("navigation");
    if (navEntries && navEntries.length > 0 && navEntries[0].type === "reload") {
      if (prefersReducedMotion()) return false;
      return true;
    }
  } catch (_) {}

  // Trigger 1: First entry in a browser session
  try {
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      sessionStorage.setItem(SESSION_KEY, "true");
      if (prefersReducedMotion()) return false;
      return true;
    }
  } catch (_) {}

  return false;
}

export function hasSeenWelcomeIntro() {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "true";
  } catch (_) {
    return false;
  }
}

export function markWelcomeIntroSeen() {
  try {
    sessionStorage.setItem(SESSION_KEY, "true");
  } catch (_) {}
}

export function resetWelcomeIntroSeen() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (_) {}
}

// Backwards-compatible aliases
export const hasSeenIntro = hasSeenWelcomeIntro;
export const markIntroSeen = markWelcomeIntroSeen;
export const resetIntroSeen = resetWelcomeIntroSeen;

export function WelcomeIntro({ onComplete }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const completedRef = useRef(false);
  const videoRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const startTimeoutRef = useRef(null);
  const finishTimeoutRef = useRef(null);

  // Pick video file by viewport on mount (>=768px desktop, <768px mobile)
  // Viewport resize mid-play will NOT swap the video (finishes the one that started)
  const [videoSrc] = useState(() => {
    if (typeof window === "undefined") {
      return "/assets/videos/welcome/Welcome_Desktop_Dark_6s.mp4";
    }
    return window.innerWidth >= 768
      ? "/assets/videos/welcome/Welcome_Desktop_Dark_6s.mp4"
      : "/assets/videos/welcome/Welcome_Mobile_Dark_6s.mp4";
  });

  const dismissImmediate = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);

    const video = videoRef.current;
    if (video) {
      try {
        video.pause();
      } catch (_) {}
    }

    onComplete?.();
  }, [onComplete]);

  const handleEnded = useCallback(() => {
    if (completedRef.current) return;
    setIsFadingOut(true);
    dismissTimerRef.current = setTimeout(() => {
      dismissImmediate();
    }, 500);
  }, [dismissImmediate]);

  // Lock page scrolling while overlay is mounted; restore on unmount
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Keyboard accessibility: dismiss on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        dismissImmediate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissImmediate]);

  // Video playback & failsafes
  useEffect(() => {
    if (prefersReducedMotion()) {
      dismissImmediate();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Failsafe 1: Must start playing within ~2 seconds
    startTimeoutRef.current = setTimeout(() => {
      if (video.currentTime === 0 || video.paused) {
        dismissImmediate();
      }
    }, 2000);

    // Failsafe 2: Must finish within ~8 seconds
    finishTimeoutRef.current = setTimeout(() => {
      dismissImmediate();
    }, 8000);

    video.muted = true;
    video.defaultMuted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        dismissImmediate();
      });
    }

    return () => {
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [dismissImmediate]);

  const handleTimeUpdate = () => {
    if (startTimeoutRef.current && videoRef.current && videoRef.current.currentTime > 0) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
  };

  return h(
    "div",
    {
      className: `welcome-intro-overlay${isFadingOut ? " is-fading-out" : ""}`,
      role: "dialog",
      "aria-label": "Welcome cinematic entrance",
      "aria-modal": "true"
    },
    h("video", {
      ref: videoRef,
      src: videoSrc,
      className: "welcome-intro-video",
      autoPlay: true,
      muted: true,
      playsInline: true,
      preload: "auto",
      disablePictureInPicture: true,
      onEnded: handleEnded,
      onError: dismissImmediate,
      onTimeUpdate: handleTimeUpdate,
      "aria-hidden": "true"
    }),
    h(
      "button",
      {
        type: "button",
        className: "welcome-intro-skip-btn",
        onClick: (e) => {
          e.stopPropagation();
          dismissImmediate();
        },
        "aria-label": "Skip intro"
      },
      "Skip intro"
    )
  );
}

// Backwards-compatible component alias
export const PortfolioIntro = WelcomeIntro;
