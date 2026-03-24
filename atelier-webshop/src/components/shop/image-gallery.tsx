"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[var(--color-neutral-100)]">
        <Image
          src={activeImage}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-2xl border-2 transition",
              activeImage === image
                ? "border-[var(--color-wood-dark)]"
                : "border-transparent hover:border-[var(--color-neutral-300)]",
            )}
            aria-label={`Show image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${alt} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 20vw"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
