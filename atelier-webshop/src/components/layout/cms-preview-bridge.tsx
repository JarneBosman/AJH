"use client";

import { useEffect } from "react";

interface AppearancePreviewPayload {
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
  fontBody: "manrope" | "jakarta" | "system" | "serif";
  fontHeading: "manrope" | "jakarta" | "system" | "serif";
  buttonRadius: string;
}

const resolveFontPreset = (preset: "manrope" | "jakarta" | "system" | "serif", fallback: "body" | "heading") => {
  if (preset === "manrope") {
    return "var(--font-manrope), sans-serif";
  }

  if (preset === "jakarta") {
    return "var(--font-jakarta), sans-serif";
  }

  if (preset === "system") {
    return "ui-sans-serif, system-ui, sans-serif";
  }

  if (preset === "serif") {
    return "Georgia, Times New Roman, serif";
  }

  return fallback === "body"
    ? "var(--font-manrope), sans-serif"
    : "var(--font-jakarta), sans-serif";
};

interface OverlaySelectedMessage {
  type: "cms-preview:selected";
  payload: {
    id: string;
    capabilities: {
      text: boolean;
      color: boolean;
      background: boolean;
      shape: boolean;
      image: boolean;
      location: boolean;
    };
    values: {
      text: string;
      color: string;
      fontFamily: string;
      fontSize: string;
      fontWeight: string;
      backgroundColor: string;
      borderRadius: string;
      imageUrl: string;
      x: number;
      y: number;
    };
  };
}

type PreviewMessage =
  | {
      type: "cms-preview:update";
      payload: AppearancePreviewPayload;
    }
  | {
      type: "cms-preview:editor:toggle";
      payload: { enabled: boolean };
    }
  | {
      type: "cms-preview:editor:select";
      payload: { id: string };
    }
  | {
      type: "cms-preview:editor:apply";
      payload: {
        id: string;
        changes: Partial<{
          text: string;
          color: string;
          fontFamily: string;
          fontSize: string;
          fontWeight: string;
          backgroundColor: string;
          borderRadius: string;
          imageUrl: string;
          x: number;
          y: number;
        }>;
      };
    };

const clampNumeric = (value: number) => (Number.isFinite(value) ? value : 0);

const parseEditTypes = (element: HTMLElement) => {
  const raw = element.dataset.cmsEditTypes ?? "";
  const types = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return {
    text: types.includes("text"),
    color: types.includes("color"),
    background: types.includes("background"),
    shape: types.includes("shape"),
    image: types.includes("image"),
    location: types.includes("location"),
  };
};

const findEditableElementById = (id: string) =>
  document.querySelector<HTMLElement>(`[data-cms-editable=\"${id}\"]`);

const findTextTarget = (element: HTMLElement) => {
  const selector = element.dataset.cmsTextTarget;

  if (selector) {
    const target = element.querySelector<HTMLElement>(selector);
    if (target) {
      return target;
    }
  }

  return element;
};

const findImageTarget = (element: HTMLElement) => {
  const selector = element.dataset.cmsImageTarget;

  if (selector) {
    const target = element.querySelector<HTMLImageElement>(selector);
    if (target) {
      return target;
    }
  }

  return element.querySelector<HTMLImageElement>("img");
};

const collectValues = (element: HTMLElement) => {
  const computed = window.getComputedStyle(element);
  const textTarget = findTextTarget(element);
  const textComputed = window.getComputedStyle(textTarget ?? element);
  const imageTarget = findImageTarget(element);

  return {
    text: textTarget?.textContent?.trim() ?? "",
    color: textComputed.color,
    fontFamily: textComputed.fontFamily,
    fontSize: textComputed.fontSize,
    fontWeight: textComputed.fontWeight,
    backgroundColor: computed.backgroundColor,
    borderRadius: computed.borderRadius,
    imageUrl: imageTarget?.src ?? "",
    x: clampNumeric(Number(element.dataset.cmsX ?? "0")),
    y: clampNumeric(Number(element.dataset.cmsY ?? "0")),
  };
};

export const CmsPreviewBridge = () => {
  useEffect(() => {
    let editorEnabled = false;
    let selectedId: string | null = null;
    let dragState:
      | {
          id: string;
          startClientX: number;
          startClientY: number;
          startX: number;
          startY: number;
        }
      | null = null;

    const updateEditorState = () => {
      document.body.dataset.cmsEditorEnabled = editorEnabled ? "true" : "false";
      document
        .querySelectorAll<HTMLElement>("[data-cms-editable]")
        .forEach((element) => {
          if (selectedId && element.dataset.cmsEditable === selectedId) {
            element.classList.add("cms-editable-selected");
          } else {
            element.classList.remove("cms-editable-selected");
          }
        });
    };

    const postSelectedToParent = (element: HTMLElement) => {
      const id = element.dataset.cmsEditable;
      if (!id) {
        return;
      }

      selectedId = id;
      updateEditorState();

      const message: OverlaySelectedMessage = {
        type: "cms-preview:selected",
        payload: {
          id,
          capabilities: parseEditTypes(element),
          values: collectValues(element),
        },
      };

      window.parent.postMessage(message, window.location.origin);
    };

    const applyChange = (
      element: HTMLElement,
      changes: Partial<{
        text: string;
        color: string;
        fontFamily: string;
        fontSize: string;
        fontWeight: string;
        backgroundColor: string;
        borderRadius: string;
        imageUrl: string;
        x: number;
        y: number;
      }>,
    ) => {
      const textTarget = findTextTarget(element) ?? element;

      if (changes.text !== undefined) {
        if (textTarget) {
          textTarget.textContent = changes.text;
        }
      }

      if (changes.color !== undefined) {
        textTarget.style.color = changes.color;
      }

      if (changes.fontFamily !== undefined) {
        textTarget.style.fontFamily = changes.fontFamily;
      }

      if (changes.fontSize !== undefined) {
        textTarget.style.fontSize = changes.fontSize;
      }

      if (changes.fontWeight !== undefined) {
        textTarget.style.fontWeight = changes.fontWeight;
      }

      if (changes.backgroundColor !== undefined) {
        element.style.backgroundColor = changes.backgroundColor;
      }

      if (changes.borderRadius !== undefined) {
        element.style.borderRadius = changes.borderRadius;
      }

      if (changes.imageUrl !== undefined) {
        const imageTarget = findImageTarget(element);
        if (imageTarget && changes.imageUrl.trim()) {
          imageTarget.src = changes.imageUrl.trim();
        }
      }

      if (changes.x !== undefined || changes.y !== undefined) {
        const x = clampNumeric(changes.x ?? Number(element.dataset.cmsX ?? "0"));
        const y = clampNumeric(changes.y ?? Number(element.dataset.cmsY ?? "0"));
        element.dataset.cmsX = String(x);
        element.dataset.cmsY = String(y);
        element.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    const handler = (event: MessageEvent) => {
      const message = event.data as PreviewMessage;

      if (!message) {
        return;
      }

      if (message.type === "cms-preview:update") {
        const payload = message.payload;

        document.body.style.setProperty("--color-bg", payload.colorBg);
        document.body.style.setProperty("--color-ink", payload.colorInk);
        document.body.style.setProperty("--color-muted", payload.colorMuted);
        document.body.style.setProperty("--color-neutral-100", payload.colorNeutral100);
        document.body.style.setProperty("--color-neutral-200", payload.colorNeutral200);
        document.body.style.setProperty("--color-neutral-300", payload.colorNeutral300);
        document.body.style.setProperty("--color-wood", payload.colorWood);
        document.body.style.setProperty("--color-wood-dark", payload.colorWoodDark);
        document.body.style.setProperty("--font-body", resolveFontPreset(payload.fontBody, "body"));
        document.body.style.setProperty("--font-heading", resolveFontPreset(payload.fontHeading, "heading"));
        document.body.style.setProperty("--button-radius", payload.buttonRadius || "9999px");
        document.body.dataset.layout = payload.layoutMode;
        document.body.dataset.layoutContainer = payload.containerWidth;
        document.body.dataset.sectionSpacing = payload.sectionSpacing;
        document.body.dataset.heroLayout = payload.heroLayout;

        const brandNode = document.querySelector("[data-preview-brand]");
        if (brandNode) {
          brandNode.textContent = payload.brandName || "Atelier Nord";
        }

        return;
      }

      if (message.type === "cms-preview:editor:toggle") {
        editorEnabled = Boolean(message.payload.enabled);

        if (!editorEnabled) {
          selectedId = null;
        }

        updateEditorState();
        return;
      }

      if (message.type === "cms-preview:editor:select") {
        const element = findEditableElementById(message.payload.id);
        if (element) {
          postSelectedToParent(element);
        }

        return;
      }

      if (message.type === "cms-preview:editor:apply") {
        const element = findEditableElementById(message.payload.id);
        if (!element) {
          return;
        }

        applyChange(element, message.payload.changes);
        postSelectedToParent(element);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!editorEnabled || !selectedId) {
        return;
      }

      const selectedElement = findEditableElementById(selectedId);
      if (!selectedElement) {
        return;
      }

      const withinSelected = (event.target as HTMLElement | null)?.closest(
        `[data-cms-editable=\"${selectedId}\"]`,
      );

      if (!withinSelected) {
        return;
      }

      const capabilities = parseEditTypes(selectedElement);
      if (!capabilities.location) {
        return;
      }

      dragState = {
        id: selectedId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: clampNumeric(Number(selectedElement.dataset.cmsX ?? "0")),
        startY: clampNumeric(Number(selectedElement.dataset.cmsY ?? "0")),
      };

      event.preventDefault();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragState) {
        return;
      }

      const element = findEditableElementById(dragState.id);
      if (!element) {
        return;
      }

      const x = dragState.startX + (event.clientX - dragState.startClientX);
      const y = dragState.startY + (event.clientY - dragState.startClientY);

      element.dataset.cmsX = String(Math.round(x));
      element.dataset.cmsY = String(Math.round(y));
      element.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;

      window.parent.postMessage(
        {
          type: "cms-preview:position",
          payload: {
            id: dragState.id,
            x: Math.round(x),
            y: Math.round(y),
          },
        },
        window.location.origin,
      );
    };

    const handlePointerUp = () => {
      dragState = null;
    };

    const handleClick = (event: MouseEvent) => {
      if (!editorEnabled) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const editable = target.closest<HTMLElement>("[data-cms-editable]");
      if (!editable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      postSelectedToParent(editable);
    };

    window.addEventListener("message", handler);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return null;
};
