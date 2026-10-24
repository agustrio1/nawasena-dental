"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "./ui/dialog";

export type SearchItem = {
  group: string;
  title: string;
  href: string;
};

export function AdminCommand({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchItem[];
}) {
  const router = useRouter();

  const groups = React.useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    for (const item of items) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries());
  }, [items]);

  function navigate(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%] translate-y-0 overflow-hidden p-0">
        <DialogTitle>Cari di panel admin</DialogTitle>
        <Command>
          <div className="flex items-center border-b border-line px-3">
            <Search className="h-4 w-4 shrink-0 text-charcoal/50" />
            <Command.Input
              placeholder="Cari menu atau konten…"
              className="w-full bg-transparent px-3 py-3 text-sm text-charcoal outline-none placeholder:text-charcoal/45"
            />
          </div>
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-charcoal/60">
              Tidak ada hasil.
            </Command.Empty>
            {groups.map(([group, list]) => (
              <Command.Group
                key={group}
                heading={group}
                className="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wide **:[[cmdk-group-heading]]:text-charcoal/50"
              >
                {list.map((item) => (
                  <Command.Item
                    key={`${item.group}-${item.href}-${item.title}`}
                    onSelect={() => navigate(item.href)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-charcoal/85 data-[selected=true]:bg-sage data-[selected=true]:text-forest"
                  >
                    {item.title}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
