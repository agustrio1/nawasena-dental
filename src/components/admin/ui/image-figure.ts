import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { ImageFigureView } from "@/components/admin/ui/image-figure-view";

// Node gambar ala WordPress: <figure data-align="..."><img><figcaption>.
// Caption & alignment disimpan sebagai atribut; saat diedit di editor,
// dirender lewat NodeView (handle resize + toolbar blok). Output HTML tetap bersih.
export const ImageFigure = Node.create({
  name: "image",
  group: "block",
  atom: true,

  addNodeView() {
    return ReactNodeViewRenderer(ImageFigureView);
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      align: {
        default: "center",
        parseHTML: (element: HTMLElement) =>
          element.closest("figure")?.getAttribute("data-align") ?? "center",
      },
      caption: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent ??
          null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ node }) {
    const { src, alt, title, width, align, caption } = node.attrs;
    const imgAttrs: Record<string, string | number> = { src };
    if (alt != null) imgAttrs.alt = alt;
    if (title != null) imgAttrs.title = title;
    if (width) imgAttrs.width = width;

    const children: unknown[] = [["img", imgAttrs]];
    if (caption) children.push(["figcaption", {}, caption]);

    return ["figure", { "data-align": align ?? "center" }, ...children];
  },
});
