import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory text-charcoal">
      <SiteHeader />
      <main id="konten">{children}</main>
      <SiteFooter />
    </div>
  );
}
