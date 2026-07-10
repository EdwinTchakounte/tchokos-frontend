"use client";

import { useState } from "react";
import type { ProductImage } from "@/lib/types";
import { SafeImage } from "./SafeImage";

export function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl bg-slate-100 text-slate-300">
        Pas d&apos;image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50">
        <SafeImage
          src={images[active].image}
          alt={images[active].alt || name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          preload
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-brand-600" : "border-transparent"
              }`}
            >
              <SafeImage
                src={img.image}
                alt={img.alt || name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
