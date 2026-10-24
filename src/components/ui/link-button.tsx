import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "light" | "outlineLight";

const base =
  "inline-flex items-center justify-center rounded-site px-6 py-3 font-medium transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-ivory hover:bg-charcoal",
  secondary: "border border-line text-forest hover:border-forest hover:bg-sage",
  // Varian untuk ditempatkan di atas latar gelap (forest)
  light: "bg-ivory text-forest hover:bg-white",
  outlineLight: "border border-ivory/40 text-ivory hover:border-ivory",
};

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  const isExternal = href.startsWith("http");
  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(base, variants[variant], className)}
    >
      {children}
    </a>
  );
}
