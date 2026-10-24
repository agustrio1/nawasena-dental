import type { Faq } from "@/lib/content";

// FAQ memakai <details>/<summary> native: tanpa JavaScript, keyboard-friendly,
// dan tetap menghormati prefers-reduced-motion (transisi dinonaktifkan global).
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="mt-8 divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.question} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-forest [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <span
              aria-hidden
              className="shrink-0 text-forest/50 transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-prose text-charcoal/80">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
