"use client";

import * as React from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion";
import {
  Heading2,
  Heading3,
  ImagePlus,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  type LucideIcon,
} from "lucide-react";

/* ---------------------------------------------------------------- */
/* Daftar blok                                                       */
/* ---------------------------------------------------------------- */

export type SlashItem = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon: LucideIcon;
  run: (args: { editor: Editor; range: Range }) => void;
};

export function buildSlashItems({
  onPickImage,
}: {
  onPickImage: () => void;
}): SlashItem[] {
  return [
    {
      id: "paragraph",
      title: "Teks biasa",
      description: "Paragraf teks polos.",
      keywords: ["paragraf", "teks", "text", "p"],
      icon: Pilcrow,
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      id: "h2",
      title: "Judul 2",
      description: "Judul bagian utama.",
      keywords: ["h2", "judul", "heading", "subjudul", "title"],
      icon: Heading2,
      run: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run(),
    },
    {
      id: "h3",
      title: "Judul 3",
      description: "Judul sub-bagian.",
      keywords: ["h3", "judul", "heading", "subjudul", "title"],
      icon: Heading3,
      run: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run(),
    },
    {
      id: "bullet",
      title: "Daftar poin",
      description: "Daftar dengan tanda titik.",
      keywords: ["list", "daftar", "poin", "bullet", "ul"],
      icon: List,
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      id: "ordered",
      title: "Daftar angka",
      description: "Daftar bernomor 1, 2, 3.",
      keywords: ["list", "daftar", "angka", "nomor", "ordered", "ol"],
      icon: ListOrdered,
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      id: "quote",
      title: "Kutipan",
      description: "Sorot kutipan atau catatan penting.",
      keywords: ["kutipan", "quote", "blockquote", "sitasi"],
      icon: Quote,
      run: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      id: "image",
      title: "Gambar",
      description: "Unggah gambar dari perangkat.",
      keywords: ["gambar", "foto", "image", "img", "upload", "unggah"],
      icon: ImagePlus,
      run: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).run();
        onPickImage();
      },
    },
  ];
}

export function filterSlashItems(all: SlashItem[], query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
  );
}

/* ---------------------------------------------------------------- */
/* Ekstensi Tiptap                                                   */
/* ---------------------------------------------------------------- */

export type SlashMenuProps = {
  items: SlashItem[];
  query: string;
  rect: DOMRect | null;
  command: (item: SlashItem) => void;
};

export type SlashHandlers = {
  getItems: (query: string) => SlashItem[];
  onStart: (props: SlashMenuProps) => void;
  onUpdate: (props: SlashMenuProps) => void;
  onKeyDown: (event: KeyboardEvent) => boolean;
  onExit: () => void;
};

type SlashStorage = { handlers: SlashHandlers | null };

function toMenuProps(
  props: SuggestionProps<SlashItem, SlashItem>
): SlashMenuProps {
  return {
    items: props.items,
    query: props.query,
    rect: props.clientRect?.() ?? null,
    command: (item) => props.command(item),
  };
}

// Handler tidak dikirim lewat opsi saat render, tetapi dipasang setelah editor
// dibuat lewat setSlashHandlers() (dipanggil dari useEffect di komponen editor).
export const SlashCommand = Extension.create<object, SlashStorage>({
  name: "slashCommand",

  addStorage() {
    return { handlers: null };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        pluginKey: new PluginKey("slashCommand"),
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return !$from.parent.type.spec.code;
        },
        items: ({ query }) => this.storage.handlers?.getItems(query) ?? [],
        command: ({ editor, range, props }) => {
          props.run({ editor, range });
        },
        render: () => ({
          onStart: (props) =>
            this.storage.handlers?.onStart(toMenuProps(props)),
          onUpdate: (props) =>
            this.storage.handlers?.onUpdate(toMenuProps(props)),
          onKeyDown: (props: SuggestionKeyDownProps) =>
            this.storage.handlers?.onKeyDown(props.event) ?? false,
          onExit: () => this.storage.handlers?.onExit(),
        }),
      }),
    ];
  },
});

export function setSlashHandlers(
  editor: Editor,
  handlers: SlashHandlers | null
) {
  const storage = editor.storage as unknown as { slashCommand?: SlashStorage };
  if (storage.slashCommand) storage.slashCommand.handlers = handlers;
}

/* ---------------------------------------------------------------- */
/* Posisi & tampilan menu                                            */
/* ---------------------------------------------------------------- */

const MENU_WIDTH = 288;

export type MenuPosition = { left: number; top?: number; bottom?: number };

// Posisi relatif terhadap container (yang harus `relative`), supaya menu ikut
// bergeser saat halaman di-scroll.
export function getMenuPosition(
  rect: DOMRect | null,
  container: HTMLElement | null
): MenuPosition | null {
  if (!rect || !container) return null;
  const c = container.getBoundingClientRect();
  const left = Math.max(0, Math.min(rect.left - c.left, c.width - MENU_WIDTH));
  const spaceBelow = window.innerHeight - rect.bottom;

  if (spaceBelow < 300 && rect.top > spaceBelow) {
    return { left, bottom: c.bottom - rect.top + 6 };
  }
  return { left, top: rect.bottom - c.top + 6 };
}

export function SlashMenu({
  items,
  selectedIndex,
  position,
  onSelect,
  onHover,
}: {
  items: SlashItem[];
  selectedIndex: number;
  position: MenuPosition;
  onSelect: (item: SlashItem) => void;
  onHover: (index: number) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <div
      role="listbox"
      aria-label="Sisipkan blok"
      style={{
        left: position.left,
        top: position.top,
        bottom: position.bottom,
        width: MENU_WIDTH,
      }}
      className="absolute z-30 max-w-[calc(100%-0.5rem)] overflow-hidden rounded-xl border border-line bg-white shadow-lg"
    >
      <div ref={listRef} className="max-h-72 overflow-y-auto p-1">
        {items.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-charcoal/55">
            Tidak ada blok yang cocok.
          </p>
        ) : (
          <>
            <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-charcoal/45">
              Sisipkan blok
            </p>
            {items.map((item, index) => {
              const Icon = item.icon;
              const active = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  data-active={active}
                  // mouseDown + preventDefault agar fokus editor tidak hilang
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(item);
                  }}
                  onMouseEnter={() => onHover(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active ? "bg-sage/50" : "hover:bg-sage/30"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-forest">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-forest">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-charcoal/55">
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}