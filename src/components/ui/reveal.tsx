"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

// Satu IntersectionObserver dipakai bersama oleh semua <Reveal>. Ini jauh lebih
// ringan daripada satu observer per elemen, terutama saat animasi berulang.
// Kelas di-toggle (bukan sekali lalu lepas) sehingga elemen beranimasi setiap
// kali masuk viewport — saat scroll ke bawah maupun ke atas.
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );
  return sharedObserver;
}

export function Reveal({
  children,
  className,
  delay,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = getSharedObserver();
    if (!observer) {
      // Tidak ada IntersectionObserver (browser lama / SSR): tampilkan statis.
      el.classList.add("is-visible");
      return;
    }
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
