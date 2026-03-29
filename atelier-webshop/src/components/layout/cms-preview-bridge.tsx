"use client";

import { useEffect } from "react";

interface AppearancePreviewPayload {
  brandName: string;
  logoUrl: string;
  logoColor: string;
  colorBg: string;
  colorText: string;
  colorInk: string;
  colorMuted: string;
  colorNeutral100: string;
  colorNeutral200: string;
  colorNeutral300: string;
  colorWood: string;
  colorWoodDark: string;
  colorButtonBg: string;
  colorButtonBgHover: string;
  colorButtonText: string;
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
    tagName: string;
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
      width: number;
      height: number;
    };
  };
}

type PreviewMessage =
  | {
      type: "cms-preview:update";
      payload: AppearancePreviewPayload;
    }
  | {
      type: "cms-preview:home-custom-blocks";
      payload: {
        blocks: Array<{
          id: string;
          type: "text" | "image";
          text?: string;
          imageUrl?: string;
          alt?: string;
          backgroundColor?: string;
          backgroundShape?: "rounded-square" | "pill";
        }>;
      };
    }
  | {
      type: "cms-preview:hidden-editables";
      payload: {
        ids: string[];
      };
    }
  | {
      type: "cms-preview:editor:toggle";
      payload: { enabled: boolean };
    }
  | {
      type: "cms-preview:editor:grid-toggle";
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
          width: number;
          height: number;
        }>;
      };
    }
  | {
      type: "cms-preview:editor:remove";
      payload: {
        id: string;
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

type ResizeEdge = "left" | "right" | "top" | "bottom";

const getResizeEdgesAtPointer = (
  element: HTMLElement,
  clientX: number,
  clientY: number,
  threshold = 10,
): ResizeEdge[] => {
  const rect = element.getBoundingClientRect();
  const edges: ResizeEdge[] = [];

  if (Math.abs(clientX - rect.left) <= threshold) {
    edges.push("left");
  }

  if (Math.abs(clientX - rect.right) <= threshold) {
    edges.push("right");
  }

  if (Math.abs(clientY - rect.top) <= threshold) {
    edges.push("top");
  }

  if (Math.abs(clientY - rect.bottom) <= threshold) {
    edges.push("bottom");
  }

  return edges;
};

const getCursorForEdges = (edges: ResizeEdge[]): string => {
  if (edges.includes("left") && edges.includes("top")) {
    return "nwse-resize";
  }

  if (edges.includes("right") && edges.includes("bottom")) {
    return "nwse-resize";
  }

  if (edges.includes("right") && edges.includes("top")) {
    return "nesw-resize";
  }

  if (edges.includes("left") && edges.includes("bottom")) {
    return "nesw-resize";
  }

  if (edges.includes("left") || edges.includes("right")) {
    return "ew-resize";
  }

  if (edges.includes("top") || edges.includes("bottom")) {
    return "ns-resize";
  }

  return "move";
};

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
    const target = element.querySelector<HTMLElement>(selector);
    if (target) {
      return target;
    }
  }

  return element.querySelector<HTMLElement>("img");
};

const extractBackgroundImageUrl = (backgroundImage: string) => {
  if (!backgroundImage || backgroundImage === "none") {
    return "";
  }

  const match = backgroundImage.match(/url\(["']?(.*?)["']?\)/i);
  return match?.[1] ?? "";
};

const setImageUrlOnTarget = (target: HTMLElement, nextUrl: string) => {
  const trimmedUrl = nextUrl.trim();
  if (!trimmedUrl) {
    return;
  }

  if (target instanceof HTMLImageElement) {
    // Clear srcset to ensure the browser renders the freshly selected URL.
    target.removeAttribute("srcset");
    target.srcset = "";
    target.src = trimmedUrl;
    target.setAttribute("src", trimmedUrl);
    return;
  }

  target.style.backgroundImage = `url("${trimmedUrl}")`;
};

const collectValues = (element: HTMLElement) => {
  const computed = window.getComputedStyle(element);
  const textTarget = findTextTarget(element);
  const textComputed = window.getComputedStyle(textTarget ?? element);
  const imageTarget = findImageTarget(element);
  const imageUrl = imageTarget
    ? imageTarget instanceof HTMLImageElement
      ? imageTarget.currentSrc || imageTarget.src
      : extractBackgroundImageUrl(window.getComputedStyle(imageTarget).backgroundImage)
    : "";

  return {
    text: textTarget?.textContent?.trim() ?? "",
    color: textComputed.color,
    fontFamily: textComputed.fontFamily,
    fontSize: textComputed.fontSize,
    fontWeight: textComputed.fontWeight,
    backgroundColor: computed.backgroundColor,
    borderRadius: computed.borderRadius,
    imageUrl,
    x: clampNumeric(Number(element.dataset.cmsX ?? "0")),
    y: clampNumeric(Number(element.dataset.cmsY ?? "0")),
    width: Math.round(element.getBoundingClientRect().width),
    height: Math.round(element.getBoundingClientRect().height),
  };
};

const renderHomeCustomBlocks = (
  blocks: Array<{
    id: string;
    type: "text" | "image";
    text?: string;
    imageUrl?: string;
    alt?: string;
    backgroundColor?: string;
    backgroundShape?: "rounded-square" | "pill";
  }>,
  attempt = 0,
) => {
  const section = document.querySelector<HTMLElement>("[data-cms-custom-blocks-section]");
  const container = document.querySelector<HTMLElement>("[data-cms-custom-blocks]");
  if (!section || !container) {
    if (attempt < 6) {
      window.setTimeout(() => renderHomeCustomBlocks(blocks, attempt + 1), 120);
    }
    return;
  }

  container.replaceChildren();

  for (const block of blocks) {
    const nextRadius = block.backgroundShape === "pill" ? "9999px" : "1.5rem";
    const nextBackground = block.backgroundColor?.trim() || "#ffffff";

    if (block.type === "text") {
      const article = document.createElement("article");
      article.className =
        "rounded-3xl border border-black/5 bg-white px-5 py-6 text-[var(--color-muted)] shadow-[0_20px_45px_-35px_rgba(0,0,0,0.45)]";
      article.dataset.cmsEditable = `home.customBlock.${block.id}`;
      article.dataset.cmsEditTypes = "text,color,shape,location,background";
      article.style.backgroundColor = nextBackground;
      article.style.borderRadius = nextRadius;

      const paragraph = document.createElement("p");
      paragraph.className = "leading-7";
      paragraph.textContent = block.text?.trim() || "New text block";

      article.appendChild(paragraph);
      container.appendChild(article);
      continue;
    }

    if (block.type === "image") {
      const figure = document.createElement("figure");
      figure.className =
        "relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_25px_55px_-35px_rgba(0,0,0,0.5)]";
      figure.dataset.cmsEditable = `home.customBlock.${block.id}`;
      figure.dataset.cmsEditTypes = "image,shape,location,background";
      figure.dataset.cmsImageTarget = ".cms-custom-block-image";
      figure.style.backgroundColor = nextBackground;
      figure.style.borderRadius = nextRadius;

      const wrapper = document.createElement("div");
      wrapper.className = "relative aspect-[4/3] w-full";

      const image = document.createElement("img");
      image.src =
        block.imageUrl?.trim() || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
      image.alt = block.alt?.trim() || "Homepage custom block image";
      image.className = "cms-custom-block-image h-full w-full object-cover";

      wrapper.appendChild(image);

      if (!block.imageUrl?.trim()) {
        const placeholder = document.createElement("div");
        placeholder.className =
          "pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--color-neutral-200)] text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]";
        placeholder.textContent = "Add image";
        wrapper.appendChild(placeholder);
      }

      figure.appendChild(wrapper);
      container.appendChild(figure);
    }
  }

  if (container.children.length === 0) {
    section.classList.add("hidden");
  } else {
    section.classList.remove("hidden");
  }
};

const removeEditableNodesById = (ids: string[], attempt = 0) => {
  if (ids.length === 0) {
    return;
  }

  let missing = false;

  for (const id of ids) {
    const element = findEditableElementById(id);
    if (!element) {
      missing = true;
      continue;
    }

    let removeTarget: HTMLElement = element;
    if (
      element.tagName === "BUTTON" &&
      element.parentElement?.tagName === "A" &&
      element.parentElement.children.length === 1
    ) {
      removeTarget = element.parentElement as HTMLElement;
    }

    removeTarget.remove();
  }

  if (missing && attempt < 6) {
    window.setTimeout(() => removeEditableNodesById(ids, attempt + 1), 120);
  }
};

export const CmsPreviewBridge = () => {
  useEffect(() => {
    let editorEnabled = false;
    let gridSnapEnabled = false;
    const gridStep = 12;
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
    let resizeState:
      | {
          id: string;
          edges: ResizeEdge[];
          startClientX: number;
          startClientY: number;
          startX: number;
          startY: number;
          startWidth: number;
          startHeight: number;
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
          tagName: element.tagName,
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
        width: number;
        height: number;
      }>,
    ) => {
      const capabilities = parseEditTypes(element);
      const textTarget = findTextTarget(element) ?? element;

      if (capabilities.text && changes.text !== undefined) {
        if (textTarget) {
          textTarget.textContent = changes.text;
        }
      }

      if (capabilities.color && changes.color !== undefined) {
        textTarget.style.color = changes.color;
      }

      if ((capabilities.text || capabilities.color) && changes.fontFamily !== undefined) {
        textTarget.style.fontFamily = changes.fontFamily;
      }

      if ((capabilities.text || capabilities.color) && changes.fontSize !== undefined) {
        textTarget.style.fontSize = changes.fontSize;
      }

      if ((capabilities.text || capabilities.color) && changes.fontWeight !== undefined) {
        textTarget.style.fontWeight = changes.fontWeight;
      }

      if (capabilities.background && changes.backgroundColor !== undefined) {
        element.style.backgroundColor = changes.backgroundColor;
      }

      if (capabilities.shape && changes.borderRadius !== undefined) {
        element.style.borderRadius = changes.borderRadius;
      }

      if (capabilities.image && changes.imageUrl !== undefined) {
        const imageTarget = findImageTarget(element);
        if (imageTarget) {
          setImageUrlOnTarget(imageTarget, changes.imageUrl);
        }
      }

      if (capabilities.location && (changes.x !== undefined || changes.y !== undefined)) {
        const x = clampNumeric(changes.x ?? Number(element.dataset.cmsX ?? "0"));
        const y = clampNumeric(changes.y ?? Number(element.dataset.cmsY ?? "0"));
        element.dataset.cmsX = String(x);
        element.dataset.cmsY = String(y);
        element.style.transform = `translate(${x}px, ${y}px)`;
      }

      if (capabilities.location && changes.width !== undefined) {
        element.style.width = `${Math.max(1, Math.round(changes.width))}px`;
      }

      if (capabilities.location && changes.height !== undefined) {
        element.style.height = `${Math.max(1, Math.round(changes.height))}px`;
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
        document.body.style.setProperty("--color-text", payload.colorText);
        document.body.style.setProperty("--color-ink", payload.colorInk);
        document.body.style.setProperty("--color-muted", payload.colorMuted);
        document.body.style.setProperty("--color-neutral-100", payload.colorNeutral100);
        document.body.style.setProperty("--color-neutral-200", payload.colorNeutral200);
        document.body.style.setProperty("--color-neutral-300", payload.colorNeutral300);
        document.body.style.setProperty("--color-wood", payload.colorWood);
        document.body.style.setProperty("--color-wood-dark", payload.colorWoodDark);
        document.body.style.setProperty("--color-button-bg", payload.colorButtonBg);
        document.body.style.setProperty("--color-button-bg-hover", payload.colorButtonBgHover);
        document.body.style.setProperty("--color-button-text", payload.colorButtonText);
        document.body.style.setProperty("--color-logo", payload.logoColor);
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

        const logoImageNode = document.querySelector<HTMLImageElement>("[data-preview-logo-image]");
        if (logoImageNode && payload.logoUrl) {
          logoImageNode.removeAttribute("srcset");
          logoImageNode.src = payload.logoUrl;
          logoImageNode.setAttribute("src", payload.logoUrl);
        }

        return;
      }

      if (message.type === "cms-preview:home-custom-blocks") {
        renderHomeCustomBlocks(message.payload.blocks);
        return;
      }

      if (message.type === "cms-preview:hidden-editables") {
        const ids = Array.isArray(message.payload.ids)
          ? message.payload.ids.filter((entry): entry is string => typeof entry === "string")
          : [];

        removeEditableNodesById(ids);
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

      if (message.type === "cms-preview:editor:grid-toggle") {
        gridSnapEnabled = Boolean(message.payload.enabled);
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
        return;
      }

      if (message.type === "cms-preview:editor:remove") {
        const element = findEditableElementById(message.payload.id);
        if (!element) {
          return;
        }

        let removeTarget: HTMLElement = element;
        if (
          element.tagName === "BUTTON" &&
          element.parentElement?.tagName === "A" &&
          element.parentElement.children.length === 1
        ) {
          removeTarget = element.parentElement as HTMLElement;
        }

        removeTarget.remove();

        if (selectedId === message.payload.id) {
          selectedId = null;
          updateEditorState();
        }
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

      const resizeEdges = getResizeEdgesAtPointer(selectedElement, event.clientX, event.clientY);

      if (resizeEdges.length > 0) {
        const rect = selectedElement.getBoundingClientRect();
        resizeState = {
          id: selectedId,
          edges: resizeEdges,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startX: clampNumeric(Number(selectedElement.dataset.cmsX ?? "0")),
          startY: clampNumeric(Number(selectedElement.dataset.cmsY ?? "0")),
          startWidth: rect.width,
          startHeight: rect.height,
        };

        event.preventDefault();
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
      if (resizeState) {
        const element = findEditableElementById(resizeState.id);
        if (!element) {
          return;
        }

        const deltaX = event.clientX - resizeState.startClientX;
        const deltaY = event.clientY - resizeState.startClientY;
        const minWidth = 48;
        const minHeight = 48;

        let nextX = resizeState.startX;
        let nextY = resizeState.startY;
        let nextWidth = resizeState.startWidth;
        let nextHeight = resizeState.startHeight;

        if (resizeState.edges.includes("right")) {
          nextWidth = Math.max(minWidth, resizeState.startWidth + deltaX);
        }

        if (resizeState.edges.includes("bottom")) {
          nextHeight = Math.max(minHeight, resizeState.startHeight + deltaY);
        }

        if (resizeState.edges.includes("left")) {
          const rawWidth = resizeState.startWidth - deltaX;
          nextWidth = Math.max(minWidth, rawWidth);
          nextX = resizeState.startX + (resizeState.startWidth - nextWidth);
        }

        if (resizeState.edges.includes("top")) {
          const rawHeight = resizeState.startHeight - deltaY;
          nextHeight = Math.max(minHeight, rawHeight);
          nextY = resizeState.startY + (resizeState.startHeight - nextHeight);
        }

        if (gridSnapEnabled) {
          nextWidth = Math.max(minWidth, Math.round(nextWidth / gridStep) * gridStep);
          nextHeight = Math.max(minHeight, Math.round(nextHeight / gridStep) * gridStep);
          nextX = Math.round(nextX / gridStep) * gridStep;
          nextY = Math.round(nextY / gridStep) * gridStep;
        } else {
          nextWidth = Math.round(nextWidth);
          nextHeight = Math.round(nextHeight);
          nextX = Math.round(nextX);
          nextY = Math.round(nextY);
        }

        element.style.width = `${nextWidth}px`;
        element.style.height = `${nextHeight}px`;
        element.dataset.cmsX = String(nextX);
        element.dataset.cmsY = String(nextY);
        element.style.transform = `translate(${nextX}px, ${nextY}px)`;

        window.parent.postMessage(
          {
            type: "cms-preview:position",
            payload: {
              id: resizeState.id,
              x: nextX,
              y: nextY,
              width: nextWidth,
              height: nextHeight,
            },
          },
          window.location.origin,
        );

        return;
      }

      if (!dragState) {
        if (!editorEnabled || !selectedId) {
          return;
        }

        const selectedElement = findEditableElementById(selectedId);
        if (!selectedElement) {
          return;
        }

        const pointerTarget = event.target as HTMLElement | null;
        const withinSelected = pointerTarget?.closest(`[data-cms-editable=\"${selectedId}\"]`);
        if (!withinSelected) {
          selectedElement.style.cursor = "";
          return;
        }

        const capabilities = parseEditTypes(selectedElement);
        if (!capabilities.location) {
          selectedElement.style.cursor = "";
          return;
        }

        const edges = getResizeEdgesAtPointer(selectedElement, event.clientX, event.clientY);
        selectedElement.style.cursor = getCursorForEdges(edges);
        return;
      }

      const element = findEditableElementById(dragState.id);
      if (!element) {
        return;
      }

      const x = dragState.startX + (event.clientX - dragState.startClientX);
      const y = dragState.startY + (event.clientY - dragState.startClientY);

      const nextX = gridSnapEnabled ? Math.round(x / gridStep) * gridStep : Math.round(x);
      const nextY = gridSnapEnabled ? Math.round(y / gridStep) * gridStep : Math.round(y);

      element.dataset.cmsX = String(nextX);
      element.dataset.cmsY = String(nextY);
      element.style.transform = `translate(${nextX}px, ${nextY}px)`;

      window.parent.postMessage(
        {
          type: "cms-preview:position",
          payload: {
            id: dragState.id,
            x: nextX,
            y: nextY,
            width: Math.round(element.getBoundingClientRect().width),
            height: Math.round(element.getBoundingClientRect().height),
          },
        },
        window.location.origin,
      );
    };

    const handlePointerUp = () => {
      if (resizeState) {
        const element = findEditableElementById(resizeState.id);
        if (element) {
          postSelectedToParent(element);
        }
      }

      dragState = null;
      resizeState = null;
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

    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!editorEnabled || !selectedId || isTypingTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key !== "delete" && key !== "backspace") {
        return;
      }

      event.preventDefault();
      window.parent.postMessage(
        {
          type: "cms-preview:editor:delete-selected",
          payload: {
            id: selectedId,
          },
        },
        window.location.origin,
      );
    };

    window.addEventListener("message", handler);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("message", handler);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
};
