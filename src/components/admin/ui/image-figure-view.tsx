"use client";

import * as React from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

// Toolbar blok mengambang ala WordPress: muncul saat gambar dipilih.
// Resize bisa lewat handle sudut (mouse) atau preset lebar; alt & caption inline.
export function ImageFigureView({
  node,
  selected,
  editor,
  getPos,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const { src, alt, caption, width, align } = node.attrs as {
    src: string;
    alt: string | null;
    caption: string | null;
    width: number | null;
    align: "left" | "center" | "right";
  };

  const boxRef = React.useRef<HTMLDivElement>(null);

  function contentWidth(): number {
    return editor.view.dom.clientWidth || 720;
  }

  function currentWidth(): number {
    return (
      width ??
      Math.round(boxRef.current?.getBoundingClientRect().width ?? contentWidth())
    );
  }

  function selectNode() {
    const pos = getPos();
    if (typeof pos === "number") {
      editor.chain().focus().setNodeSelection(pos).run();
    }
  }

  // Drag handle: ubah lebar mengikuti gerakan mouse, jaga rasio (tinggi auto).
  function startResize(event: React.PointerEvent, dir: "left" | "right") {
    event.preventDefault();
    event.stopPropagation();
    selectNode();

    const startX = event.clientX;
    const startW = currentWidth();
    const maxW = contentWidth();

    const move = (ev: PointerEvent) => {
      const delta = dir === "right" ? ev.clientX - startX : startX - ev.clientX;
      const next = Math.max(80, Math.min(maxW, startW + delta));
      updateAttributes({ width: Math.round(next) });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function setWidthPreset(pct: number) {
    updateAttributes({ width: Math.round(contentWidth() * pct) });
  }

  const btn =
    "rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-sage/50";
  const btnActive = "bg-forest text-white hover:bg-forest";

  return (
    <NodeViewWrapper
      as="figure"
      data-align={align}
      data-selected={selected ? "true" : "false"}
      className="image-nodeview"
    >
      {selected && (
        <div
          className="image-toolbar"
          contentEditable={false}
          suppressContentEditableWarning
          onClick={(e) => e.stopPropagation()}
        >
          <span className="image-toolbar-group">
            {(["left", "center", "right"] as const).map((a) => (
              <button
                key={a}
                type="button"
                className={`${btn} ${align === a ? btnActive : ""}`}
                onClick={() => updateAttributes({ align: a })}
              >
                {a === "left" ? "Kiri" : a === "center" ? "Tengah" : "Kanan"}
              </button>
            ))}
          </span>

          <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />

          <span className="image-toolbar-group">
            {[0.25, 0.5, 0.75, 1].map((p) => (
              <button
                key={p}
                type="button"
                className={btn}
                onClick={() => setWidthPreset(p)}
                title={`Lebar ${Math.round(p * 100)}%`}
              >
                {Math.round(p * 100)}%
              </button>
            ))}
            <button
              type="button"
              className={btn}
              onClick={() => updateAttributes({ width: null })}
              title="Lebar penuh otomatis"
            >
              Auto
            </button>
          </span>

          <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />

          <button
            type="button"
            className={`${btn} text-error hover:bg-error/10`}
            onClick={deleteNode}
          >
            Hapus
          </button>
        </div>
      )}

      <div
        ref={boxRef}
        className="image-resize-box"
        style={{ width: width ? `${width}px` : "100%" }}
        onClick={selectNode}
      >
        <img src={src} alt={alt ?? ""} draggable={false} />

        {selected && (
          <>
            <button
              type="button"
              aria-label="Ubah lebar dari sisi kiri"
              className="image-handle image-handle-left"
              onPointerDown={(e) => startResize(e, "left")}
            />
            <button
              type="button"
              aria-label="Ubah lebar dari sisi kanan"
              className="image-handle image-handle-right"
              onPointerDown={(e) => startResize(e, "right")}
            />
          </>
        )}
      </div>

      <figcaption data-empty={!caption ? "true" : "false"}>
        {caption || "Tulis keterangan (opsional)…"}
      </figcaption>

      {selected && (
        <div
          className="image-fields"
          contentEditable={false}
          suppressContentEditableWarning
          onClick={(e) => e.stopPropagation()}
        >
          <label className="image-field">
            <span>Alt text</span>
            <input
              value={alt ?? ""}
              onChange={(e) => updateAttributes({ alt: e.target.value })}
              placeholder="Deskripsi gambar untuk aksesibilitas"
            />
          </label>
          <label className="image-field">
            <span>Caption</span>
            <input
              value={caption ?? ""}
              onChange={(e) => updateAttributes({ caption: e.target.value })}
              placeholder="mis. Ruang pemeriksaan Nawasena Dental Care"
            />
          </label>
        </div>
      )}
    </NodeViewWrapper>
  );
}
