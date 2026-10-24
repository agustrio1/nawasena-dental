"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { ImageFigure } from "@/components/admin/ui/image-figure";
import {
  SlashCommand,
  SlashMenu,
  buildSlashItems,
  filterSlashItems,
  getMenuPosition,
  setSlashHandlers,
  type MenuPosition,
  type SlashItem,
  type SlashMenuProps,
} from "@/components/admin/ui/slash-command";
import { uploadImageAction } from "@/lib/actions/upload";

type SlashState = {
  items: SlashItem[];
  query: string;
  position: MenuPosition;
  command: (item: SlashItem) => void;
};

function imageFilesFromDataTransfer(dt: DataTransfer | null): File[] {
  if (!dt) return [];
  const fromFiles = Array.from(dt.files ?? []).filter((f) =>
    f.type.startsWith("image/")
  );
  if (fromFiles.length) return fromFiles;
  const fromItems = Array.from(dt.items ?? [])
    .filter((i) => i.kind === "file" && i.type.startsWith("image/"))
    .map((i) => i.getAsFile())
    .filter((f): f is File => f !== null);
  return fromItems;
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editorRef = React.useRef<Editor | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [, force] = React.useReducer((x: number) => x + 1, 0);

  // --- Menu slash: state + cermin ref (untuk dibaca handler keyboard) ------
  const [slash, setSlash] = React.useState<SlashState | null>(null);
  const [selected, setSelected] = React.useState(0);
  const slashRef = React.useRef<SlashState | null>(null);
  const selectedRef = React.useRef(0);

  React.useEffect(() => {
    slashRef.current = slash;
  }, [slash]);

  React.useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  // -----------------------------------------------------------------------

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  async function insertFile(file: File) {
    const ed = editorRef.current;
    if (!ed) return;
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadImageAction(fd);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    ed.chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src: result.secureUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          caption: "",
          align: "center",
          width: result.width,
        },
      })
      .run();
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      ImageFigure,
      SlashCommand,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "rich-content min-h-72 rounded-b-lg px-4 py-3 text-[15px] leading-7 text-charcoal outline-none",
      },
      handlePaste(_view, event) {
        const files = imageFilesFromDataTransfer(event.clipboardData);
        if (files.length) {
          event.preventDefault();
          files.forEach((f) => void insertFile(f));
          return true;
        }
        return false;
      },
      handleDrop(_view, event) {
        const files = imageFilesFromDataTransfer(event.dataTransfer);
        if (files.length) {
          event.preventDefault();
          files.forEach((f) => void insertFile(f));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current(e.getHTML());
    },
  });

  React.useEffect(() => {
    editorRef.current = editor ?? null;
  }, [editor]);

  React.useEffect(() => {
    if (!editor) return;
    const rerender = () => force();
    editor.on("selectionUpdate", rerender);
    return () => {
      editor.off("selectionUpdate", rerender);
    };
  }, [editor]);

  // Pasang handler menu slash setelah editor siap (aman menyentuh ref di sini).
  React.useEffect(() => {
    if (!editor) return;

    const items = buildSlashItems({
      onPickImage: () => fileRef.current?.click(),
    });

    function toState(p: SlashMenuProps): SlashState | null {
      const position = getMenuPosition(p.rect, containerRef.current);
      if (!position) return null;
      return {
        items: p.items,
        query: p.query,
        position,
        command: p.command,
      };
    }

    setSlashHandlers(editor, {
      getItems: (query) => filterSlashItems(items, query),
      onStart: (p) => {
        setSelected(0);
        setSlash(toState(p));
      },
      onUpdate: (p) => {
        if (slashRef.current?.query !== p.query) setSelected(0);
        setSlash(toState(p));
      },
      onKeyDown: (event) => {
        const current = slashRef.current;
        if (!current || current.items.length === 0) return false;
        const count = current.items.length;
        const index = Math.min(selectedRef.current, count - 1);

        if (event.key === "ArrowDown") {
          setSelected((index + 1) % count);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelected((index - 1 + count) % count);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          current.command(current.items[index]);
          return true;
        }
        return false;
      },
      onExit: () => {
        setSlash(null);
        setSelected(0);
      },
    });

    return () => setSlashHandlers(editor, null);
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-72 rounded-lg border border-line bg-ivory/50" />
    );
  }

  const btn =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-line px-2.5 text-xs font-medium text-charcoal transition-colors hover:bg-sage/40 disabled:cursor-not-allowed disabled:opacity-40";
  const activeBtn = "border-forest bg-forest text-white hover:bg-forest";
  const divider = "mx-1 h-5 w-px bg-line";

  const activeIndex = slash
    ? Math.min(selected, Math.max(slash.items.length - 1, 0))
    : 0;

  return (
    <div ref={containerRef} className="relative space-y-2">
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-line bg-ivory/50 p-1.5">
        <button
          type="button"
          title="Judul 2"
          aria-pressed={editor.isActive("heading", { level: 2 })}
          className={`${btn} ${editor.isActive("heading", { level: 2 }) ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </button>
        <button
          type="button"
          title="Judul 3"
          aria-pressed={editor.isActive("heading", { level: 3 })}
          className={`${btn} ${editor.isActive("heading", { level: 3 }) ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </button>
        <button
          type="button"
          title="Teks biasa"
          aria-pressed={editor.isActive("paragraph")}
          className={`${btn} ${editor.isActive("paragraph") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          &#182;
        </button>

        <span className={divider} aria-hidden="true" />

        <button
          type="button"
          title="Tebal"
          aria-pressed={editor.isActive("bold")}
          className={`${btn} ${editor.isActive("bold") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">B</span>
        </button>
        <button
          type="button"
          title="Miring"
          aria-pressed={editor.isActive("italic")}
          className={`${btn} ${editor.isActive("italic") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          title="Coret"
          aria-pressed={editor.isActive("strike")}
          className={`${btn} ${editor.isActive("strike") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </button>

        <span className={divider} aria-hidden="true" />

        <button
          type="button"
          title="Daftar poin"
          aria-pressed={editor.isActive("bulletList")}
          className={`${btn} ${editor.isActive("bulletList") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          &bull; List
        </button>
        <button
          type="button"
          title="Daftar angka"
          aria-pressed={editor.isActive("orderedList")}
          className={`${btn} ${editor.isActive("orderedList") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </button>
        <button
          type="button"
          title="Kutipan"
          aria-pressed={editor.isActive("blockquote")}
          className={`${btn} ${editor.isActive("blockquote") ? activeBtn : ""}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          &ldquo; Kutipan
        </button>

        <span className={divider} aria-hidden="true" />

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void insertFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          title="Sisipkan gambar"
          className={btn}
          onClick={() => fileRef.current?.click()}
        >
          + Gambar
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            title="Urungkan"
            aria-label="Urungkan"
            className={btn}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            &#8630;
          </button>
          <button
            type="button"
            title="Ulangi"
            aria-label="Ulangi"
            className={btn}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            &#8631;
          </button>
        </div>
      </div>

      <div className="rounded-b-lg border border-t-0 border-line bg-white">
        <EditorContent editor={editor} />
      </div>

      {slash && (
        <SlashMenu
          items={slash.items}
          selectedIndex={activeIndex}
          position={slash.position}
          onSelect={(item) => slash.command(item)}
          onHover={setSelected}
        />
      )}

      {error && <p className="text-xs text-error">{error}</p>}
      <p className="text-xs text-charcoal/50">
        Tip: ketik{" "}
        <kbd className="rounded border border-line bg-ivory px-1 font-mono text-[11px]">
          /
        </kbd>{" "}
        untuk menyisipkan blok (judul, daftar, kutipan, gambar). Klik gambar
        untuk memunculkan toolbar (perataan, lebar, hapus), atau tarik handle di
        tepi gambar untuk mengubah ukuran. Tarik/tempel (paste) gambar langsung
        ke area tulisan juga bisa.
      </p>
    </div>
  );
}