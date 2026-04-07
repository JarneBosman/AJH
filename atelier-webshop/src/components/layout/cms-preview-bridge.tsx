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

interface OverlayRouteMessage {
  type: "cms-preview:route";
  payload: {
    path: string;
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
          type: "text" | "image" | "product" | "category";
          page?: "home" | "shop" | "configurator" | "cart";
          text?: string;
          imageUrl?: string;
          alt?: string;
          productId?: string;
          categoryId?: string;
          productName?: string;
          productCategory?: string;
          productSlug?: string;
          productSubtitle?: string;
          productLeadTime?: string;
          productPriceFrom?: string;
          productImageUrl?: string;
          categoryName?: string;
          categorySlug?: string;
          categoryImageUrl?: string;
          categoryDescription?: string;
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
    type: "text" | "image" | "product" | "category";
    text?: string;
    imageUrl?: string;
    alt?: string;
    backgroundColor?: string;
    backgroundShape?: "rounded-square" | "pill";
    productId?: string;
    categoryId?: string;
    productName?: string;
    productCategory?: string;
    productSlug?: string;
    productSubtitle?: string;
    productLeadTime?: string;
    productPriceFrom?: string;
    productImageUrl?: string;
    categoryName?: string;
    categorySlug?: string;
    categoryImageUrl?: string;
    categoryDescription?: string;
    page?: "home" | "shop" | "configurator" | "cart";
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

  const pathname = window.location.pathname;
  const currentPage = pathname.startsWith("/shop")
    ? "shop"
    : pathname.startsWith("/configurator")
      ? "configurator"
      : pathname.startsWith("/cart")
        ? "cart"
        : "home";

  const blocksForPage = blocks.filter((block) => (block.page ?? "home") === currentPage);

  container.replaceChildren();

  for (const block of blocksForPage) {
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
      continue;
    }

    if (block.type === "product") {
      const article = document.createElement("article");
      article.className =
        "group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-[0_20px_50px_-40px_rgba(0,0,0,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-35px_rgba(0,0,0,0.35)]";
      article.dataset.cmsEditable = `home.customBlock.${block.id}`;
      article.dataset.cmsEditTypes = "location";

      const link = document.createElement("a");
      link.href =
        block.productCategory?.trim() && block.productSlug?.trim()
          ? `/shop/${block.productCategory}/${block.productSlug}`
          : "#";

      const media = document.createElement("div");
      media.className = "relative h-64 overflow-hidden";
      if (block.productImageUrl?.trim()) {
        const image = document.createElement("img");
        image.src = block.productImageUrl;
        image.alt = block.productName?.trim() || "Product image";
        image.className = "h-full w-full object-cover transition duration-700 group-hover:scale-105";
        media.appendChild(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className =
          "flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]";
        placeholder.textContent = "Product image";
        media.appendChild(placeholder);
      }

      const body = document.createElement("div");
      body.className = "space-y-3 px-4 py-5 sm:px-6 sm:py-6";
      const meta = document.createElement("p");
      meta.className = "text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-wood)]";
      meta.textContent = block.productCategory?.trim() || "Product";
      const title = document.createElement("h3");
      title.className = "text-lg font-semibold tracking-tight text-[var(--color-ink)] sm:text-xl";
      title.textContent = block.productName?.trim() || `Product (${block.productId || "missing"})`;
      const subtitle = document.createElement("p");
      subtitle.className = "text-sm leading-6 text-[var(--color-muted)]";
      subtitle.textContent = block.productSubtitle?.trim() || "";
      const footer = document.createElement("div");
      footer.className = "flex items-center justify-between pt-2 text-sm";
      const price = document.createElement("span");
      price.className = "font-semibold text-[var(--color-ink)]";
      price.textContent = block.productPriceFrom ? `From ${block.productPriceFrom}` : "";
      const lead = document.createElement("span");
      lead.className = "text-[var(--color-muted)]";
      lead.textContent = block.productLeadTime?.trim() || "";
      if (price.textContent) {
        footer.appendChild(price);
      }
      if (lead.textContent) {
        footer.appendChild(lead);
      }

      body.appendChild(meta);
      body.appendChild(title);
      if (subtitle.textContent) {
        body.appendChild(subtitle);
      }
      if (footer.children.length > 0) {
        body.appendChild(footer);
      }
      link.appendChild(media);
      link.appendChild(body);
      article.appendChild(link);
      container.appendChild(article);
      continue;
    }

    if (block.type === "category") {
      const link = document.createElement("a");
      link.className = "group overflow-hidden rounded-3xl border border-black/5 bg-white transition hover:-translate-y-1";
      link.href = block.categorySlug?.trim() ? `/shop/${block.categorySlug}` : "#";
      link.dataset.cmsEditable = `home.customBlock.${block.id}`;
      link.dataset.cmsEditTypes = "location";

      const media = document.createElement("div");
      media.className = "relative h-48 overflow-hidden";
      if (block.categoryImageUrl?.trim()) {
        const image = document.createElement("img");
        image.src = block.categoryImageUrl;
        image.alt = block.categoryName?.trim() || "Category image";
        image.className = "h-full w-full object-cover transition duration-500 group-hover:scale-105";
        media.appendChild(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className =
          "flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-muted)]";
        placeholder.textContent = "Category image";
        media.appendChild(placeholder);
      }

      const body = document.createElement("div");
      body.className = "space-y-2 px-5 py-5";
      const title = document.createElement("h3");
      title.className = "text-lg font-semibold text-[var(--color-ink)]";
      title.textContent = block.categoryName?.trim() || `Category (${block.categoryId || "missing"})`;
      const description = document.createElement("p");
      description.className = "text-sm leading-6 text-[var(--color-muted)]";
      description.textContent = block.categoryDescription?.trim() || "";

      body.appendChild(title);
      if (description.textContent) {
        body.appendChild(description);
      }
      link.appendChild(media);
      link.appendChild(body);
      container.appendChild(link);
      continue;
    }
  }

  if (container.children.length === 0) {
    section.classList.add("hidden");
  } else {
    section.classList.remove("hidden");
  }
};

const syncHiddenEditableNodes = (ids: string[], attempt = 0) => {
  const hiddenSet = new Set(ids);

  const editableNodes = document.querySelectorAll<HTMLElement>("[data-cms-editable]");
  editableNodes.forEach((element) => {
    const editableId = element.dataset.cmsEditable;
    if (!editableId) {
      return;
    }

    if (hiddenSet.has(editableId)) {
      if (element.dataset.cmsHiddenByEditor !== "true") {
        element.dataset.cmsHiddenByEditor = "true";
        element.dataset.cmsHiddenDisplay = element.style.display;
      }
      element.style.display = "none";
      return;
    }

    if (element.dataset.cmsHiddenByEditor === "true") {
      const previousDisplay = element.dataset.cmsHiddenDisplay ?? "";
      if (previousDisplay) {
        element.style.display = previousDisplay;
      } else {
        element.style.removeProperty("display");
      }

      delete element.dataset.cmsHiddenByEditor;
      delete element.dataset.cmsHiddenDisplay;
    }
  });

  const missing = ids.some((id) => !findEditableElementById(id));
  if (missing && attempt < 6) {
    window.setTimeout(() => syncHiddenEditableNodes(ids, attempt + 1), 120);
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
          startWidth: number;
          startHeight: number;
          previousInlineTransition: string;
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
          previousInlineTransition: string;
        }
      | null = null;

    const beginDraggingElement = (element: HTMLElement) => {
      const previousInlineTransition = element.style.transition;
      element.style.transition = "none";
      element.classList.add("cms-dragging");
      return previousInlineTransition;
    };

    const endDraggingElement = (id: string, previousInlineTransition: string) => {
      const element = findEditableElementById(id);
      if (!element) {
        return;
      }

      element.classList.remove("cms-dragging");
      if (previousInlineTransition) {
        element.style.transition = previousInlineTransition;
      } else {
        element.style.removeProperty("transition");
      }
    };

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

    const postRouteToParent = () => {
      const message: OverlayRouteMessage = {
        type: "cms-preview:route",
        payload: {
          path: window.location.pathname || "/",
        },
      };

      window.parent.postMessage(message, window.location.origin);
    };

    let lastKnownPath = window.location.pathname || "/";
    const routeSyncTimer = window.setInterval(() => {
      const nextPath = window.location.pathname || "/";
      if (nextPath !== lastKnownPath) {
        lastKnownPath = nextPath;
        postRouteToParent();
      }
    }, 250);

    postRouteToParent();

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

        syncHiddenEditableNodes(ids);

        if (selectedId && ids.includes(selectedId)) {
          selectedId = null;
          updateEditorState();
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
        const previousInlineTransition = beginDraggingElement(selectedElement);
        resizeState = {
          id: selectedId,
          edges: resizeEdges,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startX: clampNumeric(Number(selectedElement.dataset.cmsX ?? "0")),
          startY: clampNumeric(Number(selectedElement.dataset.cmsY ?? "0")),
          startWidth: rect.width,
          startHeight: rect.height,
          previousInlineTransition,
        };

        event.preventDefault();
        return;
      }

      const previousInlineTransition = beginDraggingElement(selectedElement);
      dragState = {
        id: selectedId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startX: clampNumeric(Number(selectedElement.dataset.cmsX ?? "0")),
        startY: clampNumeric(Number(selectedElement.dataset.cmsY ?? "0")),
        startWidth: selectedElement.getBoundingClientRect().width,
        startHeight: selectedElement.getBoundingClientRect().height,
        previousInlineTransition,
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
          const finalX = clampNumeric(Number(element.dataset.cmsX ?? "0"));
          const finalY = clampNumeric(Number(element.dataset.cmsY ?? "0"));
          const finalRect = element.getBoundingClientRect();

          window.parent.postMessage(
            {
              type: "cms-preview:position-final",
              payload: {
                id: resizeState.id,
                beforeX: resizeState.startX,
                beforeY: resizeState.startY,
                beforeWidth: Math.round(resizeState.startWidth),
                beforeHeight: Math.round(resizeState.startHeight),
                afterX: finalX,
                afterY: finalY,
                afterWidth: Math.round(finalRect.width),
                afterHeight: Math.round(finalRect.height),
              },
            },
            window.location.origin,
          );

          postSelectedToParent(element);
        }

        endDraggingElement(resizeState.id, resizeState.previousInlineTransition);
      }

      if (dragState) {
        const element = findEditableElementById(dragState.id);
        if (element) {
          const finalX = clampNumeric(Number(element.dataset.cmsX ?? "0"));
          const finalY = clampNumeric(Number(element.dataset.cmsY ?? "0"));
          const finalRect = element.getBoundingClientRect();

          window.parent.postMessage(
            {
              type: "cms-preview:position-final",
              payload: {
                id: dragState.id,
                beforeX: dragState.startX,
                beforeY: dragState.startY,
                beforeWidth: Math.round(dragState.startWidth),
                beforeHeight: Math.round(dragState.startHeight),
                afterX: finalX,
                afterY: finalY,
                afterWidth: Math.round(finalRect.width),
                afterHeight: Math.round(finalRect.height),
              },
            },
            window.location.origin,
          );
        }

        endDraggingElement(dragState.id, dragState.previousInlineTransition);
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

      const modifierPressed = event.ctrlKey || event.metaKey;
      if (modifierPressed) {
        const isUndo = key === "z" && !event.shiftKey;
        const isRedo = (key === "z" && event.shiftKey) || key === "y";

        if (isUndo || isRedo) {
          event.preventDefault();
          event.stopPropagation();
          window.parent.postMessage(
            {
              type: "cms-preview:editor:shortcut",
              payload: {
                action: isUndo ? "undo" : "redo",
              },
            },
            window.location.origin,
          );
          return;
        }
      }

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
      window.clearInterval(routeSyncTimer);
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
