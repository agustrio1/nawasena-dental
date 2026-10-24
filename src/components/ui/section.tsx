import { cn } from "@/lib/cn";
import { Container } from "./container";

type SectionTone = "default" | "alt";

export function Section({
  id,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        tone === "alt" && "border-t border-line bg-white/60",
        className
      )}
    >
      <Container className="py-16 md:py-20">{children}</Container>
    </section>
  );
}
