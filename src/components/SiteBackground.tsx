"use client";

import { useEffect, useState } from "react";

// Fixed, full-viewport background shared by every page.
// Reduced-motion visitors get the still poster instead of the looping video.
export function SiteBackground() {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(motion.matches || document.documentElement.dataset.motion === "reduce");
    apply();
    motion.addEventListener("change", apply);
    return () => motion.removeEventListener("change", apply);
  }, []);

  return (
    <div className="site-bg" aria-hidden="true">
      {reduced ? (
        <img src="/images/hero-background-poster.jpg" alt="" />
      ) : (
        <video
          src="/videos/hero-background.mp4"
          poster="/images/hero-background-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      )}
      <div className="site-bg-shade" />
    </div>
  );
}
