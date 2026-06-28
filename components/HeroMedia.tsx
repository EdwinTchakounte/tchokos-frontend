"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Fond du hero : image poster (toujours, léger pour le mobile / 3G) +
 * vidéo en superposition UNIQUEMENT sur écran large, pour ne pas alourdir
 * le chargement mobile (contexte bande passante limitée au Cameroun).
 */
export function HeroMedia({ poster, src }: { poster: string; src: string }) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (mq.matches && !reduce) setShowVideo(true);
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <Image
        src={poster}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {showVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
