"use client";

import { useEffect } from "react";

interface PreviewMessage {
  type: "cms-preview:update";
  payload: {
    brandName: string;
    colorBg: string;
    colorInk: string;
    colorMuted: string;
    colorNeutral100: string;
    colorNeutral200: string;
    colorNeutral300: string;
    colorWood: string;
    colorWoodDark: string;
    layoutMode: "compact" | "balanced" | "spacious";
    containerWidth: "narrow" | "standard" | "wide";
    sectionSpacing: "tight" | "balanced" | "airy";
    heroLayout: "split" | "centered" | "image-first";
  };
}

export const CmsPreviewBridge = () => {
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data as PreviewMessage;

      if (!message || message.type !== "cms-preview:update") {
        return;
      }

      const payload = message.payload;

      document.body.style.setProperty("--color-bg", payload.colorBg);
      document.body.style.setProperty("--color-ink", payload.colorInk);
      document.body.style.setProperty("--color-muted", payload.colorMuted);
      document.body.style.setProperty("--color-neutral-100", payload.colorNeutral100);
      document.body.style.setProperty("--color-neutral-200", payload.colorNeutral200);
      document.body.style.setProperty("--color-neutral-300", payload.colorNeutral300);
      document.body.style.setProperty("--color-wood", payload.colorWood);
      document.body.style.setProperty("--color-wood-dark", payload.colorWoodDark);
      document.body.dataset.layout = payload.layoutMode;
      document.body.dataset.layoutContainer = payload.containerWidth;
      document.body.dataset.sectionSpacing = payload.sectionSpacing;
      document.body.dataset.heroLayout = payload.heroLayout;

      const brandNode = document.querySelector("[data-preview-brand]");
      if (brandNode) {
        brandNode.textContent = payload.brandName || "Atelier Nord";
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return null;
};
